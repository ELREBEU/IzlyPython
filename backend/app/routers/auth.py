from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.izly_scraper import IzlyClient
from app.db.supabase import supabase
from app.models.user import Profile
from app.models.transaction import TransactionCreate
from datetime import datetime
import base64

router = APIRouter()

class ImportRequest(BaseModel):
    email: str
    password: str
    user_id_supabase: str # Optional, if using Supabase Auth

@router.post("/import-izly", status_code=status.HTTP_200_OK)
def import_izly_data(request: ImportRequest):
    """
    Scrapes Izly data and updates the user's profile and transactions in Supabase.
    """
    client = IzlyClient()

    # 1. Login
    if not client.login(request.email, request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Izly credentials"
        )

    # 2. Get Profile Data
    profile_data = client.get_profile_data()
    if not profile_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile data"
        )

    # 3. Get Balance and History
    balance_history = client.get_balance_and_history()
    
    # 4. Upsert Profile
    # Merge profile_data and balance info
    user_update_data = {
        "email": request.email, # Ensure email is stored
        "full_name": profile_data.get("full_name"),
        "izly_user_id": profile_data.get("izly_user_id"),
        "address_zip": profile_data.get("address_zip"),
        "address_city": profile_data.get("address_city"),
        "tariff_code": profile_data.get("tariff_code"),
        "izly_balance": balance_history.get("balance", 0.0),
        "last_synced_at": datetime.now().isoformat()
    }

    # If user_id_supabase is provided, use it as the ID. 
    # Otherwise, we might need to look up the user by email or create a new one.
    # For this implementation, we assume the user already exists in Supabase Auth 
    # and we are updating their profile.
    
    try:
        # Check if user exists in profiles
        res = supabase.table("profiles").select("*").eq("id", request.user_id_supabase).execute()
        
        if not res.data:
            # If profile doesn't exist, we might need to create it.
            # Ideally, the profile is created upon signup trigger, but we can upsert here.
            user_update_data["id"] = request.user_id_supabase
            supabase.table("profiles").insert(user_update_data).execute()
        else:
            supabase.table("profiles").update(user_update_data).eq("id", request.user_id_supabase).execute()

    except Exception as e:
        print(f"Supabase Profile Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error updating profile: {str(e)}"
        )

    # 5. Insert Transactions
    transactions = balance_history.get("transactions", [])
    new_transactions_count = 0
    
    for tx in transactions:
        # Check if transaction already exists (deduplication logic)
        # We can use a combination of user_id, date, amount, and type to check uniqueness
        # Or simply try to insert and ignore if unique constraint fails (if we had one)
        # Here we will do a check first.
        
        # Format date for Supabase
        izly_date_iso = tx["izly_date"].isoformat()
        
        try:
            existing = supabase.table("transactions").select("id").match({
                "user_id": request.user_id_supabase,
                "izly_date": izly_date_iso,
                "amount": tx["amount"],
                "type": tx["type"]
            }).execute()
            
            if not existing.data:
                new_tx = {
                    "user_id": request.user_id_supabase,
                    "type": tx["type"],
                    "amount": tx["amount"],
                    "label": tx["label"],
                    "izly_date": izly_date_iso
                }
                supabase.table("transactions").insert(new_tx).execute()
                new_transactions_count += 1
                
        except Exception as e:
            print(f"Transaction Insert Error: {e}")
            continue

    return {
        "message": "Import successful",
        "profile": user_update_data,
        "new_transactions": new_transactions_count,
        "total_transactions_scraped": len(transactions)
    }

class QRCodeRequest(BaseModel):
    email: str
    password: str

@router.post("/qr-code", status_code=status.HTTP_200_OK)
def get_qr_code(request: QRCodeRequest):
    """
    Generates a new QR Code from Izly
    """
    client = IzlyClient()
    
    if not client.login(request.email, request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Izly credentials"
        )
        
    qr_bytes = client.get_qr_code()
    if not qr_bytes:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate QR Code"
        )
        
    # Return as base64 string for easy frontend display
    qr_base64 = base64.b64encode(qr_bytes).decode('utf-8')
    
    return {"qr_code_base64": qr_base64}
