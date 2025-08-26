from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PhotoUrlsResponse(BaseModel):
    case_id: str
    top_view: Optional[str] = None
    far: Optional[str] = None
    close_up: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True
