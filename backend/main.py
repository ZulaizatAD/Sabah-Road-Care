from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware # Enable Cross-Origin Resource Sharing
from fastapi.security import OAuth2PasswordRequestForm # Handle OAuth2 password flow
from sqlalchemy.orm import Session  # Database session management
from decouple import config # Environment variable management

# Custom router imports for modular endpoint organization
from routers import profilepic # Profile picture upload/management endpoints
from routers import dashboard, history, homepage # Main application routers

# Database and model imports for report functionality
from services.database.connect import engine as report_engine
import models.report as report_models

# Authentication and database imports with fallback handling
try:
    from services.database.connect import Base, engine, get_db
    import models
    import schemas
    from services.auth import verify_password, create_access_token
except ImportError:
    from services.database.connect import Base, engine, get_db
    import models
    import schemas
    from services.auth.security import verify_password, create_access_token
    from routers.user import router as user_router


def initialize_database():
    """Initialize database tables for both report and auth systems."""
    try:
        report_models.Base.metadata.create_all(bind=report_engine)
        Base.metadata.create_all(bind=engine)
        print("Database tables created/verified successfully")
    except Exception as e:
        print(f"Database table creation warning: {e}")


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


# Authentication endpoint to get access token
@app.post("/auth/token", response_model=schemas.Token, tags=["auth"])
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # Accept email in "username" field
    identifier = form_data.username.strip().lower()

    # Query the user from the database
    user = db.query(models.User).filter(models.User.email == identifier).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect credentials.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive.")

    # Generate JWT token with user ID and email as payload
    token = create_access_token(subject={"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "mode": "portfolio_showcase"}


@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Sabah Road Care API",
        "mode": "Portfolio Showcase",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    environment = config("ENVIRONMENT", default="portfolio")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=environment in ["development", "portfolio"],
        log_level="info",
    )
