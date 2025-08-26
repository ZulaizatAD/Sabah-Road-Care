# backend/routers/homepage.py
from __future__ import annotations
import os
import random
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, Query
from sqlalchemy.orm import Session

import models
from database.connect import get_db
from auth.security import get_current_user
from services.cloudinary.service import CloudinaryService

router = APIRouter(prefix="/homepage", tags=["Homepage"])

# --------- Helpers ---------
def _gen_case_id() -> str:
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    rand = os.urandom(3).hex().upper()
    return f"SRC-{ts}-{rand}"

def _random_severity() -> str:
    """Temporary severity before AI integration"""
    return random.choice(["Low", "Medium", "High"])

# --------- Routes ---------
@router.post("/report")
async def submit_report(
    district: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(...),
    remarks: Optional[str] = Form(None),

    photo_top: UploadFile = File(...),
    photo_far: UploadFile = File(...),
    photo_close: UploadFile = File(...),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    case_id = _gen_case_id()

    uploaded = {}
    try:
        for file, label in [
            (photo_top, "top"),
            (photo_far, "far"),
            (photo_close, "close"),
        ]:
            file_content = await file.read()
            upload_result = await CloudinaryService.upload_pothole_image(
                file_content=file_content,
                filename=file.filename,
                image_type=label,
                case_id=case_id
            )
            if not upload_result["success"]:
                raise HTTPException(status_code=500, detail=f"Failed to upload {label} image")
            uploaded[label] = upload_result["secure_url"]
    except Exception as e:
        for url in uploaded.values():
            public_id = url.split("/")[-1].split(".")[0]
            await CloudinaryService.delete_image(public_id)
        raise e

    record = models.PotholeReport(
        case_id=case_id,
        email=current_user.email,   # ✅ no need to pass separately
        district=district,
        location=address,
        date_created=datetime.utcnow(),
        last_date_status_update=datetime.utcnow(),
        severity=_random_severity(),
        status="Under Review",
        latitude=latitude,
        longitude=longitude,
        photo_top=uploaded.get("top"),
        photo_far=uploaded.get("far"),
        photo_close=uploaded.get("close"),
        description=remarks,
        user_id=current_user.id,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {"message": "Report submitted", "case_id": record.case_id}


@router.get("/my-reports")
def list_user_reports(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    rows = (
        db.query(models.PotholeReport)
        .filter(models.PotholeReport.user_id == current_user.id)  # ✅ use user_id
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
            "location": {"latitude": r.latitude, "longitude": r.longitude},
            "photos": {"top": r.photo_top, "far": r.photo_far, "close": r.photo_close},
            "remarks": r.description,
        }
        for r in rows
    ]
