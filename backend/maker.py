import os
import random
import datetime
from collections import defaultdict

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

statuses = ["Under Review", "Approved", "In Progress", "Completed", "Rejected"]
severity_levels = ["Low", "Medium", "High"]

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

# --- Helpers ---
def generate_case_id(district, created_date, sequence_counters):
    district_code = district.split()[0][:3].upper()
    year_part = str(created_date.year)
    month_part = f"{created_date.month:02d}"
    counter_key = f"{district_code}_{year_part}_{month_part}"

    seq_num = sequence_counters[counter_key]
    sequence_counters[counter_key] += 1
    return f"SRC_{district_code}_{year_part}_{month_part}_{seq_num:04d}"


# --- Fake data generation ---
def create_fixed_users(db):
    """Create fixed users with given emails, shared password: password123"""
    users = []
    for email in ALL_EMAILS:
        # check if the user already exists
        existing = db.query(User).filter_by(email=email).first()
        if existing:
            users.append(existing)
            continue

        # create new if not exists
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



def create_fake_reports(db, users, num_reports=5000):
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

        report = PotholeReport(
            case_id=case_id,
            email=user.email,
            location=random.choice(sabah_addresses),
            district=district,
            date_created=created_date,
            last_date_status_update=status_update_date,
            severity=random.choice(severity_levels),
            status=random.choice(statuses),
            user_id=user.id,
            latitude=random.uniform(4.0, 7.5),
            longitude=random.uniform(115.0, 119.0),
            photo_top="https://via.placeholder.com/600x400.png?text=Top",
            photo_far="https://via.placeholder.com/600x400.png?text=Far",
            photo_close="https://via.placeholder.com/600x400.png?text=Close",
        )
        reports.append(report)

    db.add_all(reports)
    db.commit()


# --- Populate DB ---
def populate_database(num_reports=5000):
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)

        print("Creating fixed users...")
        users = create_fixed_users(db)

        print("Creating fake reports...")
        create_fake_reports(db, users, num_reports)

        print(f"Inserted {len(users)} users and {num_reports} reports successfully.")
        print("✅ Login test accounts available with password: password123")
    except Exception as e:
        db.rollback()
        print("Error:", e)
    finally:
        db.close()


if __name__ == "__main__":
    populate_database(num_reports=5000)
