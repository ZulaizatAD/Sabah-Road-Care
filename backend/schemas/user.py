from pydantic import BaseModel, EmailStr, Field, ConfigDict, constr
from typing import Optional, Annotated

# ---------- Users ----------
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None  # Profile picture remains

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)

class UserOut(UserBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None  # user id as str
    exp: Optional[int] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[Annotated[str, constr(min_length=6)]] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None   # subject = user_id (from JWT)
    exp: Optional[int] = None   # expiry timestamp