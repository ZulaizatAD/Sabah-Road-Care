from sqlalchemy import Column, Integer, String, DateTime, Float
from db.database import Base

class Case(Base):
    __tablename__ = "pothole_reports"

    case_id = Column(String, unique=True, index=True)
    district = Column(String)
    status = Column(String)
    severity = Column(String)
    location_address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    date_created = Column(DateTime)
    last_status_update = Column(DateTime)
    photo_top = Column(String)
    photo_far = Column(String)
    photo_close = Column(String)
