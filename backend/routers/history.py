from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import models
from database.connect import get_db
from auth.user import get_current_user  # Assuming you have a function to get the current user
from schemas.report import CaseBase  # Assuming you have a Pydantic schema for reports

router = APIRouter()

@router.get("/history/reports", response_model=List[CaseBase])
def get_user_reports(
    district: Optional[str] = Query(None, description="Filter by district"),
    start_date: Optional[str] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (YYYY-MM-DD)"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.PotholeReport).filter(models.PotholeReport.user_id == current_user.id)

    if district:
        query = query.filter(models.PotholeReport.district == district)
    if start_date:
        query = query.filter(models.PotholeReport.date_created >= start_date)
    if end_date:
        query = query.filter(models.PotholeReport.date_created <= end_date)
    if severity:
        query = query.filter(models.PotholeReport.severity == severity)

    reports = query.all()
    return reports