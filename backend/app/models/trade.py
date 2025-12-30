from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ============================================
# MARKET OFFERS
# ============================================

class MarketOfferCreate(BaseModel):
    """Request to create a new market offer (seller shares code)"""
    izly_login: str
    izly_password: str

class MarketOfferResponse(BaseModel):
    """Response with market offer details"""
    id: str
    seller_id: str
    seller_name: Optional[str] = None
    seller_rating: Optional[float] = None
    seller_tariff_code: Optional[str] = None
    seller_tariff_code: Optional[str] = None
    status: str
    created_at: str

# ============================================
# TRADE SESSIONS
# ============================================

class TradeBookRequest(BaseModel):
    """Request to book/purchase a code from an offer"""
    buyer_id: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class TradeSessionResponse(BaseModel):
    """Response with trade session details including QR code"""
    id: str
    offer_id: str
    buyer_id: str
    seller_id: str
    qr_code_base64: Optional[str] = None
    agreed_price: float
    seller_payout: float
    status: str
    created_at: str

# ============================================
# CHAT MESSAGES
# ============================================

class ChatMessageResponse(BaseModel):
    """Bot message in a trading session"""
    id: str
    session_id: str
    sender: str
    content: str
    icon_type: str
    created_at: str
