from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from database.connect import Base


class AIJob(Base):
    __tablename__ = "ai_jobs"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(
        String,
        ForeignKey("pothole_reports.case_id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    status = Column(String, nullable=False, default="QUEUED", index=True)
    attempts = Column(Integer, nullable=False, default=0)
    max_attempts = Column(Integer, nullable=False, default=3)
    error_message = Column(Text, nullable=True)

    queued_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    next_retry_at = Column(DateTime(timezone=True), nullable=True)

    report = relationship("PotholeReport", back_populates="ai_job")

    def __repr__(self):
        return (
            f"<AIJob(id={self.id}, case_id='{self.case_id}', status='{self.status}', "
            f"attempts={self.attempts}/{self.max_attempts})>"
        )
