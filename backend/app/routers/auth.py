from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.izly_scraper import IzlyClient
from app.db.supabase import supabase
from app.models.user import Profile
from app.models.transaction import TransactionCreate
from app.core.security import security
from datetime import datetime
import base64

router = APIRouter()

class QRCodeRequest(BaseModel):
    email: str
    password: str

class ImportRequest(BaseModel):
    email: str
    password: str

@router.post("/import-izly", status_code=status.HTTP_200_OK)
def import_izly_data(request: ImportRequest):
    """
    **Importation des données Izly (Connexion & Scraping)**

    Cette route est le point d'entrée principal de l'application. Elle effectue les actions suivantes :
    1.  **Connexion Izly** : Authentifie l'utilisateur sur le site officiel Izly.
    2.  **Scraping Profil** : Récupère toutes les infos personnelles (Nom, Adresse, Statut Boursier, etc.).
    3.  **Scraping Solde & Historique** : Récupère le solde actuel et les dernières transactions.
    4.  **Sauvegarde Supabase** : Crée ou met à jour le profil utilisateur dans notre base de données.
    5.  **Chiffrement** : Les identifiants Izly sont chiffrés (AES) avant d'être stockés pour permettre les futures actions automatiques (ex: vente de code).
    """
    # 1. Determine user_id via email lookup (auto-create if doesn't exist)
    try:
        existing_profile = supabase.table("profiles").select("id").eq("email", request.email).execute()
        
        if existing_profile.data and len(existing_profile.data) > 0:
            # User exists, use their ID
            user_id = existing_profile.data[0]["id"]
            print(f"✓ Found existing user with email {request.email}: {user_id}")
        else:
            # New user - generate deterministic UUID based on email
            import uuid
            import hashlib
            
            # Create deterministic UUID from email (same email = same UUID)
            email_hash = hashlib.md5(request.email.lower().encode()).hexdigest()
            user_id = str(uuid.UUID(email_hash))
            print(f"✓ Generated new UUID for {request.email}: {user_id}")
            
    except Exception as e:
        # Fallback: generate random UUID
        import uuid
        user_id = str(uuid.uuid4())
        print(f"⚠ Error checking existing user, generated random UUID: {user_id}")
        print(f"Error was: {e}")
    
    # 2. Initialize Izly Client
    client = IzlyClient()
    
    # 3. Login to Izly
    if not client.login(request.email, request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Izly credentials"
        )
    
    # 4. Scrape Profile
    profile_data = client.get_profile_data()
    if not profile_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile data from Izly"
        )
    
    # 5. Scrape Balance + History
    balance_hist = client.get_balance_and_history()
    
    # 6. Generate and store Izly Identifier QR Code
    izly_qr_base64 = None
    try:
        qr_data = client.get_my_izly_identifier_qr()
        if qr_data and qr_data.get("qr_image"):
            izly_qr_base64 = base64.b64encode(qr_data["qr_image"]).decode('utf-8')
            print("Successfully generated Izly identifier QR code")
    except Exception as e:
        print(f"Warning: Could not generate Izly identifier QR: {e}")
        # Continue without QR - not critical for import
    
    # 7. Upsert Profile to Supabase (with encrypted credentials)
    profile_payload = {
        "id": user_id,
        "email": request.email,
        "full_name": profile_data.get("full_name"),
        "birth_date": profile_data.get("birth_date"),
        "phone": profile_data.get("phone"),
        "tariff_code": profile_data.get("tariff_code"),
        "address_street": profile_data.get("address_street"),
        "address_zip": profile_data.get("address_zip"),
        "address_city": profile_data.get("address_city"),
        "izly_balance": balance_hist["balance"],
        "izly_user_id": profile_data.get("izly_user_id"),
        "izly_identifier_qr_base64": izly_qr_base64,
        # Encrypt credentials for later QR code generation
        "izly_login_encrypted": security.encrypt(request.email),
        "izly_password_encrypted": security.encrypt(request.password)
    }
    
    supabase.table("profiles").upsert(profile_payload).execute()
    
    # 8. Insert Transactions
    for tx in balance_hist["transactions"]:
        tx_payload = {
            "user_id": user_id,
            "type": tx["type"],
            "label": tx["label"],
            "amount": tx["amount"],
            "izly_date": tx["izly_date"].isoformat()
        }
        # Manual check-then-insert to avoid "no unique constraint" error
        try:
            # Check if transaction already exists
            existing = supabase.table("transactions").select("id").eq("user_id", user_id)\
                .eq("izly_date", tx_payload["izly_date"])\
                .eq("amount", tx_payload["amount"])\
                .eq("type", tx_payload["type"])\
                .execute()
            
            if not existing.data:
                supabase.table("transactions").insert(tx_payload).execute()
        except Exception as e:
            print(f"Error inserting transaction: {e}")
            # Continue to next transaction even if one fails
            continue
    
    return {
        "message": "Izly data imported successfully",
        "user_id": user_id,
        "profile": profile_payload,
        "transactions_count": len(balance_hist["transactions"])
    }

@router.post("/qr-code", status_code=status.HTTP_200_OK)
def get_qr_code(request: QRCodeRequest):
    """
    **Génération de QR Code de Paiement (Direct)**

    Génère un QR code de paiement valide pour une utilisation immédiate.
    - Se connecte à Izly en temps réel.
    - Récupère un QR code frais.
    - Renvoie l'image en base64 pour affichage direct.
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
    **Récupération du QR Code Identifiant (Permanent)**

    Récupère le QR code "Identifiant Izly" stocké en base de données.
    Contrairement au QR code de paiement, celui-ci est **permanent** et sert à s'identifier aux bornes ou caisses (sans payer).
    Il est récupéré une seule fois lors de l'import initial.
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
