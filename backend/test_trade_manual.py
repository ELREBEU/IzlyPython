import requests
import json
import sys
import getpass

API_URL = "http://localhost:8000/api"

def login():
    print("\n--- Connexion (pour récupérer votre Buyer ID) ---")
    print("Note: Cela utilise la route /api/auth/import-izly")
    email = input("Email Izly: ").strip()
    password = getpass.getpass("Mot de passe Izly: ")
    
    try:
        res = requests.post(f"{API_URL}/auth/import-izly", json={"email": email, "password": password})
        if res.status_code == 200:
            data = res.json()
            user_id = data.get("user_id")
            print(f"✅ Connexion réussie! User ID: {user_id}")
            return user_id
        else:
            print(f"❌ Échec connexion: {res.text}")
            return None
    except Exception as e:
        print(f"Erreur connexion: {e}")
        return None

def list_offers():
    print("\n--- Recherche des offres disponibles ---")
    try:
        res = requests.get(f"{API_URL}/market/offers")
        res.raise_for_status()
        offers = res.json()
        if not offers:
            print("Aucune offre 'OPEN' trouvée.")
            return []
        
        print(f"Trouvé {len(offers)} offres:")
        for i, offer in enumerate(offers):
            print(f"[{i}] ID: {offer['id']} | Vendeur: {offer['seller_name']} | Tarif: {offer['seller_tariff_code']}")
        return offers
    except Exception as e:
        print(f"Erreur récupération offres: {e}")
        return []

def book_trade(offer_id, buyer_id):
    print(f"\n--- Tentative de réservation (Book) ---")
    print(f"Offer ID: {offer_id}")
    print(f"Buyer ID: {buyer_id}")
    
    try:
        payload = {"buyer_id": buyer_id}
        res = requests.post(f"{API_URL}/trade/book/{offer_id}", json=payload)
        
        if res.status_code == 200:
            print("\n✅ SUCCÈS! Transaction démarrée.")
            data = res.json()
            print(json.dumps(data, indent=2))
            if data.get('qr_code_base64'):
                print(f"\nQR Code reçu (début): {data.get('qr_code_base64')[:50]}...")
        else:
            print(f"\n❌ ÉCHEC. Status: {res.status_code}")
            try:
                print(json.dumps(res.json(), indent=2))
            except:
                print(res.text)
            
    except Exception as e:
        print(f"Erreur booking: {e}")

def main():
    print("=== Testeur de Route Trade Izly ===")
    
    # 1. Get Buyer ID
    choice = input("Avez-vous déjà votre User ID (UUID) ? (o/n): ").lower()
    if choice == 'o':
        buyer_id = input("Entrez votre User ID: ").strip()
    else:
        buyer_id = login()
        
    if not buyer_id:
        print("User ID requis pour continuer.")
        return

    # 2. List Offers
    offers = list_offers()
    if not offers:
        print("\nConseil: Utilisez /api/market/share-my-code avec un autre compte pour créer une offre.")
        return

    # 3. Select Offer
    idx = input("\nEntrez l'index de l'offre à acheter (0-N): ").strip()
    if not idx.isdigit() or int(idx) >= len(offers):
        print("Choix invalide.")
        return
    
    selected_offer = offers[int(idx)]
    
    # 4. Book
    book_trade(selected_offer['id'], buyer_id)

if __name__ == "__main__":
    main()
