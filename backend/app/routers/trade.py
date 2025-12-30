from fastapi import APIRouter, HTTPException, status
from app.db.supabase import supabase
from app.models.trade import TradeBookRequest, TradeSessionResponse, ChatMessageResponse
from app.core.security import security
from app.services.izly_scraper import IzlyClient
from app.services.bot_service import bot
from typing import List
import uuid
import base64

router = APIRouter()

# Tariff pricing configuration (from README)
TARIFF_CONFIG = {
    '98': {'izly_cost': 1.00, 'payout': 1.20},   # Boursier
    '100': {'izly_cost': 0.30, 'payout': 0.50},  # Alternant
    '97': {'izly_cost': 3.30, 'payout': 0.00}    # Non-Boursier (can sell but no profit)
}

BUYER_PRICE = 1.50  # Fixed price for all buyers

@router.post("/book/{offer_id}", response_model=TradeSessionResponse)
def book_trade(offer_id: str, request: TradeBookRequest):
    """
    **Réserver un repas (Achat)**

    Démarre une session de trade (`trade_sessions`).
    Le Bot orchestre tout :
    1.  Vérifie solde acheteur (`buyer_id`).
    2.  Vérifie solde vendeur (`seller_id`) sur Izly.
    3.  Génère un QR code frais via Izly.
    4.  Transfère les fonds (virtuellement) et envoie le QR.
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
            "agreed_price": BUYER_PRICE
        }
        supabase.table("trade_sessions").insert(session_data).execute()
        
        # Bot message: Start
        bot.create_message(session_id, "👋 Démarrage de la transaction. Vérification des soldes...", "INFO")
        bot.create_message(session_id, f"👤 Acheteur: {request.buyer_id} | Vendeur: {seller_id}", "INFO")
        
        # Step 2: Fetch seller tariff
        tariff_code = seller.get("tariff_code")
        if not tariff_code or tariff_code not in TARIFF_CONFIG:
            bot.create_message(session_id, "❌ Code tarif vendeur invalide", "WARNING")
            raise HTTPException(status_code=400, detail="Tarif vendeur invalide")
        
        tariff_info = TARIFF_CONFIG[tariff_code]
        seller_payout = tariff_info['payout']
        
        # Step 3: Check buyer wallet balance
        buyer_res = supabase.table("profiles")\
            .select("app_wallet_balance")\
            .eq("id", buyer_id)\
            .execute()
        
        if not buyer_res.data:
            bot.create_message(session_id, "❌ Profil acheteur non trouvé", "WARNING")
            raise HTTPException(status_code=404, detail="Acheteur non trouvé")
        
        buyer_balance = buyer_res.data[0].get("app_wallet_balance", 0.0)
        
        if buyer_balance < BUYER_PRICE:
            bot.create_message(
                session_id,
                f"❌ Solde App insuffisant. Vous avez {buyer_balance}€, besoin de {BUYER_PRICE}€",
                "WARNING"
            )
            # Cancel session
            supabase.table("trade_sessions").update({"status": "CANCELLED"}).eq("id", session_id).execute()
            raise HTTPException(status_code=400, detail="Solde insuffisant")
        
        bot.create_message(session_id, f"✅ Solde ACHETEUR vérifié (Disponible: {buyer_balance}€ >= Prix: {BUYER_PRICE}€)", "MONEY")
        
        # Step 4: Check seller Izly balance (real-time scraping)
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
            
            print(f"✓ Seller balance: {seller_balance}€ (min: {tariff_info['izly_cost']}€)")
            
            if seller_balance < tariff_info['izly_cost']:
                bot.create_message(
                    session_id,
                    f"❌ Vendeur sans solde suffisant ({seller_balance}€ < {tariff_info['izly_cost']}€)",
                    "WARNING"
                )
                # Cancel offer and session
                supabase.table("market_offers").update({"status": "CANCELLED"}).eq("id", offer_id).execute()
                supabase.table("trade_sessions").update({"status": "CANCELLED"}).eq("id", session_id).execute()
                raise HTTPException(status_code=400, detail="Solde vendeur insuffisant")
            
            bot.create_message(session_id, f"✅ Solde VENDEUR (Izly) vérifié ({seller_balance}€ disponible)", "SUCCESS")
            
            # Step 5: Generate QR Code
            qr_data = client.get_qr_code()
            if not qr_data or not qr_data.get("qr_image"):
                bot.create_message(session_id, "❌ Erreur génération QR Code", "WARNING")
                raise HTTPException(status_code=500, detail="Erreur génération QR")
            
            qr_base64 = base64.b64encode(qr_data["qr_image"]).decode('utf-8')
            
            # Update session with QR code
            supabase.table("trade_sessions").update({
                "qr_code_token": qr_base64,
                "status": "QR_SENT"
            }).eq("id", session_id).execute()
            
            bot.create_message(
                session_id,
                f"🎫 QR Code généré ! Prix: {BUYER_PRICE}€ → Vendeur reçoit {seller_payout}€",
                "QR"
            )
            
            # Step 6: Debit buyer wallet
            supabase.table("profiles").update({
                "app_wallet_balance": buyer_balance - BUYER_PRICE
            }).eq("id", buyer_id).execute()
            
            bot.create_message(session_id, "💰 Paiement effectué depuis votre wallet", "MONEY")
            
            # Lock the offer (no longer available)
            supabase.table("market_offers").update({"status": "LOCKED"}).eq("id", offer_id).execute()
            
            # Return trade session
            return {
                "id": session_id,
                "offer_id": offer_id,
                "buyer_id": buyer_id,
                "seller_id": seller_id,
                "qr_code_base64": qr_base64,
                "agreed_price": BUYER_PRICE,
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
        
        # 2. Re-login to Izly (Seller)
        izly_login = security.decrypt(seller.get("izly_login_encrypted", ""))
        izly_password = security.decrypt(seller.get("izly_password_encrypted", ""))
        
        client = IzlyClient()
        if not client.login(izly_login, izly_password):
            bot.create_message(session_id, "❌ Erreur reconnexion vendeur", "WARNING")
            raise HTTPException(status_code=500, detail="Erreur login Izly")
            
        # 3. Check balance again (Safety)
        tariff_code = seller.get("tariff_code")
        tariff_info = TARIFF_CONFIG.get(tariff_code, TARIFF_CONFIG['97'])
        
        balance_data = client.get_balance_and_history()
        seller_balance = balance_data.get("balance", 0.0)
        
        if seller_balance < tariff_info['izly_cost']:
            bot.create_message(session_id, f"❌ Solde vendeur insuffisant ({seller_balance}€)", "WARNING")
            raise HTTPException(status_code=400, detail="Solde vendeur insuffisant")
            
        # 4. Generate NEW QR Code
        qr_data = client.get_qr_code()
        if not qr_data or not qr_data.get("qr_image"):
            bot.create_message(session_id, "❌ Erreur génération QR", "WARNING")
            raise HTTPException(status_code=500, detail="Erreur génération QR")
            
        qr_base64 = base64.b64encode(qr_data["qr_image"]).decode('utf-8')
        
        # 5. Update Session
        supabase.table("trade_sessions").update({
            "qr_code_token": qr_base64
        }).eq("id", session_id).execute()
        
        bot.create_message(session_id, "🎫 Nouveau QR Code généré ! (Valide 15 min)", "QR")
        
        return {"message": "QR Regenerated", "qr_code_base64": qr_base64}

    except HTTPException:
        raise
    except Exception as e:
        bot.create_message(session_id, f"❌ Erreur régénération: {str(e)}", "WARNING")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


@router.get("/history/{user_id}")
def get_trade_history(user_id: str):
    """
    **Historique des transactions**

    Renvoie toutes les sessions de trade où l'utilisateur (`user_id`) est impliqué,
    soit en tant qu'acheteur (`as_buyer`), soit en tant que vendeur (`as_seller`).
    """
    try:
        # As buyer
        buyer_sessions = supabase.table("trade_sessions")\
            .select("*")\
            .eq("buyer_id", user_id)\
            .execute()
        
        # As seller
        seller_sessions = supabase.table("trade_sessions")\
            .select("*")\
            .eq("seller_id", user_id)\
            .execute()
        
        return {
            "as_buyer": buyer_sessions.data,
            "as_seller": seller_sessions.data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur historique: {str(e)}")
