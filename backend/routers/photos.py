from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database.connect import get_db
from models.photos import PotholePhoto
from schemas.photos import PhotoUrlsResponse
from services.cloudinary.service import CloudinaryService
from auth.security import get_current_user

router = APIRouter(prefix="/photos")

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


@router.post("/upload/{case_id}", response_model=PhotoUrlsResponse)
async def upload_pothole_photos(
    case_id: str,
    top_view: UploadFile = File(...),
    far: UploadFile = File(...),
    close_up: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Upload all 3 pothole photos for a case.
    Each case_id has only one row with top_view, far, and close_up URLs.
    """
    files_to_upload = {
        "top_view": top_view,
        "far": far,
        "close_up": close_up,
    }

    upload_results = {}

    # Validate and upload files
    for field, file in files_to_upload.items():
        if not file.filename:
            raise HTTPException(status_code=400, detail=f"{field} image is required")

        file_extension = "." + file.filename.split(".")[-1].lower()
        if file_extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type for {field}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
            )

        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"{field} file too large. Max {MAX_FILE_SIZE // (1024*1024)}MB",
            )

        # Upload to Cloudinary
        upload_result = await CloudinaryService.upload_pothole_image(
            file_content=file_content,
            filename=file.filename,
            case_id=case_id,
            image_type=field,
        )

        if not upload_result["success"]:
            raise HTTPException(status_code=500, detail=f"Failed to upload {field} image")

        upload_results[field] = upload_result["secure_url"]

    # Upsert row for this case_id
    existing_entry = db.query(PotholePhoto).filter(PotholePhoto.case_id == case_id).first()

    if existing_entry:
        existing_entry.top_view = upload_results["top_view"]
        existing_entry.far = upload_results["far"]
        existing_entry.close_up = upload_results["close_up"]
    else:
        new_entry = PotholePhoto(
            case_id=case_id,
            top_view=upload_results["top_view"],
            far=upload_results["far"],
            close_up=upload_results["close_up"],
        )
        db.add(new_entry)

    db.commit()

    return PhotoUrlsResponse(**upload_results)


@router.get("/case/{case_id}", response_model=PhotoUrlsResponse)
async def get_report_photos(case_id: str, db: Session = Depends(get_db)):
    """
    Get photo URLs for a specific case_id.
    """
    photos = db.query(PotholePhoto).filter(PotholePhoto.case_id == case_id).first()
    if not photos:
        raise HTTPException(status_code=404, detail="No photos found for this case_id")

    return PhotoUrlsResponse(
        top_view_url=photos.top_view,
        far_url=photos.far,
        close_up_url=photos.close_up,
    )


@router.delete("/case/{case_id}")
async def delete_report_photos(
    case_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Delete all photos for a specific case_id (DB + Cloudinary).
    """
    photos = db.query(PotholePhoto).filter(PotholePhoto.case_id == case_id).first()
    if not photos:
        raise HTTPException(status_code=404, detail="No photos found for this case_id")

    # Delete from Cloudinary (if you want to actually remove them)
    for url in [photos.top_view, photos.far, photos.close_up]:
        if url:
            await CloudinaryService.delete_image(url)

    db.delete(photos)
    db.commit()

    return {"message": f"Deleted photos for case {case_id}"}
