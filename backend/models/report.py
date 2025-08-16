from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from database.connection import Base

class PotholeReport(Base):
    __tablename__ = "pothole_reports"
    case_id = Column(String, primary_key=True)
    email = Column(String, nullable=False)
    photos = Column(JSONB, nullable=False)
    location = Column(JSONB, nullable=False)
    district = Column(String, nullable=False)
    date_created = Column(DateTime, default=datetime.utcnow)
    last_date_status_update = Column(DateTime, default=datetime.utcnow)
    severity = Column(String, nullable=False)
    status = Column(String, nullable=False)