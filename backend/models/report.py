from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Float
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from database.connect import Base
from sqlalchemy.orm import relationship

class PotholeReport(Base):
    __tablename__ = "pothole_reports"

    case_id = Column(String, primary_key=True)  # SRC-YYYYMMDDHHMMSS-RAND
    email = Column(String, nullable=False)
    location = Column(JSONB, nullable=False)
    district = Column(String, nullable=False)
    date_created = Column(DateTime, default=datetime.utcnow)
    last_date_status_update = Column(DateTime, default=datetime.utcnow)
    severity = Column(String, nullable=False)  # low, medium, high
    status = Column(String, nullable=False)    # open, in_progress, resolved
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    photo_top = Column(String, nullable=True)   # Cloudinary URL
    photo_far = Column(String, nullable=True)   # Cloudinary URL
    photo_close = Column(String, nullable=True) # Cloudinary URL
    description = Column(String, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationship to User
    user = relationship("User", back_populates="reports")
