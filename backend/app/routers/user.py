from fastapi import APIRouter, HTTPException, status
from app.db.supabase import supabase
from typing import Dict, Any

router = APIRouter()

@router.get("/me/{user_id}")
def get_my_profile(user_id: str):
    """
    Get current user profile
    """
    try:
        res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="User not found")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/wallet/{user_id}")
def get_my_wallet(user_id: str):
    """
    Get user wallet balance
    """
    try:
        res = supabase.table("profiles").select("app_wallet_balance, izly_balance").eq("id", user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="User not found")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transactions/{user_id}")
def get_user_transactions(user_id: str):
    """
    Get user transaction history
    """
    try:
        res = supabase.table("transactions").select("*").eq("user_id", user_id).order("izly_date", desc=True).execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
