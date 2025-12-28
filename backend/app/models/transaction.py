from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class TransactionBase(BaseModel):
    type: str  # 'RECHARGE', 'PAYMENT', 'TRANSFER', 'APP_SALE'
    amount: float
    label: Optional[str] = None
    izly_date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    user_id: UUID

class Transaction(TransactionBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
