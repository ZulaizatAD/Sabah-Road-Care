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
DATABASE_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
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
