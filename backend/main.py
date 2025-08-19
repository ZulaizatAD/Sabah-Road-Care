# Import necessary modules from FastAPI and other libraries
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Import database engine and models for reports
from database.connect import engine as report_engine
import models.report as report_models
from routers import dashboard, history, user
try:
    from database.connect import Base, engine, get_db  # Shared auth DB/session
    from backend import models, schemas
    from backend.auth import verify_password, create_access_token
except ImportError:
    # Fallback if the imports above fail (e.g., if the structure is flat)
    from database.connect import Base, engine, get_db
    import models, schemas
    from auth.user import verify_password, create_access_token
    from routers.user import router as user_router

# ---------- NEW: photos router (Drive uploads)
# Make sure you created routers/photos.py with an APIRouter named `router`
try:
    from routers.photos import router as photos_router
except ImportError as e:
    photos_router = None
    print("[WARN] Could not import routers.photos:", e)

# ---------- Create tables (DEV ONLY). Keep your original report tables + auth tables.
report_models.Base.metadata.create_all(bind=report_engine)
Base.metadata.create_all(bind=engine)

# Initialize FastAPI application
app = FastAPI(title="Sabah Road Care API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers for different API endpoints
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(user_router, prefix="/api", tags=["users"])
app.include_router(history.router, prefix="/api", tags=["history"])

# Authentication endpoint to get access token
@app.post("/auth/token", response_model=schemas.Token)
=======
# ---------- Routers
# Keep your original dashboard router
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])

# Users router (register/me/etc.) under /api
app.include_router(user_router, prefix="/api", tags=["users"])

# NEW: Photos upload router under /api/photos
if photos_router:
    app.include_router(photos_router, prefix="/api", tags=["photos"])

# ---------- Auth: token endpoint (top-level)
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

    # Create and return access token
    token = create_access_token(subject={"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sabah Road Care API"}