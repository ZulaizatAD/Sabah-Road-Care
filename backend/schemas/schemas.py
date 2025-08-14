# backend/schemas.py
from pydantic import BaseModel
from datetime import datetime

class CaseBase(BaseModel):
    case_id: str
    district: str
    status: str
    severity: str
    location_address: str
    latitude: float
    longitude: float
    date_created: datetime
    last_status_update: datetime
    photo_top: str
    photo_far: str
    photo_close: str

    class Config:
        from_attributes = True
