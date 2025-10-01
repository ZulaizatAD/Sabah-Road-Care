import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # Enable Cross-Origin Resource Sharing
from fastapi.security import OAuth2PasswordRequestForm  # Handle OAuth2 password flow
from sqlalchemy.orm import Session  # Database session management
from decouple import config  # Environment variable management

# Import database engine and models for reports
from services.database.connect import engine as report_engine, Base, engine, get_db
import models.report as report_models
import models.users
import models
import schemas
from services.auth import verify_password, create_access_token
from routers import profilepic, dashboard, history, homepage
from routers.user import router as user_router


def initialize_database():
    """Initialize database tables for both report and auth systems."""
    try:
        # Import all models to ensure they're registered
        import models.users
        import models.report
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created/verified successfully")
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute("SELECT 1")
            print("✅ Database connection test successful")
            
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
        raise e


# Initialize FastAPI application
app = FastAPI(
    title="Sabah Road Care API",
    version="0.1.0",
    description="Portfolio showcase API for road care management system",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://road-care-75.web.app",
        "https://sabah-road-care.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all application routers with their respective prefixes and tags
app.include_router(homepage.router, prefix="/api", tags=["Homepage"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(user_router, prefix="/api", tags=["users"])
app.include_router(history.router, prefix="/api", tags=["history"])
app.include_router(profilepic.router)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    initialize_database()
    
# Register routers
app.include_router(homepage.router, prefix="/api", tags=["Homepage"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(user_router, prefix="/api", tags=["users"])
app.include_router(history.router, prefix="/api", tags=["history"])
app.include_router(profilepic.router)

# Authentication endpoint
@app.post("/auth/token", response_model=schemas.Token, tags=["auth"])
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    identifier = form_data.username.strip().lower()
    user = db.query(models.User).filter(models.User.email == identifier).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect credentials.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive.")

    token = create_access_token(subject={"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer"}


# Health check
@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "mode": "portfolio_showcase"}

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Sabah Road Care API",
        "mode": "Production",
        "docs": "/docs",
    }


@app.get("/debug/db-test", tags=["debug"])
def test_database_connection():
    """Test database connection with detailed error info"""
    import os
    try:
        from services.database.connect import DATABASE_URL
        import psycopg2
        
        # Get connection parameters
        db_params = {
            'host': os.getenv('dB_HOST'),
            'port': os.getenv('dB_PORT'),
            'database': os.getenv('dB_NAME'),
            'user': os.getenv('dB_USERNAME'),
            'password': os.getenv('dB_PASSWORD'),
            'sslmode': 'require'
        }
        
        # Test direct psycopg2 connection
        conn = psycopg2.connect(**db_params)
        cursor = conn.cursor()
        cursor.execute("SELECT version()")
        version = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        
        return {
            "status": "success",
            "message": "Database connection successful",
            "database_version": version[:100],
            "connection_params": {
                "host": db_params['host'],
                "port": db_params['port'],
                "database": db_params['database'],
                "user": db_params['user'],
                "password_set": bool(db_params['password'])
            }
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "error_type": type(e).__name__,
            "connection_params": {
                "host": os.getenv('dB_HOST'),
                "port": os.getenv('dB_PORT'),
                "database": os.getenv('dB_NAME'),
                "user": os.getenv('dB_USERNAME'),
                "password_set": bool(os.getenv('dB_PASSWORD'))
            }
        }
        
@app.get("/debug/connection-test", tags=["debug"])
def test_multiple_connections():
    """Test multiple connection methods"""
    import os
    import psycopg2
    
    results = {}
    
    # Test 1: Direct connection
    try:
        conn_params = {
            'host': 'db.jtcjvnymygzqeugetpqg.supabase.co',
            'port': '5432',
            'database': 'postgres',
            'user': 'postgres',
            'password': os.getenv('dB_PASSWORD'),
            'sslmode': 'require',
            'connect_timeout': 10
        }
        
        conn = psycopg2.connect(**conn_params)
        conn.close()
        results['direct_connection'] = "✅ Success"
    except Exception as e:
        results['direct_connection'] = f"❌ {str(e)[:100]}"
    
    # Test 2: Pooler with project ID
    try:
        conn_params = {
            'host': 'aws-1-ap-southeast-1.pooler.supabase.com',
            'port': '6543',
            'database': 'postgres',
            'user': 'postgres.jtcjvnymygzqeugetpqg',
            'password': os.getenv('dB_PASSWORD'),
            'sslmode': 'require',
            'connect_timeout': 10
        }
        
        conn = psycopg2.connect(**conn_params)
        conn.close()
        results['pooler_transaction'] = "✅ Success"
    except Exception as e:
        results['pooler_transaction'] = f"❌ {str(e)[:100]}"
    
    # Test 3: Pooler session mode
    try:
        conn_params = {
            'host': 'aws-1-ap-southeast-1.pooler.supabase.com',
            'port': '5432',
            'database': 'postgres',
            'user': 'postgres.jtcjvnymygzqeugetpqg',
            'password': os.getenv('dB_PASSWORD'),
            'sslmode': 'require',
            'connect_timeout': 10
        }
        
        conn = psycopg2.connect(**conn_params)
        conn.close()
        results['pooler_session'] = "✅ Success"
    except Exception as e:
        results['pooler_session'] = f"❌ {str(e)[:100]}"
    
    return {
        "status": "completed",
        "results": results,
        "recommendation": "Use the connection method that shows ✅ Success"
    }

@app.get("/debug/env-check", tags=["debug"])
def check_environment():
    """Check current environment variables"""
    import os
    
    return {
        "environment": os.getenv("ENVIRONMENT"),
        "db_host": os.getenv("dB_HOST"),
        "db_port": os.getenv("dB_PORT"),
        "db_username": os.getenv("dB_USERNAME"),
        "db_name": os.getenv("dB_NAME"),
        "password_set": bool(os.getenv("dB_PASSWORD")),
        "current_connection_url": f"{os.getenv('dB_HOST')}:{os.getenv('dB_PORT')}"
    }
    
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info",
    )