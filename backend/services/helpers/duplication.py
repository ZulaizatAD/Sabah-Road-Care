from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from models import PotholeReport
from geopy.distance import geodesic
import math
from typing import Dict, List, Any

class DuplicationService:
    """Service for handling duplicate report detection and analysis"""
    
    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two coordinates in meters"""
        try:
            return geodesic((lat1, lon1), (lat2, lon2)).meters
        except Exception:
            # Fallback to haversine formula if geopy fails
            R = 6371000  # Earth's radius in meters
            lat1_rad = math.radians(lat1)
            lat2_rad = math.radians(lat2)
            delta_lat = math.radians(lat2 - lat1)
            delta_lon = math.radians(lon2 - lon1)
            
            a = (math.sin(delta_lat/2) * math.sin(delta_lat/2) + 
                 math.cos(lat1_rad) * math.cos(lat2_rad) * 
                 math.sin(delta_lon/2) * math.sin(delta_lon/2))
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            return R * c

    @staticmethod
    def generate_location_hash(latitude: float, longitude: float, precision: int = 4) -> str:
        """Generate a location hash for duplicate detection"""
        return f"{round(latitude, precision)}_{round(longitude, precision)}"

    @staticmethod
    def get_user_recent_reports(
        db: Session, 
        user_id: int, 
        hours_back: int = 72
    ) -> List[PotholeReport]:
        """Get user's recent reports within specified hours"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours_back)
        
        return (
            db.query(PotholeReport)
            .filter(
                and_(
                    PotholeReport.user_id == user_id,
                    PotholeReport.date_created >= cutoff_time
                )
            )
            .all()
        )

    @staticmethod
    def get_nearby_reports(
        db: Session,
        latitude: float,
        longitude: float,
        radius_meters: int = 100,
        days_back: int = 30,
        exclude_user_id: int = None
    ) -> List[PotholeReport]:
        """Get reports within specified radius and time range"""
        cutoff_time = datetime.utcnow() - timedelta(days=days_back)
        
        # Use bounding box for initial database filter (performance optimization)
        # Roughly 0.001 degrees ≈ 100 meters
        lat_range = radius_meters / 111000  # 1 degree ≈ 111km
        lon_range = radius_meters / (111000 * math.cos(math.radians(latitude)))
        
        query = db.query(PotholeReport).filter(
            and_(
                PotholeReport.latitude.between(
                    latitude - lat_range, 
                    latitude + lat_range
                ),
                PotholeReport.longitude.between(
                    longitude - lon_range, 
                    longitude + lon_range
                ),
                PotholeReport.date_created >= cutoff_time
            )
        )
        
        if exclude_user_id:
            query = query.filter(PotholeReport.user_id != exclude_user_id)
        
        return query.all()

    @staticmethod
    def analyze_user_duplicates(
        user_reports: List[PotholeReport],
        target_latitude: float,
        target_longitude: float,
        radius_meters: int = 100,
        blocking_hours: int = 72
    ) -> Dict[str, Any]:
        """Analyze user's duplicate submissions (blocking check)"""
        current_time = datetime.utcnow()
        duplicates = []
        
        for report in user_reports:
            distance = DuplicationService.calculate_distance(
                target_latitude, target_longitude,
                report.latitude, report.longitude
            )
            
            if distance <= radius_meters:
                hours_ago = (current_time - report.date_created).total_seconds() / 3600
                remaining_hours = max(0, blocking_hours - hours_ago)
                
                duplicates.append({
                    'report_id': report.id,
                    'case_id': report.case_id,
                    'distance': round(distance, 2),
                    'hours_ago': round(hours_ago, 1),
                    'remaining_hours': round(remaining_hours, 1),
                    'location': report.location,
                    'status': report.status
                })
        
        return {
            'has_duplicates': len(duplicates) > 0,
            'can_submit': len(duplicates) == 0,
            'duplicates': duplicates,
            'blocking_hours': blocking_hours
        }

    @staticmethod
    def analyze_similar_reports(
        nearby_reports: List[PotholeReport],
        target_latitude: float,
        target_longitude: float,
        radius_meters: int = 100
    ) -> Dict[str, Any]:
        """Analyze similar reports for priority calculation"""
        current_time = datetime.utcnow()
        similar_reports = []
        unique_users = set()
        
        for report in nearby_reports:
            distance = DuplicationService.calculate_distance(
                target_latitude, target_longitude,
                report.latitude, report.longitude
            )
            
            if distance <= radius_meters:
                hours_ago = (current_time - report.date_created).total_seconds() / 3600
                
                similar_reports.append({
                    'report_id': report.id,
                    'case_id': report.case_id,
                    'distance': round(distance, 2),
                    'hours_ago': round(hours_ago, 1),
                    'user_id': report.user_id,
                    'status': report.status,
                    'location': report.location,
                    'severity': report.severity
                })
                unique_users.add(report.user_id)
        
        return {
            'similar_reports': similar_reports,
            'similar_count': len(similar_reports),
            'unique_users': len(unique_users),
            'unique_user_ids': list(unique_users)
        }

    @staticmethod
    def calculate_priority_and_severity(
        similar_count: int,
        unique_users: int,
        base_severity: str = "Low"
    ) -> Dict[str, Any]:
        """Calculate priority and severity based on similar reports"""
        
        # Priority calculation
        if similar_count >= 5:
            priority = "High"
            severity_multiplier = 2.0
        elif similar_count >= 2:
            priority = "Medium"
            severity_multiplier = 1.5
        else:
            priority = "Low"
            severity_multiplier = 1.0
        
        # Additional boost for multiple unique users
        if unique_users >= 3:
            severity_multiplier += 0.5
            if priority == "Medium":
                priority = "High"
        
        # Final severity calculation
        severity_map = {"Low": 1, "Medium": 2, "High": 3}
        base_level = severity_map.get(base_severity, 1)
        boosted_level = min(3, int(base_level * severity_multiplier))
        
        severity_reverse_map = {1: "Low", 2: "Medium", 3: "High"}
        final_severity = severity_reverse_map[boosted_level]
        
        return {
            'priority': priority,
            'severity': final_severity,
            'severity_multiplier': severity_multiplier,
            'boost_reason': f"Boosted by {similar_count} similar reports from {unique_users} users"
        }

    @staticmethod
    def check_duplicate_submission(
        db: Session,
        user_id: int,
        latitude: float,
        longitude: float,
        radius_meters: int = 100,
        base_severity: str = "Low"
    ) -> Dict[str, Any]:
        """
        Main method to check for duplicates and calculate priority
        
        Returns comprehensive duplication analysis
        """
        
        # 1. Get user's recent reports (blocking check)
        user_recent_reports = DuplicationService.get_user_recent_reports(
            db=db,
            user_id=user_id,
            hours_back=72
        )
        
        # 2. Analyze user duplicates
        user_analysis = DuplicationService.analyze_user_duplicates(
            user_reports=user_recent_reports,
            target_latitude=latitude,
            target_longitude=longitude,
            radius_meters=radius_meters
        )
        
        # 3. Get nearby reports from other users
        nearby_reports = DuplicationService.get_nearby_reports(
            db=db,
            latitude=latitude,
            longitude=longitude,
            radius_meters=radius_meters,
            days_back=30,
            exclude_user_id=user_id
        )
        
        # 4. Analyze similar reports
        similar_analysis = DuplicationService.analyze_similar_reports(
            nearby_reports=nearby_reports,
            target_latitude=latitude,
            target_longitude=longitude,
            radius_meters=radius_meters
        )
        
        # 5. Calculate priority and severity
        priority_analysis = DuplicationService.calculate_priority_and_severity(
            similar_count=similar_analysis['similar_count'],
            unique_users=similar_analysis['unique_users'],
            base_severity=base_severity
        )
        
        # 6. Generate location hash
        location_hash = DuplicationService.generate_location_hash(latitude, longitude)
        
        # 7. Compile comprehensive result
        return {
            # Blocking information
            'can_submit': user_analysis['can_submit'],
            'is_blocked': not user_analysis['can_submit'],
            'user_duplicates': user_analysis['duplicates'],
            
            # Similar reports information
            'similar_reports': similar_analysis['similar_reports'],
            'similar_count': similar_analysis['similar_count'],
            'unique_users': similar_analysis['unique_users'],
            'unique_user_ids': similar_analysis['unique_user_ids'],
            
            # Priority and severity
            'calculated_priority': priority_analysis['priority'],
            'calculated_severity': priority_analysis['severity'],
            'severity_multiplier': priority_analysis['severity_multiplier'],
            'boost_reason': priority_analysis['boost_reason'],
            
            # Metadata
            'location_hash': location_hash,
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'radius_meters': radius_meters,
            
            # Summary message
            'summary_message': DuplicationService._generate_summary_message(
                user_analysis, similar_analysis, priority_analysis
            )
        }

    @staticmethod
    def _generate_summary_message(
        user_analysis: Dict,
        similar_analysis: Dict,
        priority_analysis: Dict
    ) -> str:
        """Generate human-readable summary message"""
        
        if not user_analysis['can_submit']:
            duplicate = user_analysis['duplicates'][0]
            return (
                f"Cannot submit: You already reported this location "
                f"{duplicate['hours_ago']:.1f} hours ago. "
                f"Please wait {duplicate['remaining_hours']:.1f} more hours."
            )
        
        if similar_analysis['similar_count'] == 0:
            return "No similar reports found. Your report will help identify this issue."
        
        return (
            f"Found {similar_analysis['similar_count']} similar reports "
            f"from {similar_analysis['unique_users']} users. "
            f"Priority boosted to {priority_analysis['priority']}!"
        )

# Convenience functions for backward compatibility
def check_duplicate_reports(db: Session, user_id: int, latitude: float, longitude: float, radius_meters: int = 100):
    """Backward compatible function"""
    return DuplicationService.check_duplicate_submission(
        db=db,
        user_id=user_id,
        latitude=latitude,
        longitude=longitude,
        radius_meters=radius_meters
    )
