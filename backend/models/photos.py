from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database.connect import Base

class PotholePhoto(Base):
    __tablename__ = "pothole_photos"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, nullable=False, index=True)  # Remove foreign key for now
    image_type = Column(String(20), nullable=False)  # 'top-view', 'far', 'close-up'
    cloudinary_public_id = Column(String(255), nullable=False, unique=True)
    cloudinary_url = Column(Text, nullable=False)
    original_filename = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)  # in bytes
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    format = Column(String(10), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Note: Add foreign key constraint later when reports table is ready
    # You can add this later: ForeignKey("reports.id") to report_id column