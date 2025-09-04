from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from models import PotholeReport
import models
from services.database.connect import get_db
from services.cloudinary.service import CloudinaryService
from services.helpers.gencaseid import gen_case_id
from services.helpers.duplication import DuplicationService  # 🆕 Import duplication service
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
    # 🔍 DUPLICATE DETECTION - Check before processing
    duplicate_analysis = DuplicationService.check_duplicate_submission(
        db=db,
        user_id=current_user.id,
        latitude=latitude,
        longitude=longitude,
        radius_meters=100,
        base_severity="Low"
    )
    
    # 🚫 BLOCKING: Prevent user duplicate submissions
    if duplicate_analysis['is_blocked']:
        user_duplicate = duplicate_analysis['user_duplicates'][0]
        raise HTTPException(
            status_code=409,  # Conflict status code
            detail={
                "error": "Duplicate submission detected",
                "message": duplicate_analysis['summary_message'],
                "code": "DUPLICATE_SUBMISSION",
                "previous_report": user_duplicate['case_id'],
                "wait_hours": user_duplicate['remaining_hours'],
                "duplicate_details": user_duplicate
            }
        )
    
    # Generate case ID
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

    # Save report in DB with calculated priority and severity from duplication analysis
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
        severity=duplicate_analysis['calculated_severity'],  # 📊 Use calculated severity
        priority=duplicate_analysis['calculated_priority'],  # 📊 Use calculated priority
        similar_reports_count=duplicate_analysis['similar_count'],  # 📊 Store similar count
        date_created=datetime.utcnow(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # 🎉 Enhanced response with duplication info
    response_message = "Report submitted successfully!"
    if duplicate_analysis['similar_count'] > 0:
        response_message += f" Priority boosted to {duplicate_analysis['calculated_priority']} due to {duplicate_analysis['similar_count']} similar reports!"

    return {
        "message": response_message,
        "case_id": case_id,
        "priority": duplicate_analysis['calculated_priority'],
        "severity": duplicate_analysis['calculated_severity'],
        "similar_reports_found": duplicate_analysis['similar_count'],
        "unique_reporters": duplicate_analysis['unique_users'],
        "boost_reason": duplicate_analysis['boost_reason'],
        "duplicate_metadata": {
            "location_hash": duplicate_analysis['location_hash'],
            "similar_count": duplicate_analysis['similar_count'],
            "severity_multiplier": duplicate_analysis['severity_multiplier']
        }
    }


@router.get("/recent-submissions")
def get_recent_submissions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    reports = (
        db.query(PotholeReport)
        .filter(PotholeReport.user_id == current_user.id)
        .order_by(PotholeReport.date_created.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "case_id": report.case_id,
            "location": report.location,
            "date_created": report.date_created.strftime("%m/%d/%Y"),
            "similar_reports_count": getattr(report, 'similar_reports_count', 0),  # Safe access
            "status": report.status,
            "priority": getattr(report, 'priority', 'Medium'),  # 🆕 Include priority
            "severity": getattr(report, 'severity', 'Low'),     # 🆕 Include severity
        }
        for report in reports
    ]


# 🆕 OPTIONAL: Add endpoint to check duplicates before submission
@router.post("/check-duplicates")
def check_duplicates_preview(
    latitude: float = Form(...),
    longitude: float = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Optional endpoint to check duplicates before submission
    Frontend can call this to show warnings/info to users
    """
    duplicate_analysis = DuplicationService.check_duplicate_submission(
        db=db,
        user_id=current_user.id,
        latitude=latitude,
        longitude=longitude,
        radius_meters=100,
        base_severity="Low"
    )
    
    return {
        "can_submit": duplicate_analysis['can_submit'],
        "is_blocked": duplicate_analysis['is_blocked'],
        "user_duplicates_count": len(duplicate_analysis['user_duplicates']),
        "similar_reports_count": duplicate_analysis['similar_count'],
        "calculated_priority": duplicate_analysis['calculated_priority'],
        "calculated_severity": duplicate_analysis['calculated_severity'],
        "summary_message": duplicate_analysis['summary_message'],
        "boost_reason": duplicate_analysis['boost_reason'],
        "user_duplicates": duplicate_analysis['user_duplicates'][:3],  # Show max 3
        "similar_reports": duplicate_analysis['similar_reports'][:5],  # Show max 5
    }