# backend/routers/homepage.py
from __future__ import annotations
import math
import os
from datetime import datetime
from pathlib import Path
from typing import Optional, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, Query
from sqlalchemy.orm import Session

import models
from database.connect import get_db
from services.cloudinary.service import CloudinaryService
from auth.security import get_current_user

router = APIRouter(prefix="/homepage", tags=["Homepage"])

# --------- Helpers ---------
def _gen_case_id() -> str:
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    rand = os.urandom(3).hex().upper()
    return f"SRC-{ts}-{rand}"

def _nearby_reports_count(db: Session, lat: float, lon: float, radius_m: float = 30.0) -> int:
    """
    Approximate nearby count using a bounding box on lat/lon for small distances.
    """
    DEG_TO_M_LAT = 111_320.0
    DEG_TO_M_LON = 111_320.0 * math.cos(math.radians(lat))
    dlat = radius_m / DEG_TO_M_LAT
    dlon = radius_m / DEG_TO_M_LON

    return db.query(models.PotholeReport).filter(
        models.PotholeReport.location["latitude"].astext.cast(float).between(lat - dlat, lat + dlat),
        models.PotholeReport.location["longitude"].astext.cast(float).between(lon - dlon, lon + dlon),
    ).count()

def _compute_severity(db: Session, lat: float, lon: float,
                      length_cm: Optional[float], width_cm: Optional[float], depth_cm: Optional[float]) -> str:
    """
    Simple heuristic scorer you can later replace with your GenAI model output.
    Returns 'Low' | 'Medium' | 'High'.
    """
    score = 0.0

    # Size contribution
    if length_cm and width_cm:
        area = length_cm * width_cm  # cm^2
        score += min(area / 50.0, 60.0)  # cap
    if depth_cm:
        score += min(depth_cm * 5.0, 25.0)

    # Crowd signal: more nearby reports -> higher priority
    crowd = _nearby_reports_count(db, lat, lon, 30.0)
    score += min(crowd * 5.0, 15.0)

    if score >= 70:
        return "High"
    if score >= 40:
        return "Medium"
    return "Low"

# --------- Routes ---------
@router.post("/report")
async def submit_report(
    # required form fields
    email: str = Form(..., description="Reporter email (should match logged-in user)"),
    district: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(...),
    
    # optional
    remarks: Optional[str] = Form(None),

    # 3 required photos
    photo_top: UploadFile = File(...),
    photo_far: UploadFile = File(...),
    photo_close: UploadFile = File(...),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Create a pothole report.
    Uploads photos to Cloudinary, computes severity,
    and inserts into `pothole_reports`.
    """
    # Generate case ID
    case_id = _gen_case_id()

    # Prepare photos
    files_to_upload = [
        (photo_top, "top"),
        (photo_far, "far"),
        (photo_close, "close"),
    ]

    uploaded_photos = {}
    try:
        for file, image_type in files_to_upload:
            file_content = await file.read()

            upload_result = await CloudinaryService.upload_pothole_image(
                file_content=file_content,
                filename=file.filename,
                report_id=case_id,
                image_type=image_type
            )

            if not upload_result["success"]:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to upload {image_type} image: {upload_result.get('error')}"
                )

            uploaded_photos[image_type] = upload_result["secure_url"]

    except Exception as e:
        # cleanup in case of partial failure
        for image_type, url in uploaded_photos.items():
            public_id = url.split("/")[-1].split(".")[0]  # crude, depends on Cloudinary URL format
            await CloudinaryService.delete_image(public_id)
        raise e

    # Compute severity
    severity = _compute_severity(db, latitude, longitude, length_cm, width_cm, depth_cm)

    # Initial status
    status = "Submitted"

    # Build JSONB fields
    photos_json = uploaded_photos
    location_json = {
        "latitude": latitude,
        "longitude": longitude,
        "address": address,
        "road_name": road_name,
        "length_cm": length_cm,
        "width_cm": width_cm,
        "depth_cm": depth_cm,
        "remarks": remarks,
    }

    # Save report
    record = models.PotholeReport(
        case_id=case_id,
        email=email,
        photos=photos_json,
        location=location_json,
        district=district,
        severity=severity,
        status=status,
        date_created=datetime.utcnow(),
        last_date_status_update=datetime.utcnow(),
    )

    db.add(record)
    db.commit()

    return {
        "message": "Report submitted",
        "case_id": case_id,
        "severity": severity,
        "status": status,
        "photos": photos_json,
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "address": address,
            "road_name": road_name,
        },
        "district": district,
    }

@router.get("/my-reports")
def list_user_reports(
    email: str = Query(..., description="User email to fetch report history"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Return minimal history for the logged-in user.
    """
    rows = (
        db.query(models.PotholeReport)
        .filter(models.PotholeReport.email == email)
        .order_by(models.PotholeReport.date_created.desc())
        .all()
    )

    return [
        {
            "case_id": r.case_id,
            "district": r.district,
            "severity": r.severity,
            "status": r.status,
            "date_created": r.date_created,
            "last_date_status_update": r.last_date_status_update,
            "location": {
                "latitude": r.location.get("latitude"),
                "longitude": r.location.get("longitude"),
                "address": r.location.get("address"),
                "road_name": r.location.get("road_name"),
            },
            "photos": {
                "top": r.photos.get("top"),
                "far": r.photos.get("far"),
                "close": r.photos.get("close"),
            },
        }
        for r in rows
    ]
