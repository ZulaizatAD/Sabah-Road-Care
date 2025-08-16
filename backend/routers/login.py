from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
import schemas
from database import get_db
from auth.user import get_password_hash, get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    # ensure email/username unique
    if db.query(models.User).filter(models.User.email == payload.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = models.User(
        email=payload.email.lower(),
        username=payload.username,
        full_name=payload.full_name,
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user=Depends(get_current_user)):
    return current_user