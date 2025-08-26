from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from typing import Union, Dict

class CaseBase(BaseModel):
    case_id: str
    email: str
    location: Union[str, Dict]
    district: str
    date_created: datetime
    last_date_status_update: datetime
    severity: str
    status: str
    latitude: float
    longitude: float
    photo_top: Optional[str] = None
    photo_far: Optional[str] = None
    photo_close: Optional[str] = None
    description: Optional[str] = None
    user_id: int

    class Config:
        from_attributes = True  # enables compatibility with SQLAlchemy models
