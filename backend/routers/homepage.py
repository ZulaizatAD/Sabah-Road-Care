from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from models import PotholeReport
import models
from services.database.connect import get_db
from services.cloudinary.service import CloudinaryService
from services.helpers.gencaseid import gen_case_id   # <-- new import
from services.auth.security import get_current_user

router = APIRouter()


@router.post("/report")
async def submit_report(
    district: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(...),
    remarks: str = Form(None),
    photo_top: UploadFile = File(...),
    photo_far: UploadFile = File(...),
    photo_close: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    case_id = gen_case_id(district, db)

    # Upload images to Cloudinary
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
        # cleanup in case some uploaded
        for url in uploaded.values():
            public_id = url.split("/")[-1].split(".")[0]
            await CloudinaryService.delete_image(public_id)
        raise e

    # Save report in DB
    report = models.PotholeReport(
        case_id=case_id,
        district=district,
        latitude=latitude,
        longitude=longitude,
        location=address,
        description=remarks,
        email=current_user.email,
        user_id=current_user.id,
        photo_top=uploaded["top"],
        photo_far=uploaded["far"],
        photo_close=uploaded["close"],
        status="Submitted",
        severity="Analyzing",
        priority="Medium",
        date_created=datetime.utcnow(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {"message": "Report submitted", "case_id": case_id}

@router.get("/recent-submissions")
def get_recent_submissions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)  # fetch reports for logged-in user
):
    reports = (
        db.query(PotholeReport)
        .filter(PotholeReport.user_id == current_user.id)  # only their reports
        .order_by(PotholeReport.date_created.desc())      # latest first
        .limit(10)                                        # show last 10
        .all()
    )

    return [
        {
            "case_id": report.case_id,
            "location": report.location,
            "date_created": report.date_created.strftime("%m/%d/%Y"),
            "similar_reports_count": report.similar_reports_count,
            "status": report.status,
        }
        for report in reports
    ]
