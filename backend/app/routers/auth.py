from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.izly_scraper import IzlyClient
from app.db.supabase import supabase
from app.models.user import Profile
from app.models.transaction import TransactionCreate
from datetime import datetime
import base64

router = APIRouter()

class QRCodeRequest(BaseModel):
    email: str
    password: str

class ImportRequest(BaseModel):
    email: str
    password: str
    user_id_supabase: str

@router.post("/import-izly", status_code=status.HTTP_200_OK)
def import_izly_data(request: ImportRequest):
    """
    Logs into Izly, scrapes all user data, and imports it into Supabase
    """
    # 1. Initialize Izly Client
    client = IzlyClient()
    
    # 2. Login
    if not client.login(request.email, request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Izly credentials"
        )
    
    # 3. Scrape Profile
    profile_data = client.get_profile_data()
    if not profile_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile data from Izly"
        )
    
    # 4. Scrape Balance + History
    balance_hist = client.get_balance_and_history()
    
    # 5. Generate and store Izly Identifier QR Code
    izly_qr_base64 = None
    try:
        qr_data = client.get_my_izly_identifier_qr()
        if qr_data and qr_data.get("qr_image"):
            izly_qr_base64 = base64.b64encode(qr_data["qr_image"]).decode('utf-8')
            print("Successfully generated Izly identifier QR code")
    except Exception as e:
        print(f"Warning: Could not generate Izly identifier QR: {e}")
        # Continue without QR - not critical for import
    
    # 6. Upsert Profile to Supabase
    profile_payload = {
        "id": request.user_id_supabase,
        "full_name": profile_data.get("full_name"),
        "tariff_code": profile_data.get("tariff_code"),
        "address_zip": profile_data.get("address_zip"),
        "address_city": profile_data.get("address_city"),
        "izly_balance": balance_hist["balance"],
        "izly_user_id": profile_data.get("izly_user_id"),
        "izly_identifier_qr_base64": izly_qr_base64
    }
    
    supabase.table("profiles").upsert(profile_payload).execute()
    
    # 6. Insert Transactions
    for tx in balance_hist["transactions"]:
        tx_payload = {
            "user_id": request.user_id_supabase,
            "type": tx["type"],
            "label": tx["label"],
            "amount": tx["amount"],
            "izly_date": tx["izly_date"].isoformat()
        }
        supabase.table("transactions").insert(tx_payload).execute()
    
    return {
        "message": "Izly data imported successfully",
        "profile": profile_payload,
        "transactions_count": len(balance_hist["transactions"])
    }

@router.post("/qr-code", status_code=status.HTTP_200_OK)
def get_qr_code(request: QRCodeRequest):
    """
    Generates a QR Code for payment
    """
    client = IzlyClient()
    
    # Login
    if not client.login(request.email, request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Izly credentials"
        )
        
    # Generate QR Code
    qr_data = client.get_qr_code()
    if not qr_data or not qr_data.get("qr_image"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate QR Code"
        )
        
    # Return as base64 string for easy frontend display
    qr_base64 = base64.b64encode(qr_data["qr_image"]).decode('utf-8')
    
    response = {"qr_code_base64": qr_base64}
    
    # Add expiration if available
    if qr_data.get("expiration"):
        response["expiration"] = qr_data["expiration"]
    
    return response

@router.get("/my-izly-identifier-qr/{user_id}", status_code=status.HTTP_200_OK)
def get_my_izly_identifier_qr(user_id: str):
    """
    Retrieves the cached Izly identifier QR code from Supabase
    
    This endpoint returns the QR code that was generated during the initial
    Izly data import. The QR code is permanent and never changes.
    """
    try:
        result = supabase.table("profiles").select("izly_identifier_qr_base64").eq("id", user_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        qr_base64 = result.data[0].get("izly_identifier_qr_base64")
        
        if not qr_base64:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Izly identifier QR code not found. Please re-import your Izly data."
            )
        
        return {"qr_code_base64": qr_base64}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve QR code: {str(e)}"
        )
