import sys
import os

# Add the backend directory to sys.path so we can import app modules
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.supabase import supabase

def check_data():
    print("--- Users (Profiles) ---")
    try:
        users = supabase.table("profiles").select("id, email, full_name, app_wallet_balance").execute()
        if not users.data:
            print("Aucun utilisateur trouvé.")
        for u in users.data:
            print(f"ID: {u['id']} | Email: {u['email']} | Solde: {u['app_wallet_balance']}")
    except Exception as e:
        print(f"Error fetching profiles: {e}")

    print("\n--- Market Offers ---")
    try:
        offers = supabase.table("market_offers").select("*").execute()
        if not offers.data:
            print("Aucune offre trouvée.")
        for o in offers.data:
            print(f"ID: {o['id']} | Seller: {o['seller_id']} | Status: {o['status']}")
    except Exception as e:
        print(f"Error fetching offers: {e}")

if __name__ == "__main__":
    check_data()
