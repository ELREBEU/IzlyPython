import os
import getpass
import time
from app.services.izly_scraper import IzlyClient

# Add the current directory to sys.path to make imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_scraping():
    print("🥗 TEST SCRAPING IZLY")
    print("---------------------")
    
    email = input("Email Izly: ")
    password = getpass.getpass("Mot de passe Izly: ")
    
    print("\n🔄 Connexion en cours...")
    client = IzlyClient()
    
    if client.login(email, password):
        print("✅ Login SUCCESS!")
        
        print("\n🔄 Récupération du profil...")
        profile = client.get_profile_data()
        if profile:
            print("✅ Profil récupéré :")
            for k, v in profile.items():
                print(f"   - {k}: {v}")
        else:
            print("❌ Erreur récupération profil")

        print("\n🔄 Récupération du solde et historique...")
        data = client.get_balance_and_history()
        print(f"💰 Solde: {data.get('balance')} €")
        print(f"📜 Transactions ({len(data.get('transactions', []))} trouvées):")
        
        for tx in data.get('transactions', [])[:5]: # Show last 5
            print(f"   [{tx['izly_date'].strftime('%d/%m %H:%M')}] {tx['type']} : {tx['amount']}€ ({tx['label']})")
            
        print("\n🔄 Test Génération QR Code...")
        qr_bytes = client.get_qr_code()
        if qr_bytes:
            filename = f"test_qrcode_{int(time.time())}.png"
            with open(filename, "wb") as f:
                f.write(qr_bytes)
            print(f"✅ QR Code généré et sauvegardé : {filename}")
        else:
            print("❌ Échec génération QR Code")
            
    else:
        print("❌ Login FAILED. Vérifiez vos identifiants.")

if __name__ == "__main__":
    test_scraping()
