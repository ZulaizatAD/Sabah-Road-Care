"""
Database Connection and Configuration Module
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DB_USERNAME = os.getenv("dB_USERNAME")
DB_PASSWORD = os.getenv("dB_PASSWORD")
DB_HOST = os.getenv("dB_HOST")
DB_PORT = os.getenv("dB_PORT", "5432")
DB_NAME = os.getenv("dB_NAME")

# Construct database URL
DATABASE_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

if os.getenv("ENVIRONMENT") == "production":
    DATABASE_URL += "?sslmode=require&connect_timeout=30"

print(f"🔗 Connecting to: {DB_HOST}:{DB_PORT}/{DB_NAME}")

# Create engine with proper configuration
if os.getenv("ENVIRONMENT") == "production":
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False,
        connect_args={
            "sslmode": "require",
            "connect_timeout": 30,
            "application_name": "sabah_road_care",
        },
    )
else:
    engine = create_engine(
        DATABASE_URL,
        echo=True,  # Enable SQL logging in development
    )

# Test connection immediately
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
except Exception as e:
    print(f"❌ Database connection failed: {e}")

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
