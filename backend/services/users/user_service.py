from __future__ import annotations

from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

import models
from auth.security import get_password_hash, verify_password


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email.lower()).first()


def create_user(
    db: Session,
    *,
    email: str,
    password: str,
    full_name: Optional[str] = None,
    profile_picture: Optional[str] = None,
) -> models.User:
    existing_user = get_user_by_email(db, email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    user = models.User(
        email=email.lower(),
        full_name=full_name,
        profile_picture=profile_picture,
        password_hash=get_password_hash(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, *, email: str, password: str) -> models.User:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def update_user_profile(
    db: Session,
    *,
    user_id: int,
    full_name: Optional[str],
    email: Optional[str],
    password: Optional[str],
) -> models.User:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if full_name is not None:
        user.full_name = full_name

    if email is not None:
        existing_user = db.query(models.User).filter(
            models.User.email == email.lower(),
            models.User.id != user_id,
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email is already in use by another account",
            )
        user.email = email.lower()

    if password is not None:
        user.password_hash = get_password_hash(password)

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, *, user_id: int) -> None:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    db.delete(user)
    db.commit()

