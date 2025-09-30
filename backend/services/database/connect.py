"""
Database Connection and Configuration Module

This module handles:
- Database connection setup using SQLAlchemy
- Environment variable configuration
- Session management
- Database URL construction
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DB_USERNAME = os.getenv("dB_USERNAME")
DB_PASSWORD = os.getenv("dB_PASSWORD")
DB_HOST = os.getenv("dB_HOST", "localhost")
DB_PORT = os.getenv("dB_PORT", "5432")
DB_NAME = os.getenv("dB_NAME")

if os.getenv("ENVIRONMENT") == "production":
    DATABASE_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require"
else:
    DATABASE_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"Database URL: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'Invalid URL'}")

# SQLAlchemy setup
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,    # Recycle connections every 5 minutes
)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def init_table():
    Base.metadata.create_all(engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
