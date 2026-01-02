from fastapi import APIRouter, HTTPException, status
from app.db.supabase import supabase
from app.models.trade import MarketOfferCreate, MarketOfferResponse
from app.core.security import security
from app.services.izly_scraper import IzlyClient
from typing import List, Optional
import uuid
import base64

router = APIRouter()

# Tariff configuration (matching README)
TARIFF_CONFIG = {
    '98': {'label': 'Boursier', 'min_balance': 1.00, 'buyer_price': 1.50, 'seller_payout': 1.20},
    '100': {'label': 'Alternant', 'min_balance': 0.30, 'buyer_price': 1.00, 'seller_payout': 0.50},
    '97': {'label': 'Non-Boursier', 'min_balance': 3.30, 'buyer_price': 3.30, 'seller_payout': 3.30}
}

@router.post("/share-my-code", status_code=status.HTTP_201_CREATED)
def share_my_code(request: MarketOfferCreate):
    """
    **Partager mon code (Création d'offre)**

    Permet à un vendeur de mettre son repas en vente.
    1.  **Vérification Offres** : Un utilisateur ne peut avoir qu'une seule offre `OPEN` à la fois.
    2.  **Connexion Izly** : Vérifie les identifiants et récupère le profil complet.
    3.  **Vérification Éligibilité** : Seuls les tarifs "Boursier" et "Alternant" peuvent vendre avec profit.
    4.  **Vérification Solde** : S'assure que le compte Izly a assez de fonds.
    5.  **Création Offre** : Crée une entrée `market_offers` avec statut `OPEN`.
    
    Note: Le QR code de paiement n'est PAS stocké ici, il sera généré à la demande lors du `/book`.
    """
    # 0. Check if user already has an OPEN offer (using email/login to find user_id first)
    # We need the user_id. We can get it from profiles table if exists, or wait until we fetch/create profile.
    # Let's do it after we have the seller_id (Step 4), OR check by email first if profile exists.
    # Checking by email is safer to fail fast.
    
    existing_user = supabase.table("profiles").select("id").eq("email", request.izly_login).execute()
    if existing_user.data:
        seller_id_check = existing_user.data[0]["id"]
        existing_offer = supabase.table("market_offers")\
            .select("id")\
            .eq("seller_id", seller_id_check)\
            .eq("status", "OPEN")\
            .execute()
        
        if existing_offer.data:
            raise HTTPException(
                status_code=400, 
                detail="Vous avez déjà une offre en cours. Veuillez l'annuler ou attendre qu'elle soit vendue."
            )

    # 1. Login to Izly and scrape ALL data (same as import-izly route)
    try:
        client = IzlyClient()
        if not client.login(request.izly_login, request.izly_password):
            raise HTTPException(status_code=401, detail="Login Izly invalide")
        
        # Get complete profile (name, address, tariff, etc.)
        profile_data = client.get_profile_data()
        if not profile_data:
            raise HTTPException(status_code=500, detail="Impossible de récupérer le profil Izly")
        
        # Get balance + history
        balance_data = client.get_balance_and_history()
        current_balance = balance_data.get("balance", 0.0)
        
        # Get QR code (payment QR)
        qr_data = client.get_qr_code()
        if not qr_data or not qr_data.get("qr_image"):
            raise HTTPException(status_code=500, detail="Impossible de récupérer le QR code Izly")
            
        # Encode bytes to base64 string for DB storage
        qr_code_base64 = base64.b64encode(qr_data["qr_image"]).decode('utf-8')
        
        # Extract values from profile
        tariff_code = profile_data.get("tariff_code")
        full_name = profile_data.get("full_name")
        address_zip = profile_data.get("address_zip")
        address_city = profile_data.get("address_city")
        
        print(f"✓ Login réussi - {full_name}, Balance: {current_balance}€, Tariff: {tariff_code}")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur scraping Izly: {str(e)}")
    
    # 2. Check tariff eligibility
    if not tariff_code or tariff_code not in TARIFF_CONFIG:
        raise HTTPException(
            status_code=400,
            detail=f"Code tarif invalide ({tariff_code}). Seuls Boursier/Alternant/Non-Boursier sont acceptés."
        )
    
    tariff_info = TARIFF_CONFIG[tariff_code]
    
    # 3. Verify minimum balance based on status
    if current_balance < tariff_info['min_balance']:
        raise HTTPException(
            status_code=400,
            detail=f"Solde insuffisant pour {tariff_info['label']}. Vous avez {current_balance}€, minimum requis: {tariff_info['min_balance']}€"
        )
    
    # 4. Find or create user profile in Supabase (with COMPLETE data)
    try:
        # Check if user exists
        profile_res = supabase.table("profiles").select("*").eq("email", request.izly_login).execute()
        
        if profile_res.data:
            # Update existing profile with ALL fresh data
            seller_id = profile_res.data[0]["id"]
            supabase.table("profiles").update({
                "full_name": full_name,
                "tariff_code": tariff_code,
                "address_zip": address_zip,
                "address_city": address_city,
                "izly_balance": current_balance,
                "izly_password_encrypted": security.encrypt(request.izly_password)
            }).eq("id", seller_id).execute()
        else:
            # Create new profile with ALL data
            new_profile = {
                "id": str(uuid.uuid4()),
                "email": request.izly_login,  # Use login as email
                "full_name": full_name,
                "tariff_code": tariff_code,
                "address_zip": address_zip,
                "address_city": address_city,
                "izly_balance": current_balance,
                "izly_login_encrypted": security.encrypt(request.izly_login),
                "izly_password_encrypted": security.encrypt(request.izly_password)
            }
            result = supabase.table("profiles").insert(new_profile).execute()
            seller_id = new_profile["id"]
        
        print(f"✓ Profile updated/created for seller: {seller_id} ({full_name})")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur base de données: {str(e)}")
    
    # 5. Create market offer (NO geolocation needed)
    offer_data = {
        "id": str(uuid.uuid4()),
        "seller_id": seller_id,
        "status": "OPEN",
        "status": "OPEN"
    }
    
    try:
        result = supabase.table("market_offers").insert(offer_data).execute()
        return {
            "message": "✅ Code partagé avec succès!",
            "offer_id": offer_data["id"],
            "seller_id": seller_id,
            "qr_code_base64": qr_code_base64,
            "balance": current_balance,
            "tariff": tariff_info['label'],
            "min_balance_required": tariff_info['min_balance'],
            "buyer_price": tariff_info['buyer_price'],
            "seller_payout": tariff_info['seller_payout']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur création offre: {str(e)}")



@router.get("/offers", response_model=List[MarketOfferResponse])
def list_offers():
    """
    **Lister les offres disponibles**

    Renvoie la liste de toutes les offres actives (Statut `OPEN`).
    Inclut les détails du vendeur (`seller_name`, `seller_rating`, `seller_tariff_code`) pour l'affichage.
    """
    try:
        # Fetch open offers with seller info
        result = supabase.table("market_offers")\
            .select("*, profiles(full_name, rating, tariff_code)")\
            .eq("status", "OPEN")\
            .execute()
        
        offers = []
        for offer in result.data:
            seller_profile = offer.get("profiles", {})
            offers.append({
                "id": offer["id"],
                "seller_id": offer["seller_id"],
                "seller_name": seller_profile.get("full_name"),
                "seller_rating": seller_profile.get("rating"),
                "seller_tariff_code": seller_profile.get("tariff_code"),
                "status": offer["status"],
                "created_at": offer["created_at"]
            })
        
        return offers
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur récupération offres: {str(e)}")


@router.delete("/cancel/{offer_id}", status_code=status.HTTP_200_OK)
def cancel_offer(offer_id: str, seller_id: str):
    """
    **Annuler une offre**

    Passe le statut d'une offre à `CANCELLED`.
    Sécurité : Vérifie que le `seller_id` de la requête correspond bien au propriétaire de l'offre.
    """
    try:
        # Verify ownership
        offer_res = supabase.table("market_offers").select("seller_id").eq("id", offer_id).execute()
        if not offer_res.data:
            raise HTTPException(status_code=404, detail="Offre non trouvée")
        
        if offer_res.data[0]["seller_id"] != seller_id:
            raise HTTPException(status_code=403, detail="Vous ne pouvez annuler que vos propres offres")
        
        # Update status
        supabase.table("market_offers")\
            .update({"status": "CANCELLED"})\
            .eq("id", offer_id)\
            .execute()
        
        return {"message": "Offre annulée"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur annulation: {str(e)}")
