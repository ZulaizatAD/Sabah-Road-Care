from database.connect import engine, Base

# Import all your models here so they're registered with Base
from models.report import PotholeReport
# Import your other existing models
# from models.user_models import User
# from models.report_models import Report
# etc...

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)
    
def drop_tables():
    """Drop all database tables"""
    Base.metadata.drop_all(bind=engine)

if __name__ == "__main__":
    create_tables()
    print("Database tables created successfully!")