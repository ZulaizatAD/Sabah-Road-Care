from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from datetime import datetime

from services.database.connect import get_db
from services.ai.pothole_analyzer import pothole_analyzer
from schemas.report import CaseResponse
from schemas.user import UserOut
import models
from services.auth.security import get_current_user  # Your auth dependency
import requests
from urllib.parse import urlparse

router = APIRouter(tags=["reports"])

@router.get("/user/reports", response_model=List[CaseResponse])
async def get_user_reports(
    current_user: UserOut = Depends(get_current_user),
    db: Session = Depends(get_db),
    status_filter: Optional[str] = None,
    district_filter: Optional[str] = None,
    severity_filter: Optional[str] = None
):
    """Get all reports for the current user with optional filters"""
    try:
        query = db.query(models.PotholeReport).filter(
            models.PotholeReport.user_id == current_user.id
        )
        
        # Apply filters if provided
        if status_filter and status_filter != "all":
            query = query.filter(models.PotholeReport.status == status_filter)
        
        if district_filter and district_filter != "all":
            query = query.filter(models.PotholeReport.district == district_filter)
            
        if severity_filter and severity_filter != "all":
            query = query.filter(models.PotholeReport.severity == severity_filter)
        
        reports = query.order_by(models.PotholeReport.date_created.desc()).all()
        
        return reports
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch reports: {str(e)}"
        )

@router.post("/{case_id}/analyze")
async def analyze_report(
    case_id: str,
    current_user: UserOut = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI analysis for a specific report"""
    try:
        # Get the report from database
        report = db.query(models.PotholeReport).filter(
            models.PotholeReport.case_id == case_id,
            models.PotholeReport.user_id == current_user.id
        ).first()
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found or you don't have permission to access it"
            )
        
        # Check if analysis already exists
        if report.ai_analysis_details:
            return {
                "success": True,
                "message": "Analysis already exists",
                "case_id": case_id,
                "base_severity": report.severity,
                "final_priority": report.priority,
                "analysis_date": report.last_date_status_update.isoformat(),
                "similar_reports": report.ai_analysis_details.get("similar_reports", 1),
                "unique_users": report.ai_analysis_details.get("unique_users", 1),
                "community_multiplier": report.ai_analysis_details.get("community_multiplier", 1.0),
                "measurements": report.ai_analysis_details.get("measurements", {}),
                "confidence": report.ai_analysis_details.get("confidence", 0.8),
                "priority_reason": report.ai_analysis_details.get("priority_reason", f"Previous analysis - Severity: {report.severity}"),
                "analysis_details": report.ai_analysis_details
            }
        
        # Load images from storage
        try:
            top_image = load_image_from_storage(report.photo_top)
            far_image = load_image_from_storage(report.photo_far)
            close_image = load_image_from_storage(report.photo_close)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to load images: {str(e)}"
            )
        
        # Run AI analysis
        analysis_result = await pothole_analyzer.analyze_pothole_priority(
            top_image=top_image,
            far_image=far_image,
            close_image=close_image,
            case_id=case_id,
            report_text=report.description,
            latitude=float(report.latitude),
            longitude=float(report.longitude),
            db=db
        )
        
        # Update report with AI results using YOUR existing fields
        if analysis_result["success"]:
            # Update using your existing field names
            report.severity = analysis_result["base_severity"]
            report.priority = analysis_result["final_priority"]
            report.ai_analysis_details = analysis_result  # Store full analysis
            report.last_date_status_update = datetime.utcnow()  # Use existing timestamp field
            
            try:
                db.commit()
                print(f"✅ AI analysis saved for report {case_id}")
            except Exception as e:
                db.rollback()
                print(f"❌ Failed to save analysis: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to save analysis results"
                )
        
        return analysis_result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Analysis failed for {case_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.get("/{case_id}", response_model=CaseResponse)
async def get_report_details(
    case_id: str,
    current_user: UserOut = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information for a specific report"""
    try:
        report = db.query(models.PotholeReport).filter(
            models.PotholeReport.case_id == case_id,
            models.PotholeReport.user_id == current_user.id
        ).first()
        
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch report: {str(e)}"
        )

def load_image_from_storage(image_url: str) -> bytes:
    """Download image from Cloudinary URL"""
    try:
        # Check if it's a URL (Cloudinary) or local path
        parsed_url = urlparse(image_url)
        
        if parsed_url.scheme in ['http', 'https']:
            # It's a URL - download from Cloudinary
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()  # Raises an exception for bad status codes
            return response.content
        else:
            # It's a local file path
            if os.path.exists(image_url):
                with open(image_url, 'rb') as f:
                    return f.read()
            else:
                raise FileNotFoundError(f"Local file not found: {image_url}")
                
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to download image from {image_url}: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to load image {image_url}: {str(e)}")

# Optional: Get AI analysis status for multiple reports
@router.get("/analysis-status")
async def get_analysis_status(
    current_user: UserOut = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI analysis status for all user reports"""
    try:
        reports = db.query(models.PotholeReport).filter(
            models.PotholeReport.user_id == current_user.id
        ).all()
        
        status_data = []
        for report in reports:
            has_analysis = (
                hasattr(report, 'ai_analysis') and 
                report.ai_analysis is not None
            )
            
            status_data.append({
                "case_id": report.case_id,
                "has_ai_analysis": has_analysis,
                "severity": report.severity,
                "priority": getattr(report, 'priority', None),
                "analysis_date": getattr(report, 'analysis_date', None)
            })
        
        analyzed_count = sum(1 for item in status_data if item["has_ai_analysis"])
        
        return {
            "success": True,
            "total_reports": len(status_data),
            "analyzed_reports": analyzed_count,
            "pending_analysis": len(status_data) - analyzed_count,
            "reports": status_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get analysis status: {str(e)}"
        )