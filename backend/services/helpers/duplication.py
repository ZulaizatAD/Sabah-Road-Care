from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from typing import Dict, List, Any
from models import PotholeReport
import math

# Import utilities
from .dup_utils import calculate_distance, generate_location_hash

class DuplicationService:
    """Service for handling duplicate report detection and analysis"""

    @staticmethod
    def get_user_recent_reports(db: Session, user_id: int, hours_back: int = 72) -> List[PotholeReport]:
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

        # Bounding box (fast DB filter)
        lat_range = radius_meters / 111000
        lon_range = radius_meters / (111000 * math.cos(math.radians(latitude)))

        query = db.query(PotholeReport).filter(
            and_(
                PotholeReport.latitude.between(latitude - lat_range, latitude + lat_range),
                PotholeReport.longitude.between(longitude - lon_range, longitude + lon_range),
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
            distance = calculate_distance(target_latitude, target_longitude, report.latitude, report.longitude)

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
            distance = calculate_distance(target_latitude, target_longitude, report.latitude, report.longitude)

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
    def calculate_priority_and_severity(similar_count: int, unique_users: int, base_severity: str = "Low") -> Dict[str, Any]:
        """Calculate priority and severity based on similar reports"""
        if similar_count >= 5:
            priority = "High"
            severity_multiplier = 2.0
        elif similar_count >= 2:
            priority = "Medium"
            severity_multiplier = 1.5
        else:
            priority = "Low"
            severity_multiplier = 1.0

        if unique_users >= 3:
            severity_multiplier += 0.5
            if priority == "Medium":
                priority = "High"

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
        """Main method to check for duplicates and calculate priority"""
        user_recent_reports = DuplicationService.get_user_recent_reports(db=db, user_id=user_id, hours_back=72)

        user_analysis = DuplicationService.analyze_user_duplicates(
            user_reports=user_recent_reports,
            target_latitude=latitude,
            target_longitude=longitude,
            radius_meters=radius_meters
        )

        nearby_reports = DuplicationService.get_nearby_reports(
            db=db,
            latitude=latitude,
            longitude=longitude,
            radius_meters=radius_meters,
            days_back=30,
            exclude_user_id=user_id
        )

        similar_analysis = DuplicationService.analyze_similar_reports(
            nearby_reports=nearby_reports,
            target_latitude=latitude,
            target_longitude=longitude,
            radius_meters=radius_meters
        )

        priority_analysis = DuplicationService.calculate_priority_and_severity(
            similar_count=similar_analysis['similar_count'],
            unique_users=similar_analysis['unique_users'],
            base_severity=base_severity
        )

        location_hash = generate_location_hash(latitude, longitude)

        return {
            'can_submit': user_analysis['can_submit'],
            'is_blocked': not user_analysis['can_submit'],
            'user_duplicates': user_analysis['duplicates'],
            'similar_reports': similar_analysis['similar_reports'],
            'similar_count': similar_analysis['similar_count'],
            'unique_users': similar_analysis['unique_users'],
            'unique_user_ids': similar_analysis['unique_user_ids'],
            'calculated_priority': priority_analysis['priority'],
            'calculated_severity': priority_analysis['severity'],
            'severity_multiplier': priority_analysis['severity_multiplier'],
            'boost_reason': priority_analysis['boost_reason'],
            'location_hash': location_hash,
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'radius_meters': radius_meters,
            'summary_message': DuplicationService._generate_summary_message(user_analysis, similar_analysis, priority_analysis)
        }

    @staticmethod
    def _generate_summary_message(user_analysis: Dict, similar_analysis: Dict, priority_analysis: Dict) -> str:
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

# Convenience function
def check_duplicate_reports(db: Session, user_id: int, latitude: float, longitude: float, radius_meters: int = 100):
    return DuplicationService.check_duplicate_submission(
        db=db,
        user_id=user_id,
        latitude=latitude,
        longitude=longitude,
        radius_meters=radius_meters
    )
