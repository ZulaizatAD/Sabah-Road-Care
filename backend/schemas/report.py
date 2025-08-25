from pydantic import BaseModel
from datetime import datetime
from typing import List

class CaseBase(BaseModel):
    case_id: str
    district: str
    status: str
    severity: str
    location: str
    latitude: float
    longitude: float
    date_created: datetime
    last_date_status_update: datetime
    photo_top: str
    photo_far: str
    photo_close: str
    priority: int
    similar_reports: List[str]

    class Config:
        from_attributes = True  # Enables compatibility with SQLAlchemy models
