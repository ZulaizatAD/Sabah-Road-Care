import random
import datetime
from collections import defaultdict
import json

from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

from database.connect import Base, engine
from models.users import User
from models.report import PotholeReport
from auth.security import get_password_hash

# --- Load environment variables ---
load_dotenv()

# --- Session setup ---
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- Static test users (team emails + extras) ---
TEAM_EMAILS = [
    "adli@example.com",
    "zul@example.com",
    "angelo@example.com",
    "william@example.com",
]

EXTRA_EMAILS = [
    "john@example.com",
    "mary@example.com",
    "ali@example.com",
    "siti@example.com",
    "ahmad@example.com",
    "lisa@example.com",
    "kumar@example.com",
    "chen@example.com",
    "sarah@example.com",
    "david@example.com",
]

ALL_EMAILS = TEAM_EMAILS + EXTRA_EMAILS

# --- Data pools ---
districts = [
    "Kota Kinabalu", "Sandakan", "Tawau", "Penampang", "Putatan",
    "Papar", "Tuaran", "Kudat", "Beaufort", "Ranau",
    "Kota Belud", "Keningau", "Semporna", "Kuala Penyu", 
    "Lahad Datu", "Others"
]

statuses = ["Submitted", "Under Review", "In Progress", "Completed", "Rejected"]
severity_levels = ["Low", "Medium", "High"]
priority_levels = ["Low", "Medium", "High"]

sabah_addresses = [
    "Jalan Tuaran, Kota Kinabalu",
    "Jalan Gaya, Kota Kinabalu",
    "Jalan Tanjung Aru, Kota Kinabalu",
    "Jalan Labuk, Sandakan",
    "Jalan Tawau Lama, Tawau",
    "Jalan Penampang, Penampang",
    "Jalan Kudat, Kudat",
    "Jalan Ranau, Ranau",
    "Jalan Keningau, Keningau",
    "Jalan Semporna, Semporna",
    "Jalan Lahad Datu, Lahad Datu",
]

descriptions = [
    "Large pothole causing traffic delays.",
    "Small crack starting to expand after heavy rain.",
    "Dangerous pothole near pedestrian crossing.",
    "Deep pothole affecting both lanes.",
    "Surface damage spreading along the road.",
    "Minor road damage but increasing in size.",
    "Hazardous pothole close to school area.",
    "Pothole filled with water, hard to spot.",
    "Severe road damage after recent flooding.",
    "Ongoing road erosion leading to potholes.",
]

# --- AI Analysis Data Generators ---
def generate_fake_ai_analysis():
    """Generate realistic fake AI analysis data"""
    severity = random.choice(severity_levels)
    confidence = random.uniform(0.65, 0.95)
    
    # Generate measurements based on severity
    if severity == "High":
        length = random.uniform(40, 80)
        width = random.uniform(30, 60)
        depth = random.uniform(6, 15)
    elif severity == "Medium":
        length = random.uniform(20, 45)
        width = random.uniform(15, 35)
        depth = random.uniform(3, 8)
    else:  # Low
        length = random.uniform(10, 25)
        width = random.uniform(8, 20)
        depth = random.uniform(1, 4)
    
    # Generate analysis scores
    scores = {
        "size_vs_road_width": random.randint(3, 9),
        "depth_texture": random.randint(3, 9),
        "cracks_edges": random.randint(3, 9),
        "surface_water": random.randint(3, 9)
    }
    
    analysis_details = {
        "base_analysis": {
            "severity": severity,
            "confidence": confidence,
            "scores": scores,
            "measurements": {
                "length_cm": round(length, 1),
                "width_cm": round(width, 1),
                "depth_cm": round(depth, 1)
            },
            "observations": {
                "size_analysis": f"Pothole measures approximately {length:.1f}cm x {width:.1f}cm",
                "depth_analysis": f"Estimated depth of {depth:.1f}cm based on shadow analysis",
                "crack_analysis": "Visible edge deterioration with minor cracking",
                "surface_analysis": "Surface shows signs of water damage and wear"
            }
        }
    }
    
    return {
        "severity": severity,
        "confidence": confidence,
        "length_cm": round(length, 1),
        "width_cm": round(width, 1),
        "depth_cm": round(depth, 1),
        "analysis_details": analysis_details
    }

def calculate_community_data():
    """Generate realistic community analysis data"""
    similar_reports = random.randint(1, 12)
    unique_users = min(similar_reports, random.randint(1, 8))
    
    # Calculate multiplier based on community rules
    if similar_reports >= 8 and unique_users >= 5:
        multiplier = 3.0
        priority = "High"
    elif similar_reports >= 5 and unique_users >= 3:
        multiplier = 2.0
        priority = "Medium"
    elif similar_reports >= 2:
        multiplier = 1.5
        priority = random.choice(["Medium", "High"])
    else:
        multiplier = 1.0
        priority = random.choice(severity_levels)
    
    return {
        "similar_reports": similar_reports,
        "unique_users": unique_users,
        "multiplier": multiplier,
        "priority": priority
    }

# --- Helpers ---
def generate_case_id(district, created_date, sequence_counters):
    """Generate case_id: SRC_DISTRICTCODE_YYYY_MM_####"""
    district_code = district.split()[0][:3].upper()
    year_part = str(created_date.year)
    month_part = f"{created_date.month:02d}"
    counter_key = f"{district_code}_{year_part}_{month_part}"

    seq_num = sequence_counters[counter_key]
    sequence_counters[counter_key] += 1
    return f"SRC_{district_code}_{year_part}_{month_part}_{seq_num:04d}"

# --- Create fixed users ---
def create_fixed_users(db):
    """Create fixed users with given emails, shared password: password123"""
    users = []
    for email in ALL_EMAILS:
        existing = db.query(User).filter_by(email=email).first()
        if existing:
            users.append(existing)
            continue

        user = User(
            email=email,
            full_name=email.split("@")[0].replace("_", " ").title(),
            password_hash=get_password_hash("password123"),
            profile_picture=None,
            is_active=True,
        )
        db.add(user)
        users.append(user)

    db.commit()
    return users

# --- Create fake reports with AI data ---
def create_fake_reports(db, users, num_reports=500):
    sequence_counters = defaultdict(int)
    reports = []

    for _ in range(num_reports):
        created_date = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(
            days=random.randint(0, 365)
        )
        days_after = random.randint(0, (datetime.datetime.now(datetime.timezone.utc) - created_date).days)
        status_update_date = created_date + datetime.timedelta(days=days_after)

        district = random.choice(districts)
        case_id = generate_case_id(district, created_date, sequence_counters)
        user = random.choice(users)

        # Determine if AI analysis is completed (90% completed for testing)
        ai_completed = random.choices([True, False], weights=[90, 10])[0]
        
        if ai_completed:
            # Generate AI analysis data
            ai_data = generate_fake_ai_analysis()
            community_data = calculate_community_data()
            
            severity = ai_data["severity"]
            priority = community_data["priority"]
            ai_confidence = ai_data["confidence"]
            pothole_length_cm = ai_data["length_cm"]
            pothole_width_cm = ai_data["width_cm"]
            pothole_depth_cm = ai_data["depth_cm"]
            similar_reports_count = community_data["similar_reports"]
            unique_users_count = community_data["unique_users"]
            community_multiplier = community_data["multiplier"]
            ai_analysis_details = ai_data["analysis_details"]
        else:
            # Reports still being analyzed
            severity = "Analyzing"
            priority = "Medium"
            ai_confidence = 0.0
            pothole_length_cm = None
            pothole_width_cm = None
            pothole_depth_cm = None
            similar_reports_count = 0
            unique_users_count = 0
            community_multiplier = 1.0
            ai_analysis_details = None

        report = PotholeReport(
            case_id=case_id,
            email=user.email,
            location=random.choice(sabah_addresses),
            district=district,
            date_created=created_date,
            last_date_status_update=status_update_date,
            severity=severity,
            status=random.choice(statuses),
            latitude=random.uniform(4.0, 7.5),
            longitude=random.uniform(115.0, 119.0),
            photo_top="https://res.cloudinary.com/demo/image/upload/v1234567890/top.jpg",
            photo_far="https://res.cloudinary.com/demo/image/upload/v1234567890/far.jpg",
            photo_close="https://res.cloudinary.com/demo/image/upload/v1234567890/close.jpg",
            description=random.choice(descriptions),
            user_id=user.id,
            
            # AI Analysis Fields
            ai_analysis_completed=ai_completed,
            ai_confidence=ai_confidence,
            priority=priority,
            pothole_length_cm=pothole_length_cm,
            pothole_width_cm=pothole_width_cm,
            pothole_depth_cm=pothole_depth_cm,
            similar_reports_count=similar_reports_count,
            unique_users_count=unique_users_count,
            community_multiplier=community_multiplier,
            ai_analysis_details=ai_analysis_details
        )
        reports.append(report)

    db.add_all(reports)
    db.commit()

# --- Populate DB ---
def populate_database(num_reports=500):
    db = SessionLocal()
    try:
        Base.metadata.drop_all(bind=engine)  # ✅ cleanup old tables
        Base.metadata.create_all(bind=engine)

        print("Creating fixed users...")
        users = create_fixed_users(db)

        print("Creating fake reports with AI analysis data...")
        create_fake_reports(db, users, num_reports)

        # Print statistics
        completed_ai = db.query(PotholeReport).filter(PotholeReport.ai_analysis_completed == True).count()
        pending_ai = db.query(PotholeReport).filter(PotholeReport.ai_analysis_completed == False).count()
        
        print(f"✅ Database populated successfully!")
        print(f"   Users: {len(users)}")
        print(f"   Total Reports: {num_reports}")
        print(f"   AI Completed: {completed_ai}")
        print(f"   AI Pending: {pending_ai}")
        print(f"   Login password for all users: password123")
        
    except Exception as e:
        db.rollback()
        print("❌ Error:", e)
    finally:
        db.close()

if __name__ == "__main__":
    populate_database(num_reports=500)