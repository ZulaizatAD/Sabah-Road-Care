from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database.connection import engine as report_engine
import models.report as report_models
from routers import dashboard, history, contact  # Import the contact router

# ---- Try to load shared/auth DB + models/schemas/auth (adjust paths if needed)
try:
    from database.connection import Base, engine, get_db  # shared auth DB/session
    from backend import models, schemas
    from backend.auth import verify_password, create_access_token
    from backend.routers.user import router as user_router  # e.g., app/routers/user.py
except ImportError:
    # Fallback to flat package (if main.py sits inside the same package as these modules)
    from database.connection import Base, engine, get_db
    import models, schemas
    from auth.user import verify_password, create_access_token
    from routers.user import router as user_router

# ---- Create tables (DEV ONLY). Keep your original report tables + auth tables.
report_models.Base.metadata.create_all(bind=report_engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sabah Road Care API", version="0.1.0")

# ---- CORS (add your frontend origins here)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Routers
# Include the dashboard router
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])

# Include the users router (register, me, etc.) under the same /api prefix
app.include_router(user_router, prefix="/api", tags=["users"])

# Include the history router
app.include_router(history.router, prefix="/api", tags=["history"])

# Include the contact router
app.include_router(contact.router, prefix="/api", tags=["contact"])

# ---- Auth: token endpoint (kept at top-level, not in /api for clarity)
@app.post("/auth/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # Accept email in "username" field
    identifier = form_data.username.strip().lower()

    user = db.query(models.User).filter(models.User.email == identifier).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect credentials.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive.")

    token = create_access_token(subject={"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer"}

# ---- Health + your original root
@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sabah Road Care API"}