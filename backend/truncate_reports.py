from database.connect import engine
from sqlalchemy import text

with engine.begin() as conn:
    conn.execute(text("TRUNCATE TABLE pothole_reports RESTART IDENTITY CASCADE;"))
    print("✅ pothole_reports table truncated")
