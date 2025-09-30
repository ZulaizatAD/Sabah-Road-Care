from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import validates, relationship
from services.database.connect import Base


class User(Base):
    """
    User model representing registered users in the system.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    full_name = Column(String(255), nullable=True)
    profile_picture = Column(String(500), nullable=True)
    
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    @validates("email")
    def validate_email(self, key, value: str):
        if not value or "@" not in value:
            raise ValueError("Invalid email")
        return value.lower().strip()
    
    reports = relationship("PotholeReport", back_populates="user", cascade="all, delete-orphan")
