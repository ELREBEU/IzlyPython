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
        """ Scrapes /Profile for ALL personal info using robust selectors """
        try:
            res = self.session.get(f"{self.BASE_URL}/Profile")
            if res.status_code != 200: 
                print(f"Profile page returned status {res.status_code}")
                return None
            
            soup = BeautifulSoup(res.text, 'html.parser')
            data = {}

            # 1. Header Info (Name, Email/Identifier, DOB)
            header_div = soup.find('div', class_='header')
            if header_div:
                # Name
                h1 = header_div.find('h1')
                if h1:
                    data['full_name'] = h1.text.strip()
                    print(f"✓ Nom: {data['full_name']}")
                
                # Definition List for other header info
                dl = header_div.find('dl')
                if dl:
                    dts = dl.find_all('dt')
                    dds = dl.find_all('dd')
                    # Iterate through pairs
                    for dt, dd in zip(dts, dds):
                        label = dt.text.strip().upper()
                        value = dd.text.strip()
                        
                        if "IDENTIFIANT" in label:
                            data['email'] = value # Primary identifier is often the email
                            print(f"✓ Email (Identifiant): {data['email']}")
                        elif "DATE DE NAISSANCE" in label:
                            data['birth_date'] = value
                            print(f"✓ Date de naissance: {data['birth_date']}")

            # 2. Address (from strong tags in rectangle)
            # Look for the rectangle containing the address
            # Strategy: Find form-line with "Adresse postale", then find the rectangle inside
            form_lines = soup.find_all('div', class_='form-line')
            
            for line in form_lines:
                text_content = line.get_text().strip()
                
                # Address
                if "Adresse postale" in text_content and not "e-mail" in text_content:
                    rect = line.find('div', class_='rectangle')
                    if rect:
                        # Try specific classes first (as seen in user HTML)
                        street_elem = rect.find('strong', class_='addWay')
                        zip_elem = rect.find('strong', class_='addZipCode')
                        city_elem = rect.find('strong', class_='addCity')
                        
                        if street_elem: data['address_street'] = street_elem.text.strip()
                        if zip_elem: data['address_zip'] = zip_elem.text.strip()
                        if city_elem: data['address_city'] = city_elem.text.strip()
                        
                        # Fallback: Parse text if classes missing
                        if not data.get('address_city'):
                            full_text = rect.get_text(" ", strip=True)
                            # Simple heuristic if needed, but classes should work
                            print(f"⚠ Address fallback parsing for: {full_text}")
                            
                        print(f"✓ Adresse: {data.get('address_street')} {data.get('address_zip')} {data.get('address_city')}")

                # Secondary Email
                if "Adresse e-mail secondaire" in text_content:
                    rect = line.find('div', class_='rectangle')
                    if rect:
                        email_sec = rect.text.strip()
                        if '@' in email_sec:
                            data['email_secondary'] = email_sec
                            print(f"✓ Email secondaire: {data['email_secondary']}")

                # Phone
                if "Téléphone portable" in text_content:
                    rect = line.find('div', class_='rectangle')
                    if rect:
                        phone = rect.text.strip()
                        # Clean up phone number
                        data['phone'] = phone
                        print(f"✓ Téléphone: {data['phone']}")

                # Company Code
                if "Code société" in text_content:
                    rect = line.find('div', class_='rectangle')
                    if rect:
                        data['company_code'] = rect.text.strip()
                        print(f"✓ Code société: {data['company_code']}")

                # Tariff Code
                if "Code tarif" in text_content:
                    rect = line.find('div', class_='rectangle')
                    if rect:
                        data['tariff_code'] = rect.text.strip()
                        print(f"✓ Code tarif: {data['tariff_code']}")
                
                # End Date
                if "Date de fin de droits" in text_content:
                    rect = line.find('div', class_='rectangle')
                    if rect:
                        data['end_date'] = rect.text.strip()
                        print(f"✓ Date fin droits: {data['end_date']}")

            # Extract Izly User ID (hidden input)
            user_id_input = soup.find('input', {'id': 'UserId'})
            if user_id_input and user_id_input.get('value'):
                data['izly_user_id'] = user_id_input.get('value')
                print(f"✓ Izly User ID: {data['izly_user_id']}")

            print(f"\n📋 Total fields extracted: {len(data)}")
            return data
            
        except Exception as e:
            print(f"❌ Profile scraping error: {e}")
            import traceback
            traceback.print_exc()
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
