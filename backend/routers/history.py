from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import models
from database.connect import get_db
from auth.security import get_current_user
from services.reports.report_query_service import query_user_reports

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
    start_date_obj = None
    end_date_obj = None
    if start_date:
        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
        except ValueError:
            return []
    if end_date:
        try:
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            return []
    query = query_user_reports(
        db,
        user_id=current_user.id,
        district=district,
        start_date=start_date_obj,
        end_date=end_date_obj,
        severity=severity,
    )

    reports = query.order_by(models.PotholeReport.date_created.desc()).all()
    return reports
