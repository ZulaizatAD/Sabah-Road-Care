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

router = APIRouter()

# Where uploaded images are stored (relative to repo root)
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# --------- Helpers ---------
def _gen_case_id() -> str:
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    rand = os.urandom(3).hex().upper()
    return f"SRC-{ts}-{rand}"

def _save_photo(file: UploadFile, case_id: str, slot: str) -> str:
    """
    Save an UploadFile to uploads/<case_id>/<slot>_<orig_name>.
    Returns the relative path as string.
    """
    if not file:
        raise HTTPException(status_code=400, detail=f"Missing required photo: {slot}")

    case_dir = UPLOAD_DIR / case_id
    case_dir.mkdir(parents=True, exist_ok=True)

    safe_name = f"{slot}_{file.filename}".replace(" ", "_")
    dest = case_dir / safe_name

    # stream to disk
    with dest.open("wb") as f:
        f.write(file.file.read())

    return str(dest.as_posix())

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

@router.post("/homepage/report")
async def submit_report(
    # required form fields
    email: str = Form(..., description="Reporter email (should match logged-in user)"),
    district: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(...),
    road_name: str = Form(...),

    # optional
    remarks: Optional[str] = Form(None),
    length_cm: Optional[float] = Form(None),
    width_cm: Optional[float] = Form(None),
    depth_cm: Optional[float] = Form(None),

    # 3 required photos
    photo_top: UploadFile = File(...),
    photo_far: UploadFile = File(...),
    photo_close: UploadFile = File(...),

    db: Session = Depends(get_db),
):
    """
    Create a pothole report. Stores photos, builds JSONB payloads, computes severity,
    and inserts into `pothole_reports`.
    """
    # Generate ID and persist photos
    case_id = _gen_case_id()
    top_path = _save_photo(photo_top, case_id, "top")
    far_path = _save_photo(photo_far, case_id, "far")
    close_path = _save_photo(photo_close, case_id, "close")

    # Compute severity (swap with real AI later)
    severity = _compute_severity(db, latitude, longitude, length_cm, width_cm, depth_cm)

    # Initial status
    status = "Submitted"  # or "Pending Review"

    # Build JSONB fields
    photos_json = {
        "top": top_path,
        "far": far_path,
        "close": close_path,
    }
    location_json = {
        "latitude": latitude,
        "longitude": longitude,
        "address": address,
        "road_name": road_name,
        # keep optional UI metadata inside location JSONB
        "length_cm": length_cm,
        "width_cm": width_cm,
        "depth_cm": depth_cm,
        "remarks": remarks,
    }

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


@router.get("/homepage/my-reports")
def list_user_reports(
    email: str = Query(..., description="User email to fetch report history"),
    db: Session = Depends(get_db),
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
