"""
Database Package Initialization

This module serves as the entry point for database operations and
ensures all models are properly registered with SQLAlchemy's Base.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from .connect import engine, Base

# Import all your models here so they're registered with Base
from models.users import User

# Import report models if they exist
try:
    from models.report import PotholeReport
    print("PotholeReport model imported successfully")
except ImportError:
    print("Warning: PotholeReport model not found - skipping")


def create_tables():
    """Create all database tables based on registered models."""
    Base.metadata.create_all(bind=engine)


def drop_tables():
    """
    Drop all database tables
    WARNING: This will permanently delete all data!
    Only use this in development or when you need to reset the database.
    """
    Base.metadata.drop_all(bind=engine)


def get_table_info():
    """
    Get information about registered tables.
    
    Returns:
        list: List of table names that are registered with Base
    """
    return list(Base.metadata.tables.keys())


if __name__ == "__main__":
    """
    Run: Create all database tables.
    
    Usage:
        python -m services.database
    """
    print("Creating database tables...")
    create_tables()
    tables = get_table_info()
    print("Database tables created successfully!")
    print(f"Tables: {', '.join(tables)}")