from __future__ import annotations

import asyncio
import os
from datetime import datetime, timedelta
from typing import Dict, List, Literal, Optional
from urllib.request import urlopen

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from auth.security import get_current_user
from database.connect import get_db
from services.ai.pothole_analyzer import pothole_analyzer
from services.cloudinary.service import CloudinaryService
from services.reports.report_query_service import (
    haversine_meters,
    query_nearby_reports,
    query_user_reports,
)
from services.storage.supabase_service import SupabaseStorageService


router = APIRouter(prefix="/homepage", tags=["Homepage"])

REQUIRED_IMAGE_SLOTS = ("top", "far", "close")
PENDING_AI_STATUSES = ("WAITING_UPLOAD", "QUEUED", "PROCESSING", "RETRYING")
AI_MAX_ATTEMPTS = int(os.getenv("AI_MAX_ATTEMPTS", "3"))
AI_RETRY_BASE_SECONDS = int(os.getenv("AI_RETRY_BASE_SECONDS", "5"))


class ReportInitRequest(BaseModel):
    district: str
    latitude: float
    longitude: float
    address: str = ""
    remarks: Optional[str] = None
    description: Optional[str] = None


class UploadUrlItem(BaseModel):
    slot: Literal["top", "far", "close"]
    filename: str


class UploadUrlsRequest(BaseModel):
    files: List[UploadUrlItem]


class ReportCompleteRequest(BaseModel):
    photo_top: str
    photo_far: str
    photo_close: str
    remarks: Optional[str] = None
    description: Optional[str] = None
    queue_ai: bool = True


class TriggerAIRequest(BaseModel):
    force: bool = False


def _gen_case_id() -> str:
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    rand = os.urandom(3).hex().upper()
    return f"SRC-{ts}-{rand}"


def _serialize_ai_job(job: Optional[models.AIJob]) -> dict:
    if not job:
        return {
            "id": None,
            "status": "UNKNOWN",
            "attempts": 0,
            "max_attempts": 0,
            "error_message": None,
            "queued_at": None,
            "started_at": None,
            "finished_at": None,
            "next_retry_at": None,
        }
    return {
        "id": job.id,
        "status": job.status,
        "attempts": job.attempts,
        "max_attempts": job.max_attempts,
        "error_message": job.error_message,
        "queued_at": job.queued_at,
        "started_at": job.started_at,
        "finished_at": job.finished_at,
        "next_retry_at": job.next_retry_at,
    }


def _extract_location(location_field, latitude: float, longitude: float) -> dict:
    if isinstance(location_field, dict):
        return {
            "latitude": location_field.get("latitude", latitude),
            "longitude": location_field.get("longitude", longitude),
            "address": location_field.get("address", ""),
            "remarks": location_field.get("remarks", ""),
        }
    return {
        "latitude": latitude,
        "longitude": longitude,
        "address": location_field or "",
        "remarks": "",
    }


def _resolve_photo_uploads(
    *,
    photo_top: Optional[UploadFile],
    photo_far: Optional[UploadFile],
    photo_close: Optional[UploadFile],
    photo_1: Optional[UploadFile],
    photo_2: Optional[UploadFile],
    photo_3: Optional[UploadFile],
) -> Dict[str, UploadFile]:
    files = {
        "top": photo_top or photo_1,
        "far": photo_far or photo_2,
        "close": photo_close or photo_3,
    }
    missing = [slot for slot, upload in files.items() if upload is None]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Missing photo file(s): {', '.join(missing)}",
        )
    return files


def _download_image_bytes_sync(url: str) -> bytes:
    with urlopen(url, timeout=25) as response:
        return response.read()


async def _queue_ai_from_report_urls(
    job_id: int,
    case_id: str,
    top_url: str,
    far_url: str,
    close_url: str,
    latitude: float,
    longitude: float,
    report_text: Optional[str],
):
    from database.connect import SessionLocal

    try:
        top_bytes, far_bytes, close_bytes = await asyncio.gather(
            asyncio.to_thread(_download_image_bytes_sync, top_url),
            asyncio.to_thread(_download_image_bytes_sync, far_url),
            asyncio.to_thread(_download_image_bytes_sync, close_url),
        )
    except Exception as exc:
        db = SessionLocal()
        try:
            job = db.query(models.AIJob).filter(models.AIJob.id == job_id).first()
            report = (
                db.query(models.PotholeReport)
                .filter(models.PotholeReport.case_id == case_id)
                .first()
            )
            if job:
                job.status = "FAILED"
                job.error_message = f"Failed to fetch image from storage: {str(exc)[:900]}"
                job.finished_at = datetime.utcnow()
                job.next_retry_at = None
            if report:
                report.ai_analysis_completed = True
                report.ai_confidence = 0.0
                report.severity = "Medium"
                report.priority = "Medium"
                report.ai_analysis_details = {
                    "error": "storage_download_failed",
                    "fallback": True,
                }
                report.last_date_status_update = datetime.utcnow()
            db.commit()
        finally:
            db.close()
        return

    await process_ai_job(
        job_id=job_id,
        case_id=case_id,
        top_image=top_bytes,
        far_image=far_bytes,
        close_image=close_bytes,
        latitude=latitude,
        longitude=longitude,
        report_text=report_text,
    )


async def process_ai_job(
    job_id: int,
    case_id: str,
    top_image: bytes,
    far_image: bytes,
    close_image: bytes,
    latitude: float,
    longitude: float,
    report_text: Optional[str],
):
    from database.connect import SessionLocal

    db = SessionLocal()
    try:
        while True:
            job = db.query(models.AIJob).filter(models.AIJob.id == job_id).first()
            report = (
                db.query(models.PotholeReport)
                .filter(models.PotholeReport.case_id == case_id)
                .first()
            )
            if not job or not report:
                return

            job.status = "PROCESSING"
            job.attempts += 1
            job.started_at = datetime.utcnow()
            job.error_message = None
            job.next_retry_at = None
            db.commit()

            try:
                ai_result = await pothole_analyzer.analyze_pothole_priority(
                    top_image=top_image,
                    far_image=far_image,
                    close_image=close_image,
                    case_id=case_id,
                    report_text=report_text,
                    latitude=latitude,
                    longitude=longitude,
                    db=db,
                )

                measurements = ai_result.get("measurements", {})
                report.severity = ai_result.get("base_severity", "Medium")
                report.priority = ai_result.get("final_priority", "Medium")
                report.status = "Under Review"
                report.ai_analysis_completed = True
                report.ai_confidence = ai_result.get("confidence", 0.0)
                report.pothole_length_cm = measurements.get("length_cm")
                report.pothole_width_cm = measurements.get("width_cm")
                report.pothole_depth_cm = measurements.get("depth_cm")
                report.similar_reports_count = ai_result.get("similar_reports", 0)
                report.unique_users_count = ai_result.get("unique_users", 0)
                report.community_multiplier = ai_result.get("community_multiplier", 1.0)
                report.ai_analysis_details = ai_result.get("analysis_details")
                report.last_date_status_update = datetime.utcnow()

                job.status = "COMPLETED"
                job.finished_at = datetime.utcnow()
                job.next_retry_at = None
                db.commit()
                return
            except Exception as exc:
                should_retry = job.attempts < job.max_attempts
                error_message = str(exc)[:1000]

                if should_retry:
                    delay_seconds = min(
                        60,
                        AI_RETRY_BASE_SECONDS * (2 ** (job.attempts - 1)),
                    )
                    job.status = "RETRYING"
                    job.error_message = error_message
                    job.next_retry_at = datetime.utcnow() + timedelta(seconds=delay_seconds)
                    db.commit()
                    await asyncio.sleep(delay_seconds)
                    continue

                report.severity = "Medium"
                report.priority = "Medium"
                report.ai_analysis_completed = True
                report.ai_confidence = 0.0
                report.ai_analysis_details = {
                    "error": error_message,
                    "fallback": True,
                }
                report.last_date_status_update = datetime.utcnow()

                job.status = "FAILED"
                job.error_message = error_message
                job.finished_at = datetime.utcnow()
                job.next_retry_at = None
                db.commit()
                return
    finally:
        db.close()


@router.post("/report/init")
def init_report(
    payload: ReportInitRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    case_id = _gen_case_id()
    report_text = payload.remarks or payload.description

    record = models.PotholeReport(
        case_id=case_id,
        email=current_user.email,
        user_id=current_user.id,
        district=payload.district,
        location={
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "address": payload.address,
            "remarks": report_text or "",
        },
        latitude=payload.latitude,
        longitude=payload.longitude,
        description=report_text,
        severity="Awaiting Upload",
        status="Draft",
        priority="Medium",
        ai_analysis_completed=False,
        ai_confidence=0.0,
        pothole_length_cm=None,
        pothole_width_cm=None,
        pothole_depth_cm=None,
        similar_reports_count=0,
        unique_users_count=0,
        community_multiplier=1.0,
        ai_analysis_details=None,
        date_created=datetime.utcnow(),
        last_date_status_update=datetime.utcnow(),
    )
    db.add(record)

    ai_job = models.AIJob(
        case_id=case_id,
        status="WAITING_UPLOAD",
        attempts=0,
        max_attempts=AI_MAX_ATTEMPTS,
    )
    db.add(ai_job)
    db.commit()
    db.refresh(ai_job)

    return {
        "message": "Draft report created. Upload images to continue.",
        "case_id": case_id,
        "ai_queue": _serialize_ai_job(ai_job),
        "required_images": list(REQUIRED_IMAGE_SLOTS),
    }


@router.post("/report/{case_id}/upload-urls")
async def create_report_upload_urls(
    case_id: str,
    payload: UploadUrlsRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not SupabaseStorageService.is_configured():
        raise HTTPException(
            status_code=503,
            detail=(
                "Supabase storage is not configured. "
                "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
            ),
        )

    report = (
        db.query(models.PotholeReport)
        .filter(
            models.PotholeReport.case_id == case_id,
            models.PotholeReport.user_id == current_user.id,
        )
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not payload.files:
        raise HTTPException(status_code=400, detail="No files requested")

    slots_seen = set()
    uploads = []
    for file_spec in payload.files:
        if file_spec.slot in slots_seen:
            raise HTTPException(
                status_code=400,
                detail=f"Duplicate upload slot requested: {file_spec.slot}",
            )
        slots_seen.add(file_spec.slot)
        result = await SupabaseStorageService.create_signed_upload_url(
            case_id=case_id,
            image_slot=file_spec.slot,
            filename=file_spec.filename,
        )
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create upload URL for {file_spec.slot}: {result.get('error')}",
            )
        uploads.append(
            {
                "slot": file_spec.slot,
                "filename": file_spec.filename,
                "bucket": result.get("bucket"),
                "object_path": result.get("object_path"),
                "signed_url": result.get("signed_url"),
                "token": result.get("token"),
                "public_url": result.get("public_url"),
            }
        )

    return {
        "case_id": case_id,
        "uploads": uploads,
        "required_images": list(REQUIRED_IMAGE_SLOTS),
    }


@router.post("/report/{case_id}/complete")
async def complete_report_submission(
    case_id: str,
    payload: ReportCompleteRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    report = (
        db.query(models.PotholeReport)
        .filter(
            models.PotholeReport.case_id == case_id,
            models.PotholeReport.user_id == current_user.id,
        )
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    ai_job = report.ai_job
    if ai_job is None:
        ai_job = models.AIJob(
            case_id=case_id,
            status="WAITING_UPLOAD",
            attempts=0,
            max_attempts=AI_MAX_ATTEMPTS,
        )
        db.add(ai_job)
        db.flush()

    report_text = payload.remarks or payload.description
    location = _extract_location(report.location, report.latitude, report.longitude)
    location["remarks"] = report_text or location.get("remarks", "")

    report.location = location
    report.description = report_text
    report.photo_top = payload.photo_top
    report.photo_far = payload.photo_far
    report.photo_close = payload.photo_close
    report.severity = "Analyzing"
    report.priority = "Medium"
    report.status = "Submitted"
    report.ai_analysis_completed = False
    report.ai_confidence = 0.0
    report.pothole_length_cm = None
    report.pothole_width_cm = None
    report.pothole_depth_cm = None
    report.ai_analysis_details = None
    report.last_date_status_update = datetime.utcnow()

    ai_job.status = "QUEUED" if payload.queue_ai else "WAITING_UPLOAD"
    ai_job.attempts = 0
    ai_job.max_attempts = AI_MAX_ATTEMPTS
    ai_job.error_message = None
    ai_job.queued_at = datetime.utcnow()
    ai_job.started_at = None
    ai_job.finished_at = None
    ai_job.next_retry_at = None

    db.commit()
    db.refresh(ai_job)

    if payload.queue_ai:
        background_tasks.add_task(
            _queue_ai_from_report_urls,
            ai_job.id,
            case_id,
            report.photo_top,
            report.photo_far,
            report.photo_close,
            report.latitude,
            report.longitude,
            report.description,
        )

    return {
        "message": "Report finalized successfully.",
        "case_id": case_id,
        "ai_queue": _serialize_ai_job(ai_job),
    }


@router.post("/report/{case_id}/trigger-ai")
async def trigger_ai_analysis(
    case_id: str,
    background_tasks: BackgroundTasks,
    payload: Optional[TriggerAIRequest] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    force = payload.force if payload else False
    report = (
        db.query(models.PotholeReport)
        .filter(
            models.PotholeReport.case_id == case_id,
            models.PotholeReport.user_id == current_user.id,
        )
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not all([report.photo_top, report.photo_far, report.photo_close]):
        raise HTTPException(
            status_code=422,
            detail="Report images are missing. Complete image upload first.",
        )

    ai_job = report.ai_job
    if ai_job is None:
        ai_job = models.AIJob(case_id=case_id, max_attempts=AI_MAX_ATTEMPTS)
        db.add(ai_job)
        db.flush()

    if ai_job.status in PENDING_AI_STATUSES and not force:
        return {
            "message": "AI analysis is already in progress.",
            "case_id": case_id,
            "ai_queue": _serialize_ai_job(ai_job),
        }

    report.ai_analysis_completed = False
    report.ai_confidence = 0.0
    report.severity = "Analyzing"
    report.priority = "Medium"
    report.status = "Submitted"
    report.ai_analysis_details = None
    report.last_date_status_update = datetime.utcnow()

    ai_job.status = "QUEUED"
    ai_job.attempts = 0
    ai_job.max_attempts = AI_MAX_ATTEMPTS
    ai_job.error_message = None
    ai_job.queued_at = datetime.utcnow()
    ai_job.started_at = None
    ai_job.finished_at = None
    ai_job.next_retry_at = None

    db.commit()
    db.refresh(ai_job)

    background_tasks.add_task(
        _queue_ai_from_report_urls,
        ai_job.id,
        case_id,
        report.photo_top,
        report.photo_far,
        report.photo_close,
        report.latitude,
        report.longitude,
        report.description,
    )

    return {
        "message": "AI analysis queued.",
        "case_id": case_id,
        "ai_queue": _serialize_ai_job(ai_job),
    }


@router.post("/report")
async def submit_report(
    background_tasks: BackgroundTasks,
    district: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(""),
    remarks: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    photo_top: Optional[UploadFile] = File(None),
    photo_far: Optional[UploadFile] = File(None),
    photo_close: Optional[UploadFile] = File(None),
    photo_1: Optional[UploadFile] = File(None),
    photo_2: Optional[UploadFile] = File(None),
    photo_3: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    case_id = _gen_case_id()
    report_text = remarks or description
    files = _resolve_photo_uploads(
        photo_top=photo_top,
        photo_far=photo_far,
        photo_close=photo_close,
        photo_1=photo_1,
        photo_2=photo_2,
        photo_3=photo_3,
    )

    image_data: Dict[str, bytes] = {}
    uploaded_urls: Dict[str, str] = {}
    uploaded_supabase_paths: List[str] = []
    uploaded_cloudinary_ids: List[str] = []

    try:
        for slot in REQUIRED_IMAGE_SLOTS:
            upload = files[slot]
            file_content = await upload.read()
            if not file_content:
                raise HTTPException(status_code=422, detail=f"Uploaded file is empty: {slot}")

            image_data[slot] = file_content

            if SupabaseStorageService.is_configured():
                upload_result = await SupabaseStorageService.upload_bytes(
                    file_content=file_content,
                    case_id=case_id,
                    image_slot=slot,
                    filename=upload.filename or f"{slot}.jpg",
                )
                if not upload_result.get("success"):
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to upload {slot} image to Supabase: {upload_result.get('error')}",
                    )
                public_url = upload_result.get("public_url")
                if not public_url:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Supabase upload did not return a public URL for {slot}.",
                    )
                uploaded_urls[slot] = public_url
                if upload_result.get("object_path"):
                    uploaded_supabase_paths.append(upload_result["object_path"])
                continue

            cloudinary_result = await CloudinaryService.upload_pothole_image(
                file_content=file_content,
                filename=upload.filename or f"{slot}.jpg",
                image_type=slot,
                case_id=case_id,
            )
            if not cloudinary_result.get("success"):
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to upload {slot} image: {cloudinary_result.get('error')}",
                )
            uploaded_urls[slot] = cloudinary_result["secure_url"]
            if cloudinary_result.get("public_id"):
                uploaded_cloudinary_ids.append(cloudinary_result["public_id"])

    except Exception as exc:
        for object_path in uploaded_supabase_paths:
            await SupabaseStorageService.delete_object(object_path)
        for public_id in uploaded_cloudinary_ids:
            await CloudinaryService.delete_image(public_id)
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Failed to submit report: {str(exc)}")

    record = models.PotholeReport(
        case_id=case_id,
        email=current_user.email,
        user_id=current_user.id,
        district=district,
        location={
            "latitude": latitude,
            "longitude": longitude,
            "address": address,
            "remarks": report_text or "",
        },
        latitude=latitude,
        longitude=longitude,
        description=report_text,
        photo_top=uploaded_urls["top"],
        photo_far=uploaded_urls["far"],
        photo_close=uploaded_urls["close"],
        severity="Analyzing",
        status="Submitted",
        priority="Medium",
        ai_analysis_completed=False,
        ai_confidence=0.0,
        pothole_length_cm=None,
        pothole_width_cm=None,
        pothole_depth_cm=None,
        similar_reports_count=0,
        unique_users_count=0,
        community_multiplier=1.0,
        ai_analysis_details=None,
        date_created=datetime.utcnow(),
        last_date_status_update=datetime.utcnow(),
    )
    db.add(record)

    ai_job = models.AIJob(
        case_id=case_id,
        status="QUEUED",
        attempts=0,
        max_attempts=AI_MAX_ATTEMPTS,
    )
    db.add(ai_job)
    db.commit()
    db.refresh(ai_job)

    background_tasks.add_task(
        process_ai_job,
        ai_job.id,
        case_id,
        image_data["top"],
        image_data["far"],
        image_data["close"],
        latitude,
        longitude,
        report_text,
    )

    return {
        "message": "Report submitted successfully. AI job queued.",
        "case_id": case_id,
        "ai_job_id": ai_job.id,
        "ai_queue_status": ai_job.status,
        "estimated_completion": "30-120 seconds",
    }


@router.get("/my-reports")
def list_user_reports(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    reports = query_user_reports(
        db,
        user_id=current_user.id,
    ).order_by(models.PotholeReport.date_created.desc()).all()

    return [
        {
            "case_id": r.case_id,
            "district": r.district,
            "severity": r.severity,
            "priority": r.priority,
            "status": r.status,
            "date_created": r.date_created,
            "last_date_status_update": r.last_date_status_update,
            "location": _extract_location(r.location, r.latitude, r.longitude),
            "photos": {
                "top": r.photo_top,
                "far": r.photo_far,
                "close": r.photo_close,
            },
            "remarks": r.description,
            "ai_analysis": {
                "completed": r.ai_analysis_completed,
                "confidence": r.ai_confidence,
                "measurements": {
                    "length_cm": r.pothole_length_cm,
                    "width_cm": r.pothole_width_cm,
                    "depth_cm": r.pothole_depth_cm,
                }
                if r.ai_analysis_completed
                else None,
                "community_data": {
                    "similar_reports": r.similar_reports_count,
                    "unique_users": r.unique_users_count,
                    "multiplier": r.community_multiplier,
                }
                if r.ai_analysis_completed
                else None,
            },
            "ai_queue": _serialize_ai_job(r.ai_job),
        }
        for r in reports
    ]


@router.get("/report/{case_id}/ai-status")
def get_ai_analysis_status(
    case_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    report = (
        db.query(models.PotholeReport)
        .filter(
            models.PotholeReport.case_id == case_id,
            models.PotholeReport.user_id == current_user.id,
        )
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "case_id": case_id,
        "ai_analysis_completed": report.ai_analysis_completed,
        "severity": report.severity,
        "priority": report.priority,
        "confidence": report.ai_confidence,
        "last_updated": report.last_date_status_update,
        "ai_queue": _serialize_ai_job(report.ai_job),
        "measurements": {
            "length_cm": report.pothole_length_cm,
            "width_cm": report.pothole_width_cm,
            "depth_cm": report.pothole_depth_cm,
        }
        if report.ai_analysis_completed
        else None,
    }


@router.get("/reports/pending-ai")
def get_pending_ai_reports(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    pending_reports = (
        db.query(models.PotholeReport)
        .join(models.AIJob, models.AIJob.case_id == models.PotholeReport.case_id)
        .filter(
            models.PotholeReport.user_id == current_user.id,
            models.AIJob.status.in_(PENDING_AI_STATUSES),
        )
        .all()
    )

    return {
        "pending_count": len(pending_reports),
        "reports": [
            {
                "case_id": r.case_id,
                "submitted_at": r.date_created,
                "status": r.ai_job.status if r.ai_job else "UNKNOWN",
                "attempts": r.ai_job.attempts if r.ai_job else 0,
                "max_attempts": r.ai_job.max_attempts if r.ai_job else 0,
                "next_retry_at": r.ai_job.next_retry_at if r.ai_job else None,
            }
            for r in pending_reports
        ],
    }


@router.get("/reports/nearby")
def get_nearby_reports(
    latitude: float = Query(..., alias="lat"),
    longitude: float = Query(..., alias="lng"),
    radius: int = Query(100, ge=10, le=2000),
    hours: int = Query(72, ge=1, le=24 * 30),
    include_my_reports: bool = Query(True),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Find nearby reports around a coordinate for duplicate detection and priority context."""
    exclude_user_id = None if include_my_reports else current_user.id
    candidates = query_nearby_reports(
        db,
        latitude=latitude,
        longitude=longitude,
        radius_m=radius,
        hours=hours,
        exclude_user_id=exclude_user_id,
    ).order_by(models.PotholeReport.date_created.desc()).all()

    reports = []
    unique_user_ids = set()
    for report in candidates:
        distance_m = haversine_meters(
            latitude,
            longitude,
            float(report.latitude),
            float(report.longitude),
        )
        if distance_m > radius:
            continue
        unique_user_ids.add(report.user_id)
        reports.append(
            {
                "case_id": report.case_id,
                "user_id": report.user_id,
                "district": report.district,
                "status": report.status,
                "severity": report.severity,
                "priority": report.priority,
                "distance_m": round(distance_m, 2),
                "date_created": report.date_created,
                "location": _extract_location(report.location, report.latitude, report.longitude),
            }
        )

    return {
        "query": {
            "latitude": latitude,
            "longitude": longitude,
            "radius_m": radius,
            "hours": hours,
            "include_my_reports": include_my_reports,
        },
        "summary": {
            "count": len(reports),
            "unique_users": len(unique_user_ids),
        },
        "reports": reports,
    }


@router.get("/recentsubmission")
def get_recent_submissions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    recent_reports = (
        db.query(models.PotholeReport)
        .filter(models.PotholeReport.user_id == current_user.id)
        .order_by(models.PotholeReport.date_created.desc())
        .limit(5)
        .all()
    )

    return {
        "recent_submissions": [
            {
                "report_id": r.case_id,
                "location": _extract_location(r.location, r.latitude, r.longitude).get("address"),
                "submission_date": r.date_created.strftime("%m/%d/%Y"),
                "status": r.status,
                "similar_reports_count": r.similar_reports_count,
            }
            for r in recent_reports
        ]
    }
