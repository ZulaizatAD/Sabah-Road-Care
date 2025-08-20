from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Float
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from database.connect import Base
from sqlalchemy.orm import relationship

class PotholeReport(Base):
    __tablename__ = "pothole_reports"

    case_id = Column(String, primary_key=True)
    email = Column(String, nullable=False)
    location = Column(JSONB, nullable=False)
    district = Column(String, nullable=False)
    date_created = Column(DateTime, default=datetime.utcnow)
    last_date_status_update = Column(DateTime, default=datetime.utcnow)
    severity = Column(String, nullable=False)
    status = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    photo_top = Column(String, nullable=True)
    photo_far = Column(String, nullable=True)
    photo_close = Column(String, nullable=True)


    # NEW: link to user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Optional: relationship to User model
    user = relationship("User", back_populates="reports")
