import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

load_dotenv()

DB_USERNAME = "postgres"
DB_PASSWORD = os.getenv("DB_PASSWORD")  # Ensure the environment variable name matches exactly
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "sabah_road_care"
DATABASE_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

