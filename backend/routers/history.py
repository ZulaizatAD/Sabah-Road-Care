from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
import models
from database.connect import get_db
from auth.security import get_current_user
from schemas.report import CaseBase

router = APIRouter()

@router.get("/reports")
def get_user_reports(
    district: Optional[str] = Query(None, description="Filter by district"),
    start_date: Optional[str] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (YYYY-MM-DD)"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.PotholeReport).filter(models.PotholeReport.user_id == current_user.id)

    # Apply filters
    if district:
        query = query.filter(models.PotholeReport.district == district)
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(models.PotholeReport.date_created >= start_date_obj)
        except ValueError:
            return []
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(models.PotholeReport.date_created <= end_date_obj)
        except ValueError:
            return []
    if severity:
        query = query.filter(models.PotholeReport.severity == severity)

    reports = query.order_by(models.PotholeReport.date_created.desc()).all()
    return reports
