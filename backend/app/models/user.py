from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    izly_login: Optional[str] = None
    izly_user_id: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    address_street: Optional[str] = None
    address_zip: Optional[str] = None
    address_city: Optional[str] = None
    tariff_code: Optional[str] = None
    izly_balance: Optional[float] = 0.0
    app_wallet_balance: Optional[float] = 0.0

class ProfileUpdate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: UUID
    email: Optional[str] = None
    last_synced_at: Optional[datetime] = None

    class Config:
        from_attributes = True
