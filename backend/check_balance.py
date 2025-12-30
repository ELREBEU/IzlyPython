from app.db.supabase import supabase
import sys

BUYER_EMAIL = "iness.bellaouedj@gmail.com"

def check_balance():
    print(f"🔍 Checking balance for {BUYER_EMAIL}...")
    try:
        res = supabase.table("profiles").select("id, app_wallet_balance").eq("email", BUYER_EMAIL).execute()
        if res.data:
            user = res.data[0]
            print(f"💰 Solde actuel: {user['app_wallet_balance']}€")
            print(f"🆔 ID: {user['id']}")
        else:
            print("❌ User not found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_balance()
