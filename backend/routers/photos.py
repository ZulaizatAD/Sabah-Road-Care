from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from database.connect import get_db
from models.photos import PotholePhoto
from schemas.photos import PhotoUploadResponse, ReportPhotosResponse, PhotoUrlsResponse
from services.cloudinary.service import CloudinaryService
from auth.security import get_current_user

router = APIRouter(prefix="/api/photos", tags=["Photos"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

@router.post("/upload/{report_id}", response_model=List[PhotoUploadResponse])
async def upload_pothole_photos(
    report_id: int,
    top_view: UploadFile = File(...),  # Required
    far: UploadFile = File(...),      # Required  
    close_up: UploadFile = File(...),  # Required
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Upload all 3 required pothole photos for a report
    All 3 photos (top-view, far, close-up) are required
    """
    uploaded_photos = []
    files_to_upload = [
        (top_view, "top-view"),
        (far, "far"),
        (close_up, "close-up")
    ]
    
    # Validate all files first before uploading any
    for file, image_type in files_to_upload:
        if not file.filename:
            raise HTTPException(
                status_code=400, 
                detail=f"{image_type} image is required"
            )
        
        file_extension = "." + file.filename.split(".")[-1].lower()
        if file_extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type for {image_type}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
    
    # Process each upload
    for file, image_type in files_to_upload:
        # Validate file size
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"{image_type} file too large. Max: {MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Check if this image type already exists (replace if exists)
        existing_photo = db.query(PotholePhoto).filter(
            PotholePhoto.report_id == report_id,
            PotholePhoto.image_type == image_type
        ).first()
        
        if existing_photo:
            await CloudinaryService.delete_image(existing_photo.cloudinary_public_id)
            db.delete(existing_photo)
            db.commit()
        
        # Upload to Cloudinary
        upload_result = await CloudinaryService.upload_pothole_image(
            file_content=file_content,
            filename=file.filename,
            report_id=str(report_id),
            image_type=image_type
        )
        
        if not upload_result["success"]:
            # If any upload fails, clean up previously uploaded photos for this batch
            for uploaded_photo in uploaded_photos:
                await CloudinaryService.delete_image(uploaded_photo.cloudinary_public_id)
                db.delete(uploaded_photo)
            db.commit()
            
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload {image_type} image: {upload_result.get('error')}"
            )
        
        # Save to database
        photo = PotholePhoto(
            report_id=report_id,
            image_type=image_type,
            cloudinary_public_id=upload_result["public_id"],
            cloudinary_url=upload_result["secure_url"],
            original_filename=file.filename,
            file_size=upload_result.get("bytes"),
            width=upload_result.get("width"),
            height=upload_result.get("height"),
            format=upload_result.get("format")
        )
        
        db.add(photo)
        db.commit()
        db.refresh(photo)
        uploaded_photos.append(photo)
    
    return uploaded_photos

@router.get("/report/{report_id}", response_model=ReportPhotosResponse)
async def get_report_photos(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    Get all photos for a specific report
    """
    photos = db.query(PotholePhoto).filter(
        PotholePhoto.report_id == report_id
    ).all()
    
    return ReportPhotosResponse(
        report_id=report_id,
        photos=photos
    )

@router.get("/report/{report_id}/urls", response_model=PhotoUrlsResponse)
async def get_report_photo_urls(
    report_id: int,
    db: Session = Depends(get_db)
):
    """
    Get photo URLs for a specific report (useful for AI processing)
    """
    photos = db.query(PotholePhoto).filter(
        PotholePhoto.report_id == report_id
    ).all()
    
    urls = {}
    for photo in photos:
        if photo.image_type == "top-view":
            urls["top_view_url"] = photo.cloudinary_url
        elif photo.image_type == "far":
            urls["far_url"] = photo.cloudinary_url
        elif photo.image_type == "close-up":
            urls["close_up_url"] = photo.cloudinary_url
    
    return PhotoUrlsResponse(**urls)

@router.put("/report/{report_id}/replace")
async def replace_single_photo(
    report_id: int,
    image_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Replace a single photo in an existing report
    Useful if user wants to update just one photo type
    """
    if image_type not in {"top-view", "far", "close-up"}:
        raise HTTPException(
            status_code=400, 
            detail="Invalid image type. Must be: top-view, far, or close-up"
        )
    
    # Validate file
    file_extension = "." + file.filename.split(".")[-1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Find and delete existing photo
    existing_photo = db.query(PotholePhoto).filter(
        PotholePhoto.report_id == report_id,
        PotholePhoto.image_type == image_type
    ).first()
    
    if existing_photo:
        await CloudinaryService.delete_image(existing_photo.cloudinary_public_id)
        db.delete(existing_photo)
        db.commit()
    
    # Upload new photo
    upload_result = await CloudinaryService.upload_pothole_image(
        file_content=file_content,
        filename=file.filename,
        report_id=str(report_id),
        image_type=image_type
    )
    
    if not upload_result["success"]:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload image: {upload_result.get('error')}"
        )
    
    # Save new photo
    photo = PotholePhoto(
        report_id=report_id,
        image_type=image_type,
        cloudinary_public_id=upload_result["public_id"],
        cloudinary_url=upload_result["secure_url"],
        original_filename=file.filename,
        file_size=upload_result.get("bytes"),
        width=upload_result.get("width"),
        height=upload_result.get("height"),
        format=upload_result.get("format")
    )
    
    db.add(photo)
    db.commit()
    db.refresh(photo)
    
    return {"message": f"{image_type} photo replaced successfully", "photo": photo}

@router.delete("/photo/{photo_id}")
async def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Delete a specific photo
    """
    photo = db.query(PotholePhoto).filter(PotholePhoto.id == photo_id).first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Delete from Cloudinary
    delete_result = await CloudinaryService.delete_image(photo.cloudinary_public_id)
    
    if not delete_result["success"]:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete from Cloudinary: {delete_result.get('error')}"
        )
    
    # Delete from database
    db.delete(photo)
    db.commit()
    
    return {"message": "Photo deleted successfully"}

@router.delete("/report/{report_id}/photos")
async def delete_all_report_photos(
    report_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Delete all photos for a specific report
    """
    photos = db.query(PotholePhoto).filter(
        PotholePhoto.report_id == report_id
    ).all()
    
    if not photos:
        raise HTTPException(status_code=404, detail="No photos found for this report")
    
    # Delete from Cloudinary
    for photo in photos:
        await CloudinaryService.delete_image(photo.cloudinary_public_id)
    
    # Delete from database
    db.query(PotholePhoto).filter(PotholePhoto.report_id == report_id).delete()
    db.commit()
    
    return {"message": f"Deleted {len(photos)} photos for report {report_id}"}