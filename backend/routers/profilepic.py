from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database.connect import get_db
from models import users as models
from auth.security import get_current_user  # Import the get_current_user dependency
from services.cloudinary.service import CloudinaryService

router = APIRouter(
    prefix="/profile",
    tags=["profile"]
)

# Config
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}

@router.get("/me")
async def get_my_profile(current_user: models.User = Depends(get_current_user)):
    """Return the current user's profile info"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "profile_picture": current_user.profile_picture,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }

@router.post("/picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """ Upload or replace the current user's profile picture """
    # Validate extension
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Validate size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max: {MAX_FILE_SIZE // (1024*1024)}MB"
        )

    # Delete old picture if exists
    if current_user.profile_picture:
        public_id = current_user.profile_picture.split("/")[-1].split(".")[0]
        await CloudinaryService.delete_image(public_id)

    # Upload new picture
    upload_result = await CloudinaryService.upload_pothole_image(
        file_content=file_content,
        filename=file.filename,
        report_id=f"user_{current_user.id}",
        image_type="profile"
    )

    if not upload_result["success"]:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload profile picture: {upload_result.get('error')}"
        )

    # Save new URL in DB
    current_user.profile_picture = upload_result["secure_url"]
    db.commit()
    db.refresh(current_user)

    return {"profile_picture": current_user.profile_picture}

@router.delete("/picture")
async def delete_profile_picture(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """ Delete the user's profile picture """
    if not current_user.profile_picture:
        raise HTTPException(status_code=404, detail="No profile picture found.")

    public_id = current_user.profile_picture.split("/")[-1].split(".")[0]
    await CloudinaryService.delete_image(public_id)

    # Remove from DB
    current_user.profile_picture = None
    db.commit()
    db.refresh(current_user)

    return {"message": "Profile picture deleted successfully."}