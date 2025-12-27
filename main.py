import os
import requests
from bs4 import BeautifulSoup
import base64
import json
import time
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURATION ---
USERNAME = os.getenv("MAIL")
PASSWORD = os.getenv("CODE")
# ---------------------

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
})


def main():
    try:
        # --- ETAPE 1 : Page de login & Token ---
        print("1. Chargement de la page de connexion...")
        url_login_get = "https://mon-espace.izly.fr/Home/Logon?ReturnUrl=%2f"
        response_get = session.get(url_login_get)
        soup = BeautifulSoup(response_get.text, 'html.parser')

        token_input = soup.find('input', {'name': '__RequestVerificationToken'})
        if not token_input:
            print("Erreur: Impossible de trouver le token de vérification.")
            return

        verification_token = token_input['value']

        # --- ETAPE 2 : Connexion ---
        print("2. Envoi des identifiants...")
        url_login_post = "https://mon-espace.izly.fr/Home/Logon"
        payload_login = {
            "__RequestVerificationToken": verification_token,
            "ReturnUrl": "/",
            "Username": USERNAME,
            "Password": PASSWORD
        }
        headers_login = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": "https://mon-espace.izly.fr/Home/Logon?ReturnUrl=%2f"
        }

        session.post(url_login_post, data=payload_login, headers=headers_login)

        if ".ASPXAUTH" not in session.cookies:
            print("   >>> ÉCHEC connexion.")
            return

        print("   >>> Connexion réussie.")

        # --- ETAPE 3 : Récupération du solde (CORRIGÉE) ---
        print("3. Récupération du solde...")

        # CORRECTIF : On vise la page d'accueil directement
        url_home = "https://mon-espace.izly.fr/"

        response_home = session.get(url_home)
        soup_home = BeautifulSoup(response_home.text, 'html.parser')

        # On cherche l'élément par son ID
        balance_tag = soup_home.find('p', id='balance')

        # Fallback : Si l'ID change, on cherche par la classe CSS
        if not balance_tag:
            balance_tag = soup_home.find('p', class_='balance-text')

        if balance_tag:
            # On nettoie le texte : "+4,58€" -> "4.58"
            raw_text = balance_tag.get_text().strip()  # "+4,58€"
            clean_text = raw_text.replace('\n', '').replace(' ', '')

            # Conversion en nombre pour futur usage
            amount_str = clean_text.replace('€', '').replace('+', '').replace(',', '.')
            amount_float = float(amount_str)

            print(f"   --------------------------------")
            print(f"   💰 SOLDE : {clean_text}")
            print(f"   🔢 Valeur numérique : {amount_float}")
            print(f"   --------------------------------")
        else:
            print("   ⚠️ Impossible de lire le solde (Structure HTML inconnue sur cette page).")

        # --- ETAPE 4 : QR Code ---
        print("4. Génération du QR Code...")
        url_qrcode = "https://mon-espace.izly.fr/Home/CreateQrCodeImg"
        payload_qr = {"numberOfQrCodes": "1"}
        headers_qr = {
            "X-Requested-With": "XMLHttpRequest",
            "Referer": "https://mon-espace.izly.fr/Home/GenerateQRCode",
            "Origin": "https://mon-espace.izly.fr"
        }

        response_qr = session.post(url_qrcode, data=payload_qr, headers=headers_qr)

        if response_qr.status_code == 200:
            try:
                data = response_qr.json()
                base64_img = data["images"][0]
                img_binary = base64.b64decode(base64_img)
                filename = f"qrcode_izly_{int(time.time())}.png"
                with open(filename, "wb") as f:
                    f.write(img_binary)
                print(f"   ✅ QR Code sauvegardé : {filename}")
            except Exception:
                pass
        else:
            print(f"   Erreur QR Code : Status {response_qr.status_code}")

    except Exception as e:
        print(f"Erreur globale : {e}")


if __name__ == "__main__":
    main()