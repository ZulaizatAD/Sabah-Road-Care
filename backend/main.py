# backend/main.py
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models.models as models
import schemas.schemas as schemas
from db.database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency - DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/cases", response_model=list[schemas.CaseBase])
def get_cases(db: Session = Depends(get_db)):
    return db.query(models.Case).all()


@app.get("/cases/{case_id}", response_model=schemas.CaseBase)
def get_case(case_id: str, db: Session = Depends(get_db)):
    return db.query(models.Case).filter(models.Case.case_id == case_id).first()
