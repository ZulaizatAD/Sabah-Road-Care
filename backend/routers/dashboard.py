from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import models
from services.database.connect import get_db
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# UPDATED: Added /api prefix to match frontend
router = APIRouter ()

def get_filtered_reports(district=None, start_date=None, end_date=None, severity=None, db_session=None):
    """Filter reports based on provided criteria."""
    logger.info(f"Filters - District: {district}, Start Date: {start_date}, End Date: {end_date}, Severity: {severity}")
    
    query = db_session.query(models.PotholeReport)

    if district:
        query = query.filter(models.PotholeReport.district == district)
    if start_date:
        query = query.filter(models.PotholeReport.date_created >= start_date)
    if end_date:
        query = query.filter(models.PotholeReport.date_created <= end_date)
    if severity:
        query = query.filter(models.PotholeReport.severity == severity)

    results = query.all()
    logger.info(f"Filtered reports count: {len(results)}")
    return query

@router.get("/dashboard/reports/count")
def get_report_count(
    district: Optional[str] = Query(None, description="Filter by district"),
    start_date: Optional[str] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filter by end date (YYYY-MM-DD)"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    db: Session = Depends(get_db)
):
    """Get count of reports based on filters."""
    count = get_filtered_reports(district, start_date, end_date, severity, db).count()
    return {"number_of_cases": count}

@router.get("/dashboard/stats")
def get_dashboard_stats(
    district: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics based on filters."""
    query = get_filtered_reports(district, start_date, end_date, severity, db)

    stats = {
        "totalCases": query.count(),
        "underReview": query.filter(models.PotholeReport.status == 'Under Review').count(),
        "approved": query.filter(models.PotholeReport.status == 'Approved').count(),
        "inProgress": query.filter(models.PotholeReport.status == 'In Progress').count(),
        "completed": query.filter(models.PotholeReport.status == 'Completed').count(),
        "rejected": query.filter(models.PotholeReport.status == 'Rejected').count(),
    }
    return stats

@router.get("/dashboard/charts")
def get_charts_data(
    district: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get chart data based on filters."""
    query = get_filtered_reports(district, start_date, end_date, severity, db)

    # 🔥 UPDATED: Filter pie chart to only show Low, Medium, High
    allowed_severities = ["Low", "Medium", "High"]
    
    # Get severity counts but filter to only allowed severities
    severity_counts = (
        query.with_entities(
            models.PotholeReport.severity, 
            func.count(models.PotholeReport.severity)
        )
        .filter(models.PotholeReport.severity.in_(allowed_severities))  # 🔥 NEW: Filter here
        .group_by(models.PotholeReport.severity)
        .all()
    )
    
    # 🔥 UPDATED: Ensure all three severities are included even if count is 0
    pie_data = []
    severity_dict = {severity: count for severity, count in severity_counts}
    
    for severity in allowed_severities:
        count = severity_dict.get(severity, 0)  # Default to 0 if not found
        pie_data.append({
            "name": severity,
            "value": count,
            "color": get_color(severity)
        })

    # Trend data (unchanged)
    trend_data = query.with_entities(
        func.to_char(models.PotholeReport.date_created, 'YYYY-MM').label('month'), 
        func.count(models.PotholeReport.case_id)
    ).group_by('month').all()
    trend_data = [{"month": month, "cases": count} for month, count in trend_data]

    return {"pieData": pie_data, "trendData": trend_data}

# ADDED: Export endpoint that was missing
@router.get("/dashboard/export")
def export_dashboard(
    format: Optional[str] = Query("csv", description="Export format (csv, pdf)"),
    district: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Export dashboard data."""
    from fastapi.responses import StreamingResponse
    import io
    import csv
    
    query = get_filtered_reports(district, start_date, end_date, severity, db)
    stats = {
        "totalCases": query.count(),
        "underReview": query.filter(models.PotholeReport.status == 'Under Review').count(),
        "approved": query.filter(models.PotholeReport.status == 'Approved').count(),
        "inProgress": query.filter(models.PotholeReport.status == 'In Progress').count(),
        "completed": query.filter(models.PotholeReport.status == 'Completed').count(),
        "rejected": query.filter(models.PotholeReport.status == 'Rejected').count(),
    }
    
    if format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Report Type", "Count"])
        for key, value in stats.items():
            writer.writerow([key, value])
        
        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=dashboard_stats.csv"}
        )
    
    # For PDF format, you'd need to implement PDF generation
    return {"message": "PDF export not implemented yet"}

def get_color(severity):
    """Get color for severity level."""
    colors = {
        "Low": "#82ca9d",
        "Medium": "#ffc658",
        "High": "#ff7c7c",
    }
    return colors.get(severity, "#000000")  # Defa