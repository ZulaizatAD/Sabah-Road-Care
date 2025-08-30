# backend/routers/homepage.py
from __future__ import annotations
import os
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session

import models
from database.connect import get_db
from auth.security import get_current_user
from services.cloudinary.service import CloudinaryService
from services.ai.pothole_analyzer import pothole_analyzer

router = APIRouter(prefix="/homepage", tags=["Homepage"])

# --------- Helpers ---------
def _gen_case_id() -> str:
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    rand = os.urandom(3).hex().upper()
    return f"SRC-{ts}-{rand}"

async def process_ai_analysis(
    case_id: str,
    top_image: bytes,
    far_image: bytes,
    close_image: bytes,
    latitude: float,
    longitude: float,
    report_text: Optional[str]
    # ✅ REMOVED: db: Session parameter
):
    """Background task to process AI analysis"""
    
    # ✅ CREATE NEW SESSION in background task
    from database.connect import SessionLocal
    db = SessionLocal()
    
    try:
        print(f"🔍 Starting background AI analysis for case {case_id}")
        
        # Run AI priority analysis
        ai_result = await pothole_analyzer.analyze_pothole_priority(
            top_image=top_image,
            far_image=far_image,
            close_image=close_image,
            case_id=case_id,
            report_text=report_text,
            latitude=latitude,
            longitude=longitude,
            db=db  # Use new session
        )
        
        # Update database with AI results
        report = db.query(models.PotholeReport).filter(
            models.PotholeReport.case_id == case_id
        ).first()
        
        if report:
            # Update all AI fields
            measurements = ai_result.get("measurements", {})
            
            report.severity = ai_result["base_severity"]
            report.priority = ai_result["final_priority"]
            report.ai_analysis_completed = True
            report.ai_confidence = ai_result.get("confidence", 0.0)
            report.pothole_length_cm = measurements.get("length_cm")
            report.pothole_width_cm = measurements.get("width_cm")
            report.pothole_depth_cm = measurements.get("depth_cm")
            report.similar_reports_count = ai_result["similar_reports"]
            report.unique_users_count = ai_result["unique_users"]
            report.community_multiplier = ai_result["community_multiplier"]
            report.ai_analysis_details = ai_result.get("analysis_details")
            report.last_date_status_update = datetime.utcnow()
            
            db.commit()
            
            print(f"✅ AI analysis completed for {case_id}:")
            print(f"   Severity: {ai_result['base_severity']}")
            print(f"   Priority: {ai_result['final_priority']}")
            print(f"   Community: {ai_result['similar_reports']} reports, {ai_result['unique_users']} users")
            
    except Exception as e:
        print(f"❌ Background AI analysis failed for {case_id}: {str(e)}")
        
        # Update record to show AI failed
        try:
            report = db.query(models.PotholeReport).filter(
                models.PotholeReport.case_id == case_id
            ).first()
            if report:
                report.severity = "Medium"  # Fallback severity
                report.priority = "Medium"  # Fallback priority
                report.ai_analysis_completed = True  # Mark as completed (with fallback)
                report.ai_confidence = 0.0
                db.commit()
        except Exception as db_error:
            print(f"❌ Failed to update database after AI error: {db_error}")
    
    finally:
        # ✅ CLOSE NEW SESSION
        db.close()

# --------- Routes ---------
@router.post("/report")
async def submit_report(
    background_tasks: BackgroundTasks,
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

    # Store image data for AI analysis
    image_data = {}
    uploaded = {}
    
    try:
        # Process each image: store data for AI + upload to Cloudinary
        for file, label in [
            (photo_top, "top"),
            (photo_far, "far"),
            (photo_close, "close"),
        ]:
            file_content = await file.read()
            image_data[label] = file_content  # Store for AI analysis
            
            # Upload to Cloudinary for storage
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
        # Cleanup uploaded images on failure
        for url in uploaded.values():
            public_id = url.split("/")[-1].split(".")[0]
            await CloudinaryService.delete_image(public_id)
        raise e

    # Create database record with initial AI status
    record = models.PotholeReport(
        case_id=case_id,
        email=current_user.email,
        user_id=current_user.id,
        district=district,
        location=address,  # Store as string (updated model)
        latitude=latitude,
        longitude=longitude,
        description=remarks,
        photo_top=uploaded["top"],
        photo_far=uploaded["far"],
        photo_close=uploaded["close"],
        
        # Initial status while AI processes
        severity="Analyzing",
        status="Submitted",
        priority="Medium",
        
        # AI fields with initial values
        ai_analysis_completed=False,
        ai_confidence=0.0,
        pothole_length_cm=None,
        pothole_width_cm=None,
        pothole_depth_cm=None,
        similar_reports_count=0,
        unique_users_count=0,
        community_multiplier=1.0,
        ai_analysis_details=None,
        
        # Timestamps
        date_created=datetime.utcnow(),
        last_date_status_update=datetime.utcnow()
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    # Start AI analysis in background
    background_tasks.add_task(
        process_ai_analysis,
        case_id,
        image_data["top"],
        image_data["far"],
        image_data["close"],
        latitude,
        longitude,
        remarks,
        db
    )

    return {
        "message": "Report submitted successfully. AI analysis in progress.",
        "case_id": case_id,
        "status": "AI analysis will complete shortly",
        "estimated_completion": "30-60 seconds"
    }

@router.get("/my-reports")
def list_user_reports(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get user's reports with AI analysis status"""
    reports = (
        db.query(models.PotholeReport)
        .filter(models.PotholeReport.user_id == current_user.id)
        .order_by(models.PotholeReport.date_created.desc())
        .all()
    )

    return [
        {
            "case_id": r.case_id,
            "district": r.district,
            "severity": r.severity,
            "priority": r.priority,  # Added priority field
            "status": r.status,
            "date_created": r.date_created,
            "last_date_status_update": r.last_date_status_update,
            "location": {
                "latitude": r.latitude, 
                "longitude": r.longitude,
                "address": r.location  # Updated for string location
            },
            "photos": {
                "top": r.photo_top, 
                "far": r.photo_far, 
                "close": r.photo_close
            },
            "remarks": r.description,
            "ai_analysis": {
                "completed": r.ai_analysis_completed,
                "confidence": r.ai_confidence,
                "measurements": {
                    "length_cm": r.pothole_length_cm,
                    "width_cm": r.pothole_width_cm,
                    "depth_cm": r.pothole_depth_cm
                } if r.ai_analysis_completed else None,
                "community_data": {
                    "similar_reports": r.similar_reports_count,
                    "unique_users": r.unique_users_count,
                    "multiplier": r.community_multiplier
                } if r.ai_analysis_completed else None
            }
        }
        for r in reports
    ]

@router.get("/report/{case_id}/ai-status")
def get_ai_analysis_status(
    case_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Check AI analysis status for a specific report"""
    report = db.query(models.PotholeReport).filter(
        models.PotholeReport.case_id == case_id,
        models.PotholeReport.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {
        "case_id": case_id,
        "ai_analysis_completed": report.ai_analysis_completed,
        "severity": report.severity,
        "priority": report.priority,
        "confidence": report.ai_confidence,
        "last_updated": report.last_date_status_update,
        "measurements": {
            "length_cm": report.pothole_length_cm,
            "width_cm": report.pothole_width_cm,
            "depth_cm": report.pothole_depth_cm
        } if report.ai_analysis_completed else None
    }

@router.get("/reports/pending-ai")
def get_pending_ai_reports(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get reports that are still being analyzed by AI"""
    pending_reports = db.query(models.PotholeReport).filter(
        models.PotholeReport.user_id == current_user.id,
        models.PotholeReport.ai_analysis_completed == False
    ).all()
    
    return {
        "pending_count": len(pending_reports),
        "reports": [
            {
                "case_id": r.case_id,
                "submitted_at": r.date_created,
                "status": "Analyzing"
            }
            for r in pending_reports
        ]
    }

@router.get("/recentsubmission")
def get_recent_submissions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    recent_reports = db.query(models.PotholeReport).filter(
        models.PotholeReport.user_id == current_user.id
    ).order_by(
        models.PotholeReport.date_created.desc()
    ).limit(5).all()
    
    return {
        "recent_submissions": [
            {
                "report_id": r.case_id,  # SRC-20241201123456-ABC123
                "location": r.location,  # Jalan Tuaran, Kota Kinabalu
                "submission_date": r.date_created.strftime("%m/%d/%Y"),  # 1/15/2025
                "status": r.status,  # Submitted, Under Review, etc.
                "similar_reports_count": r.similar_reports_count  # 3
            }
            for r in recent_reports
        ]
    }