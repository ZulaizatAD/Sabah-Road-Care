import random
from datetime import datetime, timedelta
import uuid
from faker import Faker
import sqlalchemy as sa
from sqlalchemy.orm import declarative_base, sessionmaker
from collections import defaultdict

import os
from dotenv import load_dotenv
load_dotenv()

DB_USERNAME = "postgres"
DB_PASSWORD = os.getenv("dB_PASSWORD")  # Ensure the environment variable name matches exactly
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "sabah_road_care"
DATABASE_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Initialize Faker
fake = Faker()

# Define control variables
districts = [
    "Kota Kinabalu", "Sandakan", "Tawau", "Penampang", "Putatan",
    "Papar", "Tuaran", "Kudat", "Beaufort", "Ranau",
    "Kota Belud", "Keningau", "Semporna", "Kuala Penyu", 
    "Lahad Datu", "Others"
]

statuses = [
    "Under Review", "Approved", "In Progress", "Completed", "Rejected"
]

severity_levels = ["Low", "Medium", "High"]

# Expanded list of sample addresses in Sabah
sabah_addresses = [
    "Jalan Tuaran, Kota Kinabalu",
    "Jalan Gaya, Kota Kinabalu",
    "Jalan Tanjung Aru, Kota Kinabalu",
    "Jalan Labuk, Sandakan",
    "Jalan Utara, Sandakan",
    "Jalan Tawau Lama, Tawau",
    "Jalan Penampang, Penampang",
    "Jalan Putatan, Putatan",
    "Jalan Papar Spur, Papar",
    "Jalan Tuaran Bypass, Tuaran",
    "Jalan Kudat, Kudat",
    "Jalan Beaufort, Beaufort",
    "Jalan Ranau, Ranau",
    "Jalan Kota Belud, Kota Belud",
    "Jalan Keningau, Keningau",
    "Jalan Semporna, Semporna",
    "Jalan Kuala Penyu, Kuala Penyu",
    "Jalan Lahad Datu, Lahad Datu",
    "Jalan Lintas, Kota Kinabalu",
    "Jalan Kepayan, Kota Kinabalu",
    "Jalan Sulaman, Kota Kinabalu",
    "Jalan Sepanggar, Kota Kinabalu",
    "Jalan Bundusan, Penampang",
    "Jalan Donggongon, Penampang",
    "Jalan Lido, Penampang",
    "Jalan Mat Salleh, Kota Kinabalu",
    "Jalan Tun Fuad Stephens, Kota Kinabalu",
    "Jalan Coastal, Kota Kinabalu",
    "Jalan Tun Razak, Kota Kinabalu",
    "Jalan Damai, Kota Kinabalu",
    "Jalan Kolombong, Kota Kinabalu",
    "Jalan Inanam, Kota Kinabalu",
    "Jalan Menggatal, Kota Kinabalu",
    "Jalan Telipok, Kota Kinabalu",
    "Jalan Kionsom, Kota Kinabalu",
    "Jalan Kokol, Kota Kinabalu",
    "Jalan Tamparuli, Tuaran",
    "Jalan Tenghilan, Tuaran",
    "Jalan Kiulu, Tuaran",
    "Jalan Kota Marudu, Kota Marudu",
    "Jalan Pitas, Pitas",
    "Jalan Beluran, Beluran",
    "Jalan Telupid, Telupid",
    "Jalan Tongod, Tongod",
    "Jalan Kinabatangan, Kinabatangan",
    "Jalan Kunak, Kunak",
    "Jalan Kalabakan, Tawau",
    "Jalan Sipitang, Sipitang",
    "Jalan Tenom, Tenom",
    "Jalan Nabawan, Nabawan",
    "Jalan Tambunan, Tambunan"
]

# Create SQLAlchemy Base
Base = declarative_base()

# Define the database model
class PotholeReport(Base):
    __tablename__ = "pothole_reports"
    
    case_id = sa.Column(sa.String, primary_key=True)
    email = sa.Column(sa.String, nullable=False)
    location = sa.Column(sa.String, nullable=False)
    district = sa.Column(sa.String, nullable=False)
    date_created = sa.Column(sa.Date, nullable=False)
    last_date_status_update = sa.Column(sa.Date, nullable=False)
    severity = sa.Column(sa.String, nullable=False)
    status = sa.Column(sa.String, nullable=False)
    description = sa.Column(sa.String, nullable=False)
    similar_reports = sa.Column(sa.Integer, nullable=False)

# Create database engine
engine = sa.create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# Function to generate case ID
def generate_case_id(district, created_date, sequence_counters):
    # Get district code (first 3 letters)
    district_code = district.split()[0][:3].upper()
    
    # Get year and month from the created date
    year_part = str(created_date.year)
    month_part = f"{created_date.month:02d}"  # Zero-padded month (01-12)
    
    # Create the key for the counter
    counter_key = f"{district_code}_{year_part}_{month_part}"
    
    # Get the next sequence number for this district/year/month
    seq_num = sequence_counters[counter_key]
    sequence_counters[counter_key] += 1
    
    # Format the case ID
    case_id = f"SRC_{district_code}_{year_part}_{month_part}_{seq_num:04d}"
    
    return case_id

# Function to generate fake reports
def generate_fake_reports(num_reports: int = 50):
    reports = []
    
    # Counter for sequential numbers, resets monthly per district
    sequence_counters = defaultdict(int)
    
    for _ in range(num_reports):
        # Generate random dates
        created_date = fake.date_time_between(start_date="-1y", end_date="now")
        
        # Last status update should be after creation date
        max_days_after = (datetime.now() - created_date).days
        days_after = random.randint(0, max(1, max_days_after))
        status_update_date = created_date + timedelta(days=days_after)
        
        # Select a random district
        district = random.choice(districts)
        
        # Generate case ID
        case_id = generate_case_id(district, created_date, sequence_counters)
        
        # Select a random address from the Sabah addresses list
        location = random.choice(sabah_addresses)
        
        # Create report
        report = PotholeReport(
            case_id=case_id,
            email=fake.email(),
            location=location,
            district=district,
            date_created=created_date.date(),
            last_date_status_update=status_update_date.date(),
            severity=random.choice(severity_levels),
            status=random.choice(statuses),
            description=fake.text(max_nb_chars=200),
            similar_reports=random.randint(0, 10)
        )
        
        reports.append(report)
    
    return reports

# Generate and insert fake data
def populate_database(num_reports: int = 50):
    reports = generate_fake_reports(num_reports)
    
    db = SessionLocal()
    try:
        # Insert in batches to avoid memory issues with large numbers
        batch_size = 1000
        for i in range(0, len(reports), batch_size):
            batch = reports[i:i+batch_size]
            db.add_all(batch)
            db.commit()
            print(f"Added batch {i//batch_size + 1}/{(len(reports)-1)//batch_size + 1} ({len(batch)} reports)")
        
        print(f"Successfully added {num_reports} fake pothole reports to the database.")
    except Exception as e:
        db.rollback()
        print(f"Error adding reports to database: {e}")
    finally:
        db.close()

# Run the script
if __name__ == "__main__":
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Add reports
    populate_database(10000)