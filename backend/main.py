# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
<<<<<<< Updated upstream
from database.connection import engine as report_engine
import models.report as report_models
=======
from dotenv import load_dotenv

# ---------- Load env FIRST (so GOOGLE_* vars are available to drive.py / routers)
load_dotenv()

# ---------- Your original imports (reports DB + models + dashboard router)
from backend.database.report import engine as report_engine
import backend.models.report as report_models
>>>>>>> Stashed changes
from routers import dashboard
from routers import login

# ---------- Try to load shared/auth DB + models/schemas/auth (adjust paths if needed)
try:
    from database.connection import Base, engine, get_db  # shared auth DB/session
    from backend import models, schemas
    from backend.auth import verify_password, create_access_token
<<<<<<< Updated upstream
    from routers.login import router as user_router  # e.g., app/routers/user.py
=======
    from routers.user import router as user_router
>>>>>>> Stashed changes
except ImportError:
    # Fallback to flat package (if main.py sits inside the same package as these modules)
    from database.connection import Base, engine, get_db
    import models, schemas
    from auth.user import verify_password, create_access_token
    from routers.login import router as user_router

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

app = FastAPI(title="Sabah Road Care API", version="0.1.0")

# ---------- CORS (add your frontend origins here)
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
    # Accept either email or username in "username"
    identifier = form_data.username.strip().lower()

    user = (
        db.query(models.User)
        .filter((models.User.email == identifier) | (models.User.username == identifier))
        .first()
    )
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect credentials.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is inactive.")

    token = create_access_token(subject={"sub": str(user.id), "username": user.username})
    return {"access_token": token, "token_type": "bearer"}

# ---------- Health + root
@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sabah Road Care API"}
