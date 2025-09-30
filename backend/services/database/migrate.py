"""
Database Migration Script for Supabase Deployment

This script handles the initial database setup and migration
to Supabase PostgreSQL database.
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

backend_dir = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
sys.path.insert(0, backend_dir)

from services.database.connect import DATABASE_URL, Base
from models.users import User

try:
    from models.report import PotholeReport
except ImportError:
    print("Warning: Could not import PotholeReport model")

from services.auth.security import get_password_hash


def test_connection():
    """
    Test database connection to Supabase.
    """
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print("Database connection successful!")
            print(f"PostgreSQL version: {version[:50]}...")

            # Test to create a simple table
            connection.execute(
                text(
                    "CREATE TABLE IF NOT EXISTS migration_test (id SERIAL PRIMARY KEY)"
                )
            )
            connection.execute(text("DROP TABLE IF EXISTS migration_test"))
            connection.commit()
            print("Database permissions verified!")

        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        print("Check your .env file and Supabase credentials")
        return False


def create_tables():
    """Create all database tables defined in models"""
    try:
        engine = create_engine(DATABASE_URL)

        print("Creating database tables...")
        # Hide credentials in the connection string display
        connection_display = (
            DATABASE_URL.split("@")[1] if "@" in DATABASE_URL else "database"
        )
        print(f"Connecting to: {connection_display}")

        Base.metadata.create_all(bind=engine)

        # Verify tables were created
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """)
            )
            tables = [row[0] for row in result.fetchall()]

        print("Tables created successfully!")
        print(f"Created tables: {', '.join(tables)}")

        return engine
    except Exception as e:
        print(f"Error creating tables: {e}")
        return None


def create_admin_user(engine):
    """Create an initial admin user"""
    try:
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()

        # Check if admin user already exists
        admin_email = "admin@roadcare.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()

        if not admin_user:
            # Create admin user
            admin_password = "admin123456"
            admin_user = User(
                email=admin_email,
                password_hash=get_password_hash(admin_password),
                full_name="System Administrator",
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

            print("Admin user created successfully!")
            print(f"Email: {admin_email}")
            print(f"Password: {admin_password}")
            print("IMPORTANT: Change the admin password after first login!")
        else:
            print("Admin user already exists")
            print(f"Email: {admin_email}")

        db.close()
    except Exception as e:
        print(f"Error creating admin user: {e}")


def create_test_user(engine):
    """Create a test user for development"""
    try:
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()

        # Check if test user already exists
        test_email = "test@roadcare.com"
        test_user = db.query(User).filter(User.email == test_email).first()

        if not test_user:
            test_user = User(
                email=test_email,
                password_hash=get_password_hash("testpassword123"),
                full_name="Test User",
                is_active=True,
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)

            print("Test user created successfully!")
            print(f"Email: {test_email}")
            print(f"Password: testpassword123")
        else:
            print("Test user already exists")

        db.close()
    except Exception as e:
        print(f"Error creating test user: {e}")


def verify_migration():
    """
    Verify that the migration was successful.
    """
    try:
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        db = SessionLocal()

        # Test user operations
        user_count = db.query(User).count()
        print(f"Total users in database: {user_count}")

        # Test user retrieval
        admin_user = db.query(User).filter(User.email == "admin@roadcare.com").first()
        if admin_user:
            print(f"Admin user verified: {admin_user.full_name}")

        db.close()
        return True
    except Exception as e:
        print(f"Migration verification failed: {e}")
        return False


def main():
    """Main migration function"""
    print("Starting Supabase database migration...")
    print("=" * 60)

    # Step 1: Test connection
    print("\nStep 1: Testing database connection...")
    if not test_connection():
        print("Migration failed - check your database credentials")
        print("Make sure your .env file has the correct Supabase details")
        return False

    # Step 2: Create tables
    print("\nStep 2: Creating database tables...")
    engine = create_tables()
    if not engine:
        print("Migration failed - could not create tables")
        return False

    # Step 3: Create initial users
    print("\nStep 3: Creating initial users...")
    create_admin_user(engine)
    create_test_user(engine)

    # Step 4: Verify migration
    print("\nStep 4: Verifying migration...")
    if not verify_migration():
        print("Migration verification failed")
        return False

    print("\n" + "=" * 60)
    print("Migration completed successfully!")
    print("Your Supabase database is ready!")
    print("\nNext steps:")
    print("1. Test your API endpoints")
    print("2. Change the admin password")
    print("3. Start your FastAPI application")
    print("\nRun: python main.py")

    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
