from fastapi import APIRouter, Query, Depends, Form, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from models import PotholeReport
import models
from services.database.connect import get_db
from services.cloudinary.service import CloudinaryService
from services.helpers.gencaseid import gen_case_id
from services.helpers.duplication import DuplicationService
from services.auth.security import get_current_user
import traceback
import sys

router = APIRouter()

@router.post("/report")
async def submit_report(
    district: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(...),
    remarks: str = Form(None),
    photo_top: UploadFile = File(...),
    photo_far: UploadFile = File(...),
    photo_close: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # ✅ COMPREHENSIVE DEBUG LOGGING
    print("🔍 === REPORT SUBMISSION DEBUG START ===")
    print(f"✅ User authenticated: {current_user.id if current_user else 'None'}")
    print(f"✅ User email: {current_user.email if current_user else 'None'}")
    print(f"✅ District: {district}")
    print(f"✅ Location: {latitude}, {longitude}")
    print(f"✅ Address: {address}")
    print(f"✅ Remarks: {remarks}")
    
    # 🔍 DETAILED FILE DEBUG
    print(f"✅ Photo top - filename: {photo_top.filename}, content_type: {photo_top.content_type}, size: {photo_top.size if hasattr(photo_top, 'size') else 'unknown'}")
    print(f"✅ Photo far - filename: {photo_far.filename}, content_type: {photo_far.content_type}, size: {photo_far.size if hasattr(photo_far, 'size') else 'unknown'}")
    print(f"✅ Photo close - filename: {photo_close.filename}, content_type: {photo_close.content_type}, size: {photo_close.size if hasattr(photo_close, 'size') else 'unknown'}")
    
    # 🔍 VALIDATE INPUTS
    print("🔍 === INPUT VALIDATION ===")
    
    # Check required fields
    if not district:
        print("❌ District is empty")
        raise HTTPException(status_code=400, detail="District is required")
    
    if not address:
        print("❌ Address is empty")
        raise HTTPException(status_code=400, detail="Address is required")
    
    # Validate coordinates
    if not (-90 <= latitude <= 90):
        print(f"❌ Invalid latitude: {latitude}")
        raise HTTPException(status_code=400, detail=f"Invalid latitude: {latitude}")
    
    if not (-180 <= longitude <= 180):
        print(f"❌ Invalid longitude: {longitude}")
        raise HTTPException(status_code=400, detail=f"Invalid longitude: {longitude}")
    
    # Validate files
    for file, name in [(photo_top, "top"), (photo_far, "far"), (photo_close, "close")]:
        if not file or not file.filename:
            print(f"❌ Missing {name} photo")
            raise HTTPException(status_code=400, detail=f"Photo {name} is required")
        
        # Check file type
        if not file.content_type or not file.content_type.startswith('image/'):
            print(f"❌ Invalid file type for {name}: {file.content_type}")
            raise HTTPException(status_code=400, detail=f"Photo {name} must be an image")
    
    print("✅ All input validation passed")
    
    try:
        print("🔍 === STARTING DUPLICATE CHECK ===")
        
        # 🔍 DUPLICATE DETECTION - Check before processing
        try:
            duplicate_analysis = DuplicationService.check_duplicate_submission(
                db=db,
                user_id=current_user.id,
                latitude=latitude,
                longitude=longitude,
                radius_meters=1,
                base_severity="Low"
            )
            print(f"✅ Duplicate analysis completed: {duplicate_analysis}")
        except Exception as dup_error:
            print(f"❌ Duplicate analysis failed: {str(dup_error)}")
            print(f"❌ Duplicate analysis traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Duplicate analysis failed: {str(dup_error)}")
        
        # 🚫 BLOCKING: Prevent user duplicate submissions
        if duplicate_analysis['is_blocked']:
            print("🚫 Submission blocked due to duplicate")
            user_duplicate = duplicate_analysis['user_duplicates'][0]
            raise HTTPException(
                status_code=409,  # Conflict status code
                detail={
                    "error": "Duplicate submission detected",
                    "message": duplicate_analysis['summary_message'],
                    "code": "DUPLICATE_SUBMISSION",
                    "previous_report": user_duplicate['case_id'],
                    "wait_hours": user_duplicate['remaining_hours'],
                    "duplicate_details": user_duplicate
                }
            )
        
        print("🔍 === GENERATING CASE ID ===")
        
        # Generate case ID
        try:
            case_id = gen_case_id(district, db)
            print(f"✅ Generated case ID: {case_id}")
        except Exception as case_error:
            print(f"❌ Case ID generation failed: {str(case_error)}")
            print(f"❌ Case ID traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Case ID generation failed: {str(case_error)}")

        print("🔍 === UPLOADING IMAGES ===")
        
        # Upload images to Cloudinary
        uploaded = {}
        try:
            for file, label in [
                (photo_top, "top"),
                (photo_far, "far"),
                (photo_close, "close"),
            ]:
                print(f"🔍 Uploading {label} image: {file.filename}")
                
                # Read file content
                try:
                    file_content = await file.read()
                    print(f"✅ Read {len(file_content)} bytes for {label}")
                except Exception as read_error:
                    print(f"❌ Failed to read {label} file: {str(read_error)}")
                    raise HTTPException(status_code=400, detail=f"Failed to read {label} image")
                
                # Upload to Cloudinary
                try:
                    upload_result = await CloudinaryService.upload_pothole_image(
                        file_content=file_content,
                        filename=file.filename,
                        image_type=label,
                        case_id=case_id
                    )
                    print(f"✅ Upload result for {label}: {upload_result}")
                    
                    if not upload_result["success"]:
                        print(f"❌ Upload failed for {label}: {upload_result}")
                        raise HTTPException(status_code=500, detail=f"Failed to upload {label} image")
                    
                    uploaded[label] = upload_result["secure_url"]
                    print(f"✅ Uploaded {label} to: {uploaded[label]}")
                    
                except Exception as upload_error:
                    print(f"❌ Cloudinary upload failed for {label}: {str(upload_error)}")
                    print(f"❌ Upload traceback: {traceback.format_exc()}")
                    raise HTTPException(status_code=500, detail=f"Image upload failed for {label}: {str(upload_error)}")
                
        except Exception as e:
            print(f"❌ Image upload process failed: {str(e)}")
            print(f"❌ Upload process traceback: {traceback.format_exc()}")
            
            # cleanup in case some uploaded
            for url in uploaded.values():
                try:
                    public_id = url.split("/")[-1].split(".")[0]
                    await CloudinaryService.delete_image(public_id)
                    print(f"🧹 Cleaned up uploaded image: {public_id}")
                except Exception as cleanup_error:
                    print(f"⚠️ Cleanup failed for {url}: {str(cleanup_error)}")
            
            raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

        print("🔍 === SAVING TO DATABASE ===")
        
        # Save report in DB with calculated priority and severity from duplication analysis
        try:
            report = models.PotholeReport(
                case_id=case_id,
                district=district,
                latitude=latitude,
                longitude=longitude,
                location=address,
                description=remarks,
                email=current_user.email,
                user_id=current_user.id,
                photo_top=uploaded["top"],
                photo_far=uploaded["far"],
                photo_close=uploaded["close"],
                status="Submitted",
                severity=duplicate_analysis['calculated_severity'],
                priority=duplicate_analysis['calculated_priority'],
                similar_reports_count=duplicate_analysis['similar_count'],
                date_created=datetime.utcnow(),
            )
            print(f"✅ Created report object: {report}")
            
            db.add(report)
            print("✅ Added report to session")
            
            db.commit()
            print("✅ Committed to database")
            
            db.refresh(report)
            print(f"✅ Refreshed report: {report.case_id}")
            
        except Exception as db_error:
            print(f"❌ Database save failed: {str(db_error)}")
            print(f"❌ Database traceback: {traceback.format_exc()}")
            
            # Rollback transaction
            try:
                db.rollback()
                print("🔄 Database rollback completed")
            except Exception as rollback_error:
                print(f"❌ Rollback failed: {str(rollback_error)}")
            
            raise HTTPException(status_code=500, detail=f"Database save failed: {str(db_error)}")

        print("🔍 === PREPARING RESPONSE ===")
        
        # 🎉 Enhanced response with duplication info
        response_message = "Report submitted successfully!"
        if duplicate_analysis['similar_count'] > 0:
            response_message += f" Priority boosted to {duplicate_analysis['calculated_priority']} due to {duplicate_analysis['similar_count']} similar reports!"

        response_data = {
            "success": True,
            "message": response_message,
            "case_id": case_id,
            "priority": duplicate_analysis['calculated_priority'],
            "severity": duplicate_analysis['calculated_severity'],
            "similar_reports_found": duplicate_analysis['similar_count'],
            "unique_reporters": duplicate_analysis['unique_users'],
            "boost_reason": duplicate_analysis['boost_reason'],
            "duplicate_metadata": {
                "location_hash": duplicate_analysis['location_hash'],
                "similar_count": duplicate_analysis['similar_count'],
                "severity_multiplier": duplicate_analysis['severity_multiplier']
            }
        }
        
        print(f"✅ Response prepared: {response_data}")
        print("🔍 === REPORT SUBMISSION SUCCESS ===")
        
        return response_data
    
    except HTTPException as http_error:
        print(f"🚫 HTTP Exception: {http_error.status_code} - {http_error.detail}")
        # Re-raise HTTP exceptions (like 409 duplicate, 400 validation)
        raise
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        print(f"❌ Full traceback: {traceback.format_exc()}")
        print(f"❌ Exception type: {type(e).__name__}")
        print(f"❌ Exception args: {e.args}")
        
        # Handle unexpected errors
        raise HTTPException(status_code=500, detail=f"Failed to submit report: {str(e)}")


@router.get("/recent-submissions")
def get_recent_submissions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    print(f"🔍 Getting recent submissions for user: {current_user.id}")
    try:
        reports = (
            db.query(PotholeReport)
            .filter(PotholeReport.user_id == current_user.id)
            .order_by(PotholeReport.date_created.desc())
            .limit(10)
            .all()
        )
        
        print(f"✅ Found {len(reports)} recent reports")

        return {
            "success": True,
            "reports": [
                {
                    "case_id": report.case_id,
                    "location": report.location,
                    "date_created": report.date_created.strftime("%Y-%m-%d"),
                    "similar_reports_count": getattr(report, 'similar_reports_count', 0),  
                    "status": report.status,
                    "priority": getattr(report, 'priority', 'Medium'),  
                    "severity": getattr(report, 'severity', 'Low'),     
                }
                for report in reports
            ]
        }
    except Exception as e:
        print(f"❌ Recent submissions error: {str(e)}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to get recent submissions: {str(e)}")


@router.post("/check-duplicates")
def check_duplicates_preview(
    latitude: float = Form(...),
    longitude: float = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Optional endpoint to check duplicates before submission
    Frontend can call this to show warnings/info to users
    """
    print(f"🔍 Checking duplicates for user {current_user.id} at {latitude}, {longitude}")
    try:
        duplicate_analysis = DuplicationService.check_duplicate_submission(
            db=db,
            user_id=current_user.id,
            latitude=latitude,
            longitude=longitude,
            radius_meters=100,
            base_severity="Low"
        )
        
        print(f"✅ Duplicate check completed: {duplicate_analysis}")
        
        return {
            "success": True,
            "can_submit": duplicate_analysis['can_submit'],
            "is_blocked": duplicate_analysis['is_blocked'],
            "user_duplicates_count": len(duplicate_analysis['user_duplicates']),
            "similar_reports_count": duplicate_analysis['similar_count'],
            "calculated_priority": duplicate_analysis['calculated_priority'],
            "calculated_severity": duplicate_analysis['calculated_severity'],
            "summary_message": duplicate_analysis['summary_message'],
            "boost_reason": duplicate_analysis['boost_reason'],
            "duplicate_metadata": {
                "location_hash": duplicate_analysis['location_hash'],
                "similar_count": duplicate_analysis['similar_count'],
                "severity_multiplier": duplicate_analysis['severity_multiplier'],
            },
            "user_duplicates": duplicate_analysis['user_duplicates'][:3],  
            "similar_reports": duplicate_analysis['similar_reports'][:5],  
        }
    except Exception as e:
        print(f"❌ Duplicate check error: {str(e)}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to check duplicates: {str(e)}")


@router.get("/nearby-reports")
def get_nearby_reports(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius_km: float = Query(5.0, description="Search radius in kilometers"),
    db: Session = Depends(get_db)
):
    print(f"🔍 Getting nearby reports for {lat}, {lng} within {radius_km}km")
    try:
        reports = db.query(PotholeReport).all()

        def haversine(lat1, lon1, lat2, lon2):
            from math import radians, sin, cos, sqrt, atan2
            R = 6371  # Earth radius in km
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
            c = 2 * atan2(sqrt(a), sqrt(1-a))
            return R * c

        nearby_reports = [
            r for r in reports
            if haversine(lat, lng, r.latitude, r.longitude) <= radius_km
        ]

        print(f"✅ Found {len(nearby_reports)} nearby reports")

        return {
            "success": True,
            "nearby_cases_count": len(nearby_reports),
            "radius_km": radius_km
        }
    
    except Exception as e:
        print(f"❌ Nearby reports error: {str(e)}")
        print(f"❌ Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to get nearby reports: {str(e)}")