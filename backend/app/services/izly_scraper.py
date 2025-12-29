import requests
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional, Dict, Any
import base64

class IzlyClient:
    BASE_URL = "https://mon-espace.izly.fr"
    LOGIN_URL = f"{BASE_URL}/Home/Logon"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
        })

    def login(self, username, password) -> bool:
        """ Handles CSRF Token extraction + Login POST """
        try:
            # 1. GET Login page to fetch CSRF Token
            # Using the exact URL from user's script which seems to work better
            url_login_get = f"{self.LOGIN_URL}?ReturnUrl=%2f"
            response = self.session.get(url_login_get)
            soup = BeautifulSoup(response.text, 'html.parser')
            token_input = soup.find('input', {'name': '__RequestVerificationToken'})
            
            if not token_input: return False
            token = token_input['value']

            # 2. POST Credentials
            payload = {
                '__RequestVerificationToken': token,
                'ReturnUrl': '/',
                'Username': username,
                'Password': password
            }
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': url_login_get
            }
            self.session.post(self.LOGIN_URL, data=payload, headers=headers)
            
            # Check success via cookie existence
            return ".ASPXAUTH" in self.session.cookies
        except Exception as e:
            print(f"Login Error: {e}")
            return False

    def get_profile_data(self) -> Optional[Dict[str, Any]]:
        """ Scrapes /Profile for personal info and TARIFF CODE """
        try:
            res = self.session.get(f"{self.BASE_URL}/Profile")
            if res.status_code != 200: return None
            
            soup = BeautifulSoup(res.text, 'html.parser')
            data = {}

            # Extract Name (H1 in Header)
            header_div = soup.find('div', class_='header')
            if header_div:
                data['full_name'] = header_div.find('h1').text.strip()

            # Extract Tariff Code (Crucial for Business Model)
            # Looks for div with class 'rectangle' following 'Code tarif'
            form_lines = soup.find_all('div', class_='form-line')
            for line in form_lines:
                if "Code tarif" in line.text:
                    rectangle = line.find('div', class_='rectangle')
                    if rectangle:
                        data['tariff_code'] = rectangle.text.strip()
                if "identifiant" in line.text.lower(): # Izly ID
                     user_id_input = soup.find('input', {'id': 'UserId'})
                     if user_id_input:
                        data['izly_user_id'] = user_id_input['value']

            # Extract Address
            addr_div = soup.find('div', class_='rectangle') # Often the first one
            if addr_div and addr_div.find('strong', class_='addZipCode'):
                 data['address_zip'] = addr_div.find('strong', class_='addZipCode').text.strip()
                 data['address_city'] = addr_div.find('strong', class_='addCity').text.strip()

            return data
        except Exception as e:
            print(f"Profile Error: {e}")
            return None

    def get_balance_and_history(self) -> Dict[str, Any]:
        """ Scrapes Dashboard for Balance + AJAX Calls for History """
        data = {"balance": 0.0, "transactions": []}
        
        # 1. Balance (Dashboard)
        try:
            res = self.session.get(f"{self.BASE_URL}/")
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # Robust balance finding (from user script)
            bal_tag = soup.find('p', {'id': 'balance'})
            if not bal_tag:
                bal_tag = soup.find('p', class_='balance-text')
                
            if bal_tag:
                txt = bal_tag.get_text().replace('+', '').replace('€', '').replace(',', '.').strip()
                # Clean up newlines/spaces just in case
                txt = txt.replace('\n', '').replace(' ', '')
                data["balance"] = float(txt)
        except Exception: pass

        # 2. History (AJAX Calls)
        # Izly loads history via 3 specific endpoints
        endpoints = [
            ("/Home/GetTopups", "RECHARGE"),
            ("/Home/GetPayments", "PAYMENT"),
            ("/Home/GetBankAccountTransfers", "TRANSFER")
        ]
        
        headers_ajax = {'X-Requested-With': 'XMLHttpRequest', 'Referer': f"{self.BASE_URL}/"}

        for url, tx_type in endpoints:
            try:
                res = self.session.get(f"{self.BASE_URL}{url}", headers=headers_ajax)
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, 'html.parser')
                    items = soup.find_all('li', class_='list-group-item')
                    
                    for item in items:
                        # Extract Type
                        label_tag = item.find('p', class_='operation-type')
                        if not label_tag: continue
                        label = label_tag.text.strip()
                        
                        # Extract Date (Handle typo 'oeration-date')
                        date_tag = item.find('p', class_='oeration-date') or item.find('p', class_='operation-date')
                        if not date_tag: continue
                        date_obj = datetime.strptime(date_tag.text.strip(), "%d/%m/%Y %H:%M")
                        
                        # Extract Amount
                        amt_tag = item.find('p', class_='operation-amount')
                        if not amt_tag: continue
                        amt_txt = amt_tag.text
                        amount = float(amt_txt.replace('€', '').replace(',', '.').strip())
                        
                        if tx_type == "PAYMENT": amount = -abs(amount)

                        data["transactions"].append({
                            "type": tx_type,
                            "label": label,
                            "amount": amount,
                            "izly_date": date_obj
                        })
            except Exception: continue
            
        return data

    def get_qr_code(self) -> Optional[Dict[str, Any]]:
        """ Generates a QR Code for payment """
        try:
            url_qrcode = f"{self.BASE_URL}/Home/CreateQrCodeImg"
            payload_qr = {"numberOfQrCodes": "1"}
            headers_qr = {
                "X-Requested-With": "XMLHttpRequest",
                "Referer": f"{self.BASE_URL}/Home/GenerateQRCode",
                "Origin": self.BASE_URL
            }

            response = self.session.post(url_qrcode, data=payload_qr, headers=headers_qr)

            if response.status_code == 200:
                data = response.json()
                print(f"QR Code API Response: {data}")  # Debug: voir ce que renvoie l'API
                
                if "images" in data and len(data["images"]) > 0:
                    base64_img = data["images"][0]
                    qr_bytes = base64.b64decode(base64_img)
                    
                    # Extract validityDate from response
                    expiration = data.get("validityDate")  # Format: "29/12/2025 00:05:00"
                    
                    return {
                        "qr_image": qr_bytes,
                        "expiration": expiration
                    }
            return None
        except Exception as e:
            print(f"QR Code Error: {e}")
            return None

    def get_my_izly_identifier_qr(self) -> Optional[Dict[str, Any]]:
        """ Generates a QR Code representing the user's Izly identifier """
        try:
            url_qrcode = f"{self.BASE_URL}/Home/CreateQrCodeImgMyIzlyIdentifier"
            headers_qr = {
                "X-Requested-With": "XMLHttpRequest",
                "Referer": f"{self.BASE_URL}/Home/GenerateQRCodeMyIzlyIdentifier",
                "Origin": self.BASE_URL
            }

            response = self.session.post(url_qrcode, data={}, headers=headers_qr)

            if response.status_code == 200:
                data = response.text  # Returns base64 directly as string
                print(f"My Izly Identifier QR Response length: {len(data)}")
                
                if data:
                    qr_bytes = base64.b64decode(data)
                    return {
                        "qr_image": qr_bytes
                    }
            return None
        except Exception as e:
            print(f"My Izly Identifier QR Error: {e}")
            return None
