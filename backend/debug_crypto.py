import os
import sys
from cryptography.fernet import Fernet
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Load env from current directory (since we run from backend/)
load_dotenv(dotenv_path=".env")

from app.db.supabase import supabase

KEY = os.getenv("ENCRYPTION_KEY")
print(f"🔑 Key loaded: {KEY[:5]}...{KEY[-5:] if KEY else 'None'}")

if not KEY:
    print("❌ No ENCRYPTION_KEY found!")
    sys.exit(1)

cipher = Fernet(KEY.encode())

def test_crypto():
    # 1. Test basic encryption/decryption
    test_str = "Hello World"
    enc = cipher.encrypt(test_str.encode()).decode()
    dec = cipher.decrypt(enc.encode()).decode()
    print(f"\n✅ Test Local Crypto: {test_str} -> {enc[:10]}... -> {dec}")
    assert test_str == dec

    # 2. Fetch Seller Credentials
    # Nolan's ID from previous step
    SELLER_ID = "15c80168-9cff-ab2e-a584-249350fd7a73" 
    
    print(f"\n🔍 Fetching credentials for Seller ID: {SELLER_ID}")
    res = supabase.table("profiles").select("email, izly_login_encrypted, izly_password_encrypted").eq("id", SELLER_ID).execute()
    
    if not res.data:
        print("❌ Seller not found!")
        return

    user = res.data[0]
    print(f"👤 User: {user['email']}")
    
    enc_login = user.get("izly_login_encrypted")
    enc_pass = user.get("izly_password_encrypted")
    
    print(f"🔒 Encrypted Login: {enc_login[:20]}..." if enc_login else "🔒 Encrypted Login: None")
    print(f"🔒 Encrypted Pass: {enc_pass[:20]}..." if enc_pass else "🔒 Encrypted Pass: None")

    # 3. Attempt Decryption
    try:
        if enc_login:
            dec_login = cipher.decrypt(enc_login.encode()).decode()
            print(f"🔓 Decrypted Login: {dec_login}")
        else:
            print("⚠️ No encrypted login found")
            
        if enc_pass:
            dec_pass = cipher.decrypt(enc_pass.encode()).decode()
            # Mask password
            masked_pass = dec_pass[:2] + "*" * (len(dec_pass)-4) + dec_pass[-2:] if len(dec_pass) > 4 else "***"
            print(f"🔓 Decrypted Pass: {masked_pass} (Length: {len(dec_pass)})")
        else:
            print("⚠️ No encrypted password found")
            
    except Exception as e:
        print(f"❌ Decryption Failed: {e}")
        print("💡 Possible causes: Wrong ENCRYPTION_KEY or data corrupted/changed.")

if __name__ == "__main__":
    test_crypto()
