import os
import sys
from cryptography.fernet import Fernet
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
load_dotenv(dotenv_path=".env")

from app.db.supabase import supabase

KEY = os.getenv("ENCRYPTION_KEY")
if not KEY:
    print("❌ No ENCRYPTION_KEY found!")
    sys.exit(1)

cipher = Fernet(KEY.encode())

SELLER_ID = "15c80168-9cff-ab2e-a584-249350fd7a73"
EMAIL = "nolanpujol34@orange.fr"

def fix_seller():
    print(f"🔧 Fixing credentials for {EMAIL}...")
    
    # Encrypt email as login
    encrypted_login = cipher.encrypt(EMAIL.encode()).decode()
    
    try:
        data = {
            "izly_login_encrypted": encrypted_login
        }
        supabase.table("profiles").update(data).eq("id", SELLER_ID).execute()
        print("✅ Successfully updated izly_login_encrypted")
        
        # Verify
        res = supabase.table("profiles").select("izly_login_encrypted").eq("id", SELLER_ID).execute()
        print(f"New Value in DB: {res.data[0]['izly_login_encrypted'][:20]}...")
        
    except Exception as e:
        print(f"❌ Error updating profile: {e}")

if __name__ == "__main__":
    fix_seller()
