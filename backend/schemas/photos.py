from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class PhotoUploadResponse(BaseModel):
    id: int
    image_type: str
    cloudinary_url: str
    cloudinary_public_id: str
    original_filename: Optional[str]
    file_size: Optional[int]
    width: Optional[int]
    height: Optional[int]
    format: Optional[str]
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class ReportPhotosResponse(BaseModel):
    report_id: int
    photos: List[PhotoUploadResponse]
    
    class Config:
        from_attributes = True

class PhotoUrlsResponse(BaseModel):
    top_view_url: Optional[str] = None
    far_url: Optional[str] = None
    close_up_url: Optional[str] = None
    
    class Config:
        from_attributes = True