from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models
import schemas
from database.connect import get_db
from auth.security import (
    create_access_token, 
    ACCESS_TOKEN_EXPIRE_MINUTES, 
    get_current_user
)
from datetime import timedelta
from services.users.user_service import (
    authenticate_user,
    create_user,
    delete_user,
    update_user_profile as update_user_profile_service,
)

router = APIRouter(prefix="/users", tags=["users"])

# --------------SIGN UP----------------------------------

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    return create_user(
        db,
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
        profile_picture=payload.profile_picture,
    )



# --------------LOGIN----------------------------------
@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db,
        email=form_data.username.lower(),
        password=form_data.password,
    )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject={"sub": str(user.id)},  # user.id stored in JWT
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_account(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    delete_user(db, user_id=current_user.id)
    return {"detail": "User account deleted successfully"}

@router.put("/me", response_model=schemas.UserOut)
def update_user_profile(
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return update_user_profile_service(
        db,
        user_id=current_user.id,
        full_name=payload.full_name,
        email=payload.email,
        password=payload.password,
    )
