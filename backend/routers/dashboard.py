from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
import models
from database.connection import get_db

router = APIRouter()

@router.get("/dashboard/reports/count")
def get_report_count(
    district: Optional[str] = Query(None, description="Filter by district"),
    start_date: Optional[str] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (YYYY-MM-DD)"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    db: Session = Depends(get_db)
):
    query = db.query(models.PotholeReport)

    if district:
        query = query.filter(models.PotholeReport.district == district)
    if start_date:
        query = query.filter(models.PotholeReport.date_created >= start_date)
    if end_date:
        query = query.filter(models.PotholeReport.date_created <= end_date)
    if severity:
        query = query.filter(models.PotholeReport.severity == severity)

    count = query.count()
    return {"number_of_cases": count}