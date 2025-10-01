"""
User Management Router

Handles all user-related endpoints including:
- User registration
- User authentication (login)
- Profile management (update/delete)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import timedelta
import traceback
import logging

import models
import schemas
from services.database.connect import get_db
from services.auth.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])

# --------------SIGN UP----------------------------------


@router.post(
    "/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED
)
def register_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Registration attempt for email: {payload.email}")

        # Check if email already exists
        existing_user = (
            db.query(models.User)
            .filter(models.User.email == payload.email.lower())
            .first()
        )

        if existing_user:
            logger.warning(f"Email already exists: {payload.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered.",
            )

        # Hash password
        logger.info("Hashing password...")
        hashed_password = get_password_hash(payload.password)

        # Create user
        logger.info("Creating user object...")
        user = models.User(
            email=payload.email.lower(),
            password_hash=hashed_password,
            full_name=payload.full_name,
            is_active=True,
        )

        logger.info("Adding user to database...")
        db.add(user)
        db.commit()
        db.refresh(user)

        logger.info(f"✅ User created successfully: {user.email} with ID: {user.id}")
        return user

    except HTTPException:
        # Re-raise HTTP exceptions (like email already exists)
        raise
    except IntegrityError as e:
        db.rollback()
        logger.error(f"❌ Database integrity error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered."
        )
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Registration error: {e}")
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",  # Include actual error for debugging
        )


# --------------LOGIN----------------------------------
@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
        db.query(models.User)
        .filter(models.User.email == form_data.username.lower())
        .first()
    )
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


# --------------UPDATE PROFILE----------------------------------
@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_account(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    db.delete(user)
    db.commit()
    return {"detail": "User account deleted successfully"}


# --------------UPDATE PROFILE----------------------------------
@router.put("/me", response_model=schemas.UserOut)
def update_user_profile(
    payload: schemas.UserUpdate,  # we'll define this schema
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update full name (optional)
    if payload.full_name is not None:
        user.full_name = payload.full_name

    # Update email (check uniqueness)
    if payload.email is not None:
        existing_user = (
            db.query(models.User)
            .filter(
                models.User.email == payload.email.lower(),
                models.User.id != current_user.id,
            )
            .first()
        )
        if existing_user:
            raise HTTPException(
                status_code=400, detail="Email is already in use by another account"
            )
        user.email = payload.email.lower()

    # Update password (hash new password)
    if payload.password is not None:
        user.password_hash = get_password_hash(payload.password)

    db.commit()
    db.refresh(user)

    return user
