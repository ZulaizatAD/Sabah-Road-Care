from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.connect import Base

class PotholePhoto(Base):
    __tablename__ = "pothole_photos"

    id = Column(Integer, primary_key=True, index=True)  # ✅ FIX
    case_id = Column(
        String,
        ForeignKey("pothole_reports.case_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    top_view = Column(Text, nullable=True)
    far = Column(Text, nullable=True)
    close_up = Column(Text, nullable=True)
