from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON
from sqlalchemy.sql import func
from database.connect import Base
from sqlalchemy.orm import relationship

class PotholeReport(Base):
    __tablename__ = "pothole_reports"

    case_id = Column(String, primary_key=True, index=True)  # SRC_XXX format
    email = Column(String, nullable=False, index=True)

    # location (stored as JSON: {latitude, longitude, address, remarks})
    location = Column(JSON, nullable=False)

    district = Column(String, nullable=False)

    date_created = Column(DateTime(timezone=True), server_default=func.now())
    last_date_status_update = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    severity = Column(String, nullable=False)  # Low / Medium / High
    status = Column(String, nullable=False, default="Submitted")

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    photo_top = Column(Text, nullable=False)   # Cloudinary URL
    photo_far = Column(Text, nullable=False)   # Cloudinary URL
    photo_close = Column(Text, nullable=False) # Cloudinary URL

    description = Column(Text, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="reports")   
