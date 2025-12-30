from app.db.supabase import supabase
import sys

BUYER_ID = "485b71ef-a09e-c862-18f9-3bf4cce12811" # Iness

def credit_wallet():
    print(f"Crediting wallet for {BUYER_ID}...")
    try:
        supabase.table("profiles").update({"app_wallet_balance": 10.0}).eq("id", BUYER_ID).execute()
        print("✅ Wallet credited to 10.0€")
    except Exception as e:
        print(f"❌ Error crediting wallet: {e}")

if __name__ == "__main__":
    credit_wallet()
