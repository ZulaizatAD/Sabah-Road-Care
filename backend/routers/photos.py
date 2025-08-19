# routers/photos.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from drive import upload_bytes_to_drive, safe_mime

router = APIRouter(prefix="/photos", tags=["photos"])

@router.post("/upload")
async def upload_photos(
    top: UploadFile = File(...),
    far: UploadFile = File(...),
    close: UploadFile = File(...),
):
    allowed = {"image/jpeg", "image/png", "image/webp"}
    for f in (top, far, close):
        if f.content_type not in allowed:
            raise HTTPException(400, "Only JPEG/PNG/WEBP allowed")

    results = {}
    for label, file in (("top", top), ("far", far), ("close", close)):
        data = await file.read()
        fname = f"{label}_{file.filename or 'photo.jpg'}"
        file_id, view_link = upload_bytes_to_drive(
            data,
            fname,
            safe_mime(fname, file.content_type or "image/jpeg")
        )
        results[label] = {"file_id": file_id, "webViewLink": view_link}

    return {"ok": True, "photos": results}
