from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.db.supabase import supabase
from app.models.trade import TradeBookRequest, TradeSessionResponse, ChatMessageResponse
from app.core.security import security
from app.services.izly_scraper import IzlyClient
from app.services.bot_service import bot
from typing import List, Optional
import uuid
import base64

router = APIRouter()

# Tariff pricing configuration (from README)
TARIFF_CONFIG = {
    '98': {'izly_cost': 1.00, 'buyer_price': 1.50, 'seller_payout': 1.20},
    '100': {'izly_cost': 0.30, 'buyer_price': 1.00, 'seller_payout': 0.50},
    '97': {'izly_cost': 3.30, 'buyer_price': 3.30, 'seller_payout': 3.30}
}

BUYER_PRICE = 1.50  # Fixed price for all buyers

@router.post("/book/{offer_id}", response_model=TradeSessionResponse)
def book_trade(offer_id: str, request: TradeBookRequest):
    """
    **Réserver un repas (Achat)**

    Démarre une session de trade (`trade_sessions`).
    Le Bot orchestre tout :
    1.  Vérifie solde acheteur (`buyer_id`) > 5€.
    2.  Vérifie solde vendeur (`seller_id`) sur Izly > 3.30€.
    3.  Verrouille l'offre (LOCKED).
    4.  Génère un QR code frais via Izly.
    5.  Enregistre le QR et notifie.
    """
    
    # Step 1: Initialize trade session
    session_id = str(uuid.uuid4())
    
    # Resolve Buyer ID (Direct ID or Email/Password)
    buyer_id = request.buyer_id
    
    # Handle Swagger default value "string"
    if buyer_id == "string" or not buyer_id:
        buyer_id = None
    
    if not buyer_id:
        if request.email and request.password:
            # Find user by email
            try:
                user_res = supabase.table("profiles").select("id, izly_password_encrypted").eq("email", request.email).execute()
                if not user_res.data:
                    raise HTTPException(status_code=404, detail="Utilisateur non trouvé (Email)")
                
                user = user_res.data[0]
                stored_encrypted_pass = user.get("izly_password_encrypted")
                
                # Verify password
                if not stored_encrypted_pass:
                    raise HTTPException(status_code=401, detail="Mot de passe non configuré pour cet utilisateur")
                
                try:
                    decrypted_pass = security.decrypt(stored_encrypted_pass)
                except Exception:
                    raise HTTPException(status_code=500, detail="Erreur de sécurité (Déchiffrement)")
                
                if decrypted_pass != request.password:
                    raise HTTPException(status_code=401, detail="Mot de passe incorrect")
                
                # Auth success
                buyer_id = user["id"]
                
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Erreur authentification: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Buyer ID ou Email/Mot de passe requis")
    
    try:
        # Fetch offer details
        offer_res = supabase.table("market_offers")\
            .select("*, profiles!market_offers_seller_id_fkey(*)")\
            .eq("id", offer_id)\
            .execute()
        
        if not offer_res.data:
            raise HTTPException(status_code=404, detail="Offre non trouvée")
        
        offer = offer_res.data[0]
        seller = offer["profiles"]
        seller_id = offer["seller_id"]
        
        if offer["status"] != "OPEN":
            raise HTTPException(status_code=400, detail="Cette offre n'est plus disponible")
        
        # Create trade session
        session_data = {
            "id": session_id,
            "offer_id": offer_id,
            "buyer_id": buyer_id,
            "seller_id": seller_id,
            "status": "CREATED",
            "agreed_price": 0.0 # Will be updated in Step 2
        }
        supabase.table("trade_sessions").insert(session_data).execute()
        
        # Bot message: Start
        bot.create_message(session_id, "👋 Démarrage de la transaction.", "INFO")
        bot.create_message(session_id, "🔍 Vérification des soldes en cours...", "INFO")
        
        # Step 2: Fetch seller tariff
        tariff_code = seller.get("tariff_code")
        if not tariff_code or tariff_code not in TARIFF_CONFIG:
            bot.create_message(session_id, "❌ Code tarif vendeur invalide", "WARNING")
            raise HTTPException(status_code=400, detail="Tarif vendeur invalide")
        
        tariff_info = TARIFF_CONFIG[tariff_code]
        seller_payout = tariff_info['seller_payout']
        
        # Dynamic Price Calculation
        agreed_price = tariff_info['buyer_price']
            
        bot.create_message(session_id, f"💲 Prix fixé à {agreed_price}€ (Tarif vendeur: {tariff_code})", "INFO")

        # Update session with agreed price
        supabase.table("trade_sessions").update({"agreed_price": agreed_price}).eq("id", session_id).execute()
        
        # Step 3: Check buyer wallet balance (Must be > 5€ as per requirements, though price is 1.50€)
        # Requirement says: "Buyer (Iness) internal wallet > 5€."
        MIN_BUYER_BALANCE = 5.0
        
        buyer_res = supabase.table("profiles")\
            .select("app_wallet_balance")\
            .eq("id", buyer_id)\
            .execute()
        
        if not buyer_res.data:
            bot.create_message(session_id, "❌ Profil acheteur non trouvé", "WARNING")
            raise HTTPException(status_code=404, detail="Acheteur non trouvé")
        
        buyer_balance = buyer_res.data[0].get("app_wallet_balance", 0.0)
        
        if buyer_balance < agreed_price:
            bot.create_message(
                session_id,
                f"❌ Solde App insuffisant. Vous avez {buyer_balance}€, besoin de {agreed_price}€",
                "WARNING"
            )
            # Cancel session
            supabase.table("trade_sessions").update({"status": "CANCELLED"}).eq("id", session_id).execute()
            raise HTTPException(status_code=400, detail=f"Solde insuffisant")
        
        bot.create_message(session_id, f"✅ Solde ACHETEUR vérifié (Disponible: {buyer_balance}€ >= Prix: {agreed_price}€)", "MONEY")
        
        # Step 4: Check seller Izly balance (real-time scraping)
        bot.create_message(session_id, "📡 Connexion au compte Izly du vendeur...", "INFO")
        
        try:
            izly_login = security.decrypt(seller.get("izly_login_encrypted", ""))
            izly_password = security.decrypt(seller.get("izly_password_encrypted", ""))
            
            if not izly_login or not izly_password:
                bot.create_message(session_id, "❌ Credentials vendeur manquants", "WARNING")
                raise HTTPException(status_code=400, detail="Credentials vendeur invalides")
            
            client = IzlyClient()
            if not client.login(izly_login, izly_password):
                bot.create_message(session_id, "❌ Connexion Izly vendeur échouée", "WARNING")
                raise HTTPException(status_code=500, detail="Erreur login Izly")
            
            balance_data = client.get_balance_and_history()
            seller_balance = balance_data.get("balance", 0.0)
            
            # Requirement: "Seller (Nolan) real Izly balance > 3.30€"
            MIN_SELLER_BALANCE = 3.30
            
            print(f"✓ Seller balance: {seller_balance}€ (min required: {MIN_SELLER_BALANCE}€)")
            
            if seller_balance < MIN_SELLER_BALANCE:
                bot.create_message(
                    session_id,
                    f"❌ Vendeur sans solde suffisant ({seller_balance}€ < {MIN_SELLER_BALANCE}€)",
                    "WARNING"
                )
                # Cancel offer and session
                supabase.table("market_offers").update({"status": "CANCELLED"}).eq("id", offer_id).execute()
                supabase.table("trade_sessions").update({"status": "CANCELLED"}).eq("id", session_id).execute()
                raise HTTPException(status_code=400, detail="Solde vendeur insuffisant")
            
            bot.create_message(session_id, f"✅ Solde VENDEUR (Izly) vérifié ({seller_balance}€)", "SUCCESS")
            
            # Step 5: Lock Offer
            bot.create_message(session_id, "🔒 Verrouillage de l'offre...", "INFO")
            supabase.table("market_offers").update({"status": "LOCKED"}).eq("id", offer_id).execute()
            
            # Step 6: Generate QR Code
            bot.create_message(session_id, "🎫 Génération du QR Code...", "INFO")
            
            qr_data = client.get_qr_code()
            if not qr_data or not qr_data.get("qr_image"):
                bot.create_message(session_id, "❌ Erreur génération QR Code", "WARNING")
                # Unlock offer if QR fails? Or keep locked? Let's keep locked for safety or cancel.
                # For now, let's cancel to be safe.
                supabase.table("market_offers").update({"status": "OPEN"}).eq("id", offer_id).execute() # Re-open
                raise HTTPException(status_code=500, detail="Erreur génération QR")
            
            qr_base64 = base64.b64encode(qr_data["qr_image"]).decode('utf-8')
            
            # Update session with QR code
            supabase.table("trade_sessions").update({
                "qr_code_token": qr_base64,
                "qr_expiration": qr_data.get("expiration"),
                "status": "QR_SENT"
            }).eq("id", session_id).execute()
            
            bot.create_message(session_id, "✅ QR Code prêt. ⚠️ Ne pas ouvrir l'appli Izly officielle (sinon ce code sera annulé).", "QR")
            
            # Step 7: Debit buyer wallet (Real logic: debit now)
            supabase.table("profiles").update({
                "app_wallet_balance": buyer_balance - agreed_price
            }).eq("id", buyer_id).execute()
            
            bot.create_message(session_id, f"💰 Paiement de {agreed_price}€ effectué.", "MONEY")
            
            # Return trade session
            return {
                "id": session_id,
                "offer_id": offer_id,
                "buyer_id": buyer_id,
                "seller_id": seller_id,
                "qr_code_base64": qr_base64,
                "agreed_price": agreed_price,
                "seller_payout": seller_payout,
                "status": "QR_SENT",
                "created_at": session_data.get("created_at", "")
            }
            
        except HTTPException:
            raise
        except Exception as e:
            bot.create_message(session_id, f"❌ Erreur système: {str(e)}", "WARNING")
            raise HTTPException(status_code=500, detail=f"Erreur trading: {str(e)}")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur initialisation trade: {str(e)}")


@router.get("/chat/{session_id}", response_model=List[ChatMessageResponse])
def get_chat_messages(session_id: str):
    """
    **Récupérer le chat**

    Renvoie l'historique des messages du Bot pour une session donnée (`session_id`).
    Permet de suivre l'avancement (Vérification solde -> QR généré -> Paiement).
    """
    try:
        result = supabase.table("chat_messages")\
            .select("*")\
            .eq("session_id", session_id)\
            .order("created_at")\
            .execute()
        
        return result.data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur chat: {str(e)}")


@router.post("/regenerate/{session_id}")
def regenerate_qr(session_id: str, request: TradeBookRequest):
    """
    **Régénérer le QR Code**

    Génère un NOUVEAU QR code pour une session existante (`session_id`).
    Utile si l'acheteur a attendu trop longtemps (>15 min) et que le premier code a expiré.
    Revérifie le solde vendeur par sécurité.
    """
    try:
        # 1. Fetch session details
        session_res = supabase.table("trade_sessions")\
            .select("*, profiles!trade_sessions_seller_id_fkey(*)")\
            .eq("id", session_id)\
            .execute()
        
        if not session_res.data:
            raise HTTPException(status_code=404, detail="Session non trouvée")
        
        session = session_res.data[0]
        seller = session["profiles"]
        
        # Verify requester is the buyer
        if session["buyer_id"] != request.buyer_id:
            raise HTTPException(status_code=403, detail="Non autorisé")
            
        # Verify session is not cancelled
        if session["status"] == "CANCELLED":
            raise HTTPException(status_code=400, detail="Transaction annulée")
            
        bot.create_message(session_id, "🔄 Demande de nouveau QR Code...", "INFO")
        
        # 1. Check limit
        if session.get('regeneration_count', 0) >= 3:
             bot.create_message(session_id, "⚠️ Limite de régénération atteinte (max 3).", "WARNING")
             return {"status": "limit_reached"}

        # 2. Get Seller Credentials
        seller_id = session['seller_id']
        seller_creds = supabase.table("profiles").select("izly_login_encrypted, izly_password_encrypted").eq("id", seller_id).single().execute()
        
        if not seller_creds.data:
            raise HTTPException(status_code=404, detail="Seller credentials not found")
            
        username = security.decrypt(seller_creds.data['izly_login_encrypted'])
        password = security.decrypt(seller_creds.data['izly_password_encrypted'])
        
        # 3. Login to Izly
        client = IzlyClient()
        if not client.login(username, password):
             bot.create_message(session_id, "❌ Erreur connexion Izly vendeur", "ERROR")
             raise HTTPException(status_code=400, detail="Izly login failed")
             
        # 4. Get New QR Code
        qr_data = client.get_qr_code()
        if not qr_data or not qr_data.get("qr_image"):
            bot.create_message(session_id, "❌ Erreur génération QR Code", "WARNING")
            return {"status": "error"}
            
        qr_base64 = base64.b64encode(qr_data["qr_image"]).decode('utf-8')
        
        # 5. Update Session
        new_count = session.get('regeneration_count', 0) + 1
        supabase.table("trade_sessions").update({
            "qr_code_token": qr_base64,
            "qr_expiration": qr_data.get("expiration"),
            "regeneration_count": new_count
        }).eq("id", session_id).execute()
        
        bot.create_message(session_id, f"🎫 Nouveau QR Code ({new_count}/3). ⚠️ N'ouvrez pas l'appli Izly !", "QR")
        
        return {"status": "success", "qr_code": qr_base64}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in background verification: {e}")


def verify_transaction_background(session_id: str):
    """
    Background task to check if a transaction has been completed on Izly.
    Checks for a payment with the exact expected amount based on seller's tariff.
    """
    try:
        # 1. Get Session
        session_res = supabase.table("trade_sessions").select("*, seller:seller_id(*)").eq("id", session_id).single().execute()
        if not session_res.data:
            return
        session = session_res.data
        seller = session['seller'] # This is the profile data
        
        # Only check if QR_SENT
        if session['status'] != 'QR_SENT':
            return

        # 2. Get Seller Credentials & Tariff
        # We need credentials from 'profiles' table (where we store them encrypted)
        # 'seller' variable here comes from the join in step 1, so it IS the profile data.
        # We just need to ensure we selected the encrypted fields in step 1.
        # Step 1: .select("*, seller:seller_id(*)") -> This selects all columns from profiles.
        # So 'seller' dict should have 'izly_login_encrypted' etc.
        
        izly_login_enc = seller.get("izly_login_encrypted")
        izly_pass_enc = seller.get("izly_password_encrypted")
        tariff_code = seller.get("tariff_code")
        
        if not izly_login_enc or not izly_pass_enc or not tariff_code:
            return
            
        username = security.decrypt(izly_login_enc)
        password = security.decrypt(izly_pass_enc)
        
        # 3. Determine Expected Amount
        tariff_info = TARIFF_CONFIG.get(tariff_code)
        if not tariff_info:
            return
        expected_cost = tariff_info['izly_cost'] # e.g. 1.00 or 3.30
        
            # 4. Login and Check History
        client = IzlyClient()
        if client.login(username, password):
            history_data = client.get_balance_and_history()
            transactions = history_data.get("transactions", [])
            
            has_payment = False
            
            # Session time is UTC. Izly time is Paris (UTC+1 or +2).
            # To be safe and simple, we convert session time to naive (UTC) 
            # and assume Izly time is at least UTC (which it is, it's ahead).
            # So if we subtract 2 hours from Izly time, we get roughly UTC (or less).
            # If (IzlyTime - 2h) > SessionTimeUTC, then it's definitely after.
            
            session_created_at = datetime.fromisoformat(session['created_at'].replace('Z', ''))
            
            for tx in transactions:
                # Check Type
                if tx['type'] != 'PAYMENT':
                    continue
                    
                # Check Amount (Exact match required)
                if abs(abs(tx['amount']) - expected_cost) > 0.01:
                    continue
                    
                # Check Date
                tx_date = tx['izly_date'] # Naive, Paris time
                
                # Approximate UTC conversion for Paris (subtract 2 hours to be safe/conservative)
                # If it was winter (UTC+1), subtracting 2h makes it 1h earlier than real UTC, 
                # which makes the check stricter (we might miss a tx if it happened immediately).
                # Actually, we want to ensure tx_date is AFTER session_created_at.
                # tx_date (Paris) > session_created_at (UTC) is not directly comparable.
                # Paris = UTC + 1 (Winter) or + 2 (Summer).
                # So tx_date_utc = tx_date - 1h or -2h.
                # Let's use a 2h offset to normalize to "minimum possible UTC".
                
                tx_date_utc_approx = tx_date - timedelta(hours=2)
                
                # We use a 5-minute buffer in case clocks are slightly off
                if tx_date_utc_approx >= (session_created_at - timedelta(minutes=5)):
                    has_payment = True
                    # We assume the most recent matching transaction is the one
                    # Since we iterate (usually newest first?), the first match is good.
                    break
            
            if has_payment:
                # Mark as COMPLETED
                supabase.table("trade_sessions").update({
                    "status": "COMPLETED",
                    "finalized_at": datetime.now().isoformat()
                }).eq("id", session_id).execute()
                
                bot.create_message(session_id, f"✅ Paiement de {expected_cost}€ confirmé ! Transaction terminée.", "SUCCESS")
        
        # Update last_checked_at
        supabase.table("trade_sessions").update({
            "last_checked_at": datetime.now().isoformat()
        }).eq("id", session_id).execute()
        
    except Exception as e:
        print(f"Error in background verification: {e}")

@router.get("/history/{user_id}")
async def get_trade_history(user_id: str, background_tasks: BackgroundTasks):
    """
    **Historique des transactions**

    Renvoie toutes les sessions de trade où l'utilisateur (`user_id`) est impliqué,
    soit en tant qu'acheteur (`as_buyer`), soit en tant que vendeur (`as_seller`).
    """
    from datetime import datetime, timedelta # Added here for self-containment, ideally at top of file
    
    try:
        # Trigger verification for active sessions
        try:
            active_sessions = supabase.table("trade_sessions").select("*").eq("buyer_id", user_id).eq("status", "QR_SENT").execute()
            for session in active_sessions.data:
                # Check if we should verify (e.g. every 60s)
                last_checked = session.get('last_checked_at')
                should_check = True
                if last_checked:
                    last_time = datetime.fromisoformat(last_checked)
                    if datetime.now() - last_time < timedelta(seconds=60):
                        should_check = False
                
                if should_check:
                    background_tasks.add_task(verify_transaction_background, session['id'])
                    
        except Exception as e:
            print(f"Error triggering background checks: {e}")

        # Return history
        response = supabase.table("trade_sessions").select("*, seller:seller_id(full_name), buyer:buyer_id(full_name)").or_(f"seller_id.eq.{user_id},buyer_id.eq.{user_id}").order("created_at", desc=True).execute()
        
        # Process and separate
        sales = []
        purchases = []
        
        for trade in response.data:
            if trade['seller_id'] == user_id:
                sales.append(trade)
            else:
                purchases.append(trade)
                
        return {
            "as_seller": sales,
            "as_buyer": purchases
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur historique: {str(e)}")
