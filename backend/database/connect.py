from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

_DATABASE_URL_RAW = os.getenv("DATABASE_URL")
DATABASE_URL = (_DATABASE_URL_RAW or "").strip()

if not DATABASE_URL:
    DB_USERNAME = (os.getenv("DB_USERNAME") or os.getenv("dB_USERNAME") or "").strip()
    DB_PASSWORD = (os.getenv("DB_PASSWORD") or os.getenv("dB_PASSWORD") or "").strip()
    DB_HOST = (os.getenv("DB_HOST") or os.getenv("dB_HOST") or "localhost").strip()
    DB_PORT = (os.getenv("DB_PORT") or os.getenv("dB_PORT") or "5432").strip()
    DB_NAME = (os.getenv("DB_NAME") or os.getenv("dB_NAME") or "").strip()

    if DB_USERNAME and DB_PASSWORD and DB_NAME:
        DATABASE_URL = (
            f"postgresql+psycopg2://{DB_USERNAME}:{DB_PASSWORD}"
            f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )
    else:
        raise RuntimeError(
            "Database configuration is missing. Set DATABASE_URL for Supabase, "
            "or set DB_USERNAME/DB_PASSWORD/DB_NAME for local Postgres."
        )

# Some providers still return postgres:// URLs.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine_kwargs = {
    "pool_pre_ping": True,
}

# SQLite does not support QueuePool tuning args in the same way as Postgres.
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_size"] = int(os.getenv("DB_POOL_SIZE", "5"))
    engine_kwargs["max_overflow"] = int(os.getenv("DB_MAX_OVERFLOW", "10"))

engine = create_engine(DATABASE_URL, **engine_kwargs)
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
