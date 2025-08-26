from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
from datetime import datetime

# ---- Shared base schema ----
class CaseBase(BaseModel):
    email: EmailStr
    district: str
    latitude: float
    longitude: float
    location: Dict  # JSON object {latitude, longitude, address, remarks}
    severity: str
    status: str
    photo_top: str
    photo_far: str
    photo_close: str
    description: Optional[str] = None
    user_id: int

# ---- Create schema ----
class CaseCreate(CaseBase):
    pass

# ---- Response schema ----
class CaseResponse(CaseBase):
    case_id: str
    date_created: datetime
    last_date_status_update: datetime

    class Config:
        orm_mode = True
