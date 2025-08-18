from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
import schemas
from database.connection import get_db
from auth.user import get_password_hash, get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    # Ensure email is unique
    if db.query(models.User).filter(models.User.email == payload.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = models.User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        password_hash=get_password_hash(payload.password),
        profile_picture=payload.profile_picture
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user=Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserOut)
def update_user_profile(
    payload: schemas.UserCreate,  # You might want a different schema for updates
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.full_name = payload.full_name
    user.profile_picture = payload.profile_picture
    # Update other fields as necessary

    db.commit()
    db.refresh(user)
    return user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_account(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    db.delete(user)
    db.commit()
    return {"detail": "User account deleted successfully"}