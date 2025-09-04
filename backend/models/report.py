from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from services.database.connect import Base
from sqlalchemy.orm import relationship

class PotholeReport(Base):
    __tablename__ = "pothole_reports"

    # Primary identification
    case_id = Column(String, primary_key=True, index=True)  # SRC_XXX format
    email = Column(String, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Location data
    location = Column(JSON, nullable=False)  # {latitude, longitude, address, remarks}
    district = Column(String, nullable=False, index=True)  # Added index for performance
    latitude = Column(Float, nullable=False, index=True)   # Added index for location queries
    longitude = Column(Float, nullable=False, index=True)  # Added index for location queries
    description = Column(Text, nullable=True)

    # Timestamps
    date_created = Column(DateTime(timezone=True), server_default=func.now())
    last_date_status_update = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Status and Classification
    severity = Column(String, nullable=False, default="Analyzing")  # Low/Medium/High from AI
    status = Column(String, nullable=False, default="Under Review")
    priority = Column(String, nullable=False, default="Medium")     # Final priority classification

    # AI Analysis Status
    ai_analysis_completed = Column(Boolean, default=False, nullable=False)
    ai_confidence = Column(Float, default=0.0)

    # AI Measurements (from image analysis)
    pothole_length_cm = Column(Float, nullable=True)
    pothole_width_cm = Column(Float, nullable=True)
    pothole_depth_cm = Column(Float, nullable=True)

    # Community Analysis Data
    similar_reports_count = Column(Integer, default=0)     # Number of reports in same area
    unique_users_count = Column(Integer, default=0)        # Number of unique users reporting
    community_multiplier = Column(Float, default=1.0)      # Calculated multiplier

    # AI Analysis Details (store full analysis)
    ai_analysis_details = Column(JSON, nullable=True)

    # Image URLs
    photo_top = Column(Text, nullable=False)    # Cloudinary URL
    photo_far = Column(Text, nullable=False)    # Cloudinary URL
    photo_close = Column(Text, nullable=False)  # Cloudinary URL

    # Relationships
    user = relationship("User", back_populates="reports")

    def __repr__(self):
        return f"<PotholeReport(case_id='{self.case_id}', severity='{self.severity}', priority='{self.priority}')>"

    @property
    def location_dict(self):
        """Helper property to get location data"""
        if isinstance(self.location, dict):
            return self.location
        return {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "address": self.location if isinstance(self.location, str) else "",
            "remarks": self.description
        }

    @property
    def photos_dict(self):
        """Helper property to get all photos as dict"""
        return {
            "top": self.photo_top,
            "far": self.photo_far,
            "close": self.photo_close
        }

    @property
    def ai_measurements_dict(self):
        """Helper property to get AI measurements"""
        return {
            "length_cm": self.pothole_length_cm,
            "width_cm": self.pothole_width_cm,
            "depth_cm": self.pothole_depth_cm
        }

    @property
    def community_analysis_dict(self):
        """Helper property to get community analysis data"""
        return {
            "similar_reports": self.similar_reports_count,
            "unique_users": self.unique_users_count,
            "multiplier": self.community_multiplier
        }