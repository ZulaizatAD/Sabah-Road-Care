import os
import uuid
import shutil
import datetime as dt
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from sqlalchemy import create_engine, String, Float, DateTime, Integer, func, select
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Mapped, mapped_column, Session

# ──────────────────────────────────────────────────────────────
# Env & basic config
# ──────────────────────────────────────────────────────────────
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")  # e.g. postgresql+psycopg2://user:pass@host:5432/db
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set. Put it in .env")

ALLOWED_ORIGINS = (os.getenv("ALLOWED_ORIGINS") or "").split(",") if os.getenv("ALLOWED_ORIGINS") else ["*"]

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ──────────────────────────────────────────────────────────────
# DB setup
# ──────────────────────────────────────────────────────────────
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

class Base(DeclarativeBase):
    pass

class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    document_number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    district: Mapped[str] = mapped_column(String(64))
    description: Mapped[Optional[str]] = mapped_column(String(300), default="")
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    address: Mapped[str] = mapped_column(String(255))
    road_name: Mapped[Optional[str]] = mapped_column(String(255), default=None)

    status: Mapped[str] = mapped_column(String(32), default="Pending")  # Pending/Reviewing/Approved/Completed
    similar_reports: Mapped[int] = mapped_column(Integer, default=0)

    photo_1_path: Mapped[Optional[str]] = mapped_column(String(255), default=None)
    photo_2_path: Mapped[Optional[str]] = mapped_column(String(255), default=None)
    photo_3_path: Mapped[Optional[str]] = mapped_column(String(255), default=None)

    created_at: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)

def create_tables():
    Base.metadata.create_all(engine)

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ──────────────────────────────────────────────────────────────
# Pydantic schemas
# ──────────────────────────────────────────────────────────────
class ReportOut(BaseModel):
    id: int
    documentNumber: str = Field(alias="document_number")
    location: str
    date: str
    status: str
    similarReports: int
    photoUrls: List[str] = []

    class Config:
        populate_by_name = True

class ReportListOut(BaseModel):
    items: List[ReportOut]
    total: int

class SubmitResponse(BaseModel):
    id: int
    documentNumber: str

# ──────────────────────────────────────────────────────────────
# App init
# ──────────────────────────────────────────────────────────────
app = FastAPI(title="Sabah Road Care API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files so the frontend can show images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────
def next_document_number(db: Session) -> str:
    """Generates something like RPT-2025-006 (globally incrementing)."""
    year = dt.datetime.now().year
    last = db.execute(
        select(Report).where(Report.document_number.like(f"RPT-{year}-%")).order_by(Report.id.desc())
    ).scalars().first()
    if last:
        try:
            seq = int(last.document_number.split("-")[-1]) + 1
        except Exception:
            seq = last.id + 1
    else:
        seq = 1
    return f"RPT-{year}-{seq:03d}"

def save_photo(file: UploadFile, prefix: str) -> str:
    # keep extension if present
    _, ext = os.path.splitext(file.filename or "")
    if not ext:
        ext = ".jpg"
    fname = f"{prefix}{ext}"
    path = os.path.join(UPLOAD_DIR, fname)
    with open(path, "wb") as out:
        shutil.copyfileobj(file.file, out)
    return f"/uploads/{fname}"

# ──────────────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    create_tables()

@app.get("/health")
def health():
    return {"ok": True, "time": dt.datetime.utcnow().isoformat()}

@app.post("/api/reports", response_model=SubmitResponse)
async def create_report(
    description: str = Form(""),
    district: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(...),
    road_name: str = Form(""),
    photo_1: UploadFile = File(None),
    photo_2: UploadFile = File(None),
    photo_3: UploadFile = File(None),
    authorization: Optional[str] = Header(None),  # token from frontend; not validated here
    db: Session = Depends(get_db),
):
    # basic validation to mirror your frontend rules
    photos = [p for p in (photo_1, photo_2, photo_3) if p is not None]
    if len(photos) < 3:
        raise HTTPException(status_code=422, detail="Please upload all 3 photos")

    # Create DB row first to lock in document number
    doc_no = next_document_number(db)
    rep = Report(
        document_number=doc_no,
        district=district,
        description=description[:300] if description else "",
        latitude=latitude,
        longitude=longitude,
        address=address,
        road_name=road_name or None,
        status="Pending",
        similar_reports=0,
    )
    db.add(rep)
    db.commit()
    db.refresh(rep)

    # Save photos
    uid = str(uuid.uuid4())
    paths = []
    for idx, p in enumerate([photo_1, photo_2, photo_3], start=1):
        # just in case any is None
        if p:
            url_path = save_photo(p, prefix=f"{rep.id}_{uid}_{idx}")
            paths.append(url_path)
        else:
            paths.append(None)

    rep.photo_1_path, rep.photo_2_path, rep.photo_3_path = paths
    db.add(rep)
    db.commit()

    return SubmitResponse(id=rep.id, documentNumber=rep.document_number)

@app.get("/api/reports", response_model=ReportListOut)
def list_reports(limit: int = 20, db: Session = Depends(get_db)):
    q = db.execute(select(Report).order_by(Report.created_at.desc()).limit(limit))
    rows = q.scalars().all()
    total = db.execute(select(func.count(Report.id))).scalar_one()
    items = []
    for r in rows:
        items.append(
            ReportOut(
                id=r.id,
                document_number=r.document_number,
                location=r.address if r.address else "Unknown location",
                date=r.created_at.date().isoformat() if r.created_at else dt.date.today().isoformat(),
                status=r.status or "Pending",
                similarReports=r.similar_reports or 0,
                photoUrls=[p for p in [r.photo_1_path, r.photo_2_path, r.photo_3_path] if p],
            )
        )
    return ReportListOut(items=items, total=total)

@app.get("/api/reports/{report_id}", response_model=ReportOut)
def get_report(report_id: int, db: Session = Depends(get_db)):
    r = db.get(Report, report_id)
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    return ReportOut(
        id=r.id,
        document_number=r.document_number,
        location=r.address if r.address else "Unknown location",
        date=r.created_at.date().isoformat() if r.created_at else dt.date.today().isoformat(),
        status=r.status or "Pending",
        similarReports=r.similar_reports or 0,
        photoUrls=[p for p in [r.photo_1_path, r.photo_2_path, r.photo_3_path] if p],
    )
