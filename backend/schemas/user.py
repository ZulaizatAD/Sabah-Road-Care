# schemas.py
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ---------- Users ----------
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    full_name: str | None = None

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
    sub: str | None = None  # user id as str
    username: str | None = None
    exp: int | None = None
