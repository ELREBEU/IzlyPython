# 🥗 Izly Trading - Marketplace de Droits Universitaires

> **Le "Uber" du repas Crous** - Une plateforme d'arbitrage permettant aux étudiants boursiers de monétiser leurs avantages tarifaires.

---

## 📋 Table des Matières

- [Le Concept](#-le-concept)
- [Installation](#-installation)
- [Lancement du Projet](#-lancement-du-projet)
  - [Méthode Automatique](#méthode-1--script-automatique-recommandé)
  - [Méthode Manuelle](#méthode-2--lancement-manuel)
- [Architecture Technique](#-architecture-technique)
- [Documentation API](#-documentation-api)

---

## 📖 Le Concept

Izly Trading clone l'interface officielle Izly tout en ajoutant une couche marketplace connectant :

1. **Le Vendeur (Boursier)** : Repas à 1€ qu'il ne consomme pas → récupère du cash
2. **L'Acheteur (Non-Boursier)** : Paye 3,30€ normalement → achète pour ~1,50€
3. **L'App** : Tiers de confiance + commission sur l'échange

### Aspect Financier

**Comment ça marche** : Le vendeur paie son repas au Crous (selon son tarif), puis est **remboursé** par l'acheteur via l'app + reçoit un bonus de 0.20€.

| Type de Vendeur | Code Tarif | Coût Crous (Débité) | Prix Acheteur (Payé à l'App) | Remboursement Vendeur | Profit Vendeur | Total Reçu Vendeur | Commission App |
|:----------------|:-----------|:--------------------|:-----------------------------|:----------------------|:---------------|:-------------------|:---------------|
| Boursier        | **98**     | 1,00 €              | **1,50 €**                   | 1,00 €                | +0,20 €        | **1,20 €**         | **0,30 €**     |
| Alternant       | **100**    | 0,30 €              | **1,00 €**                   | 0,30 €                | +0,20 €        | **0,50 €**         | **0,50 €**     |
| Non-Boursier    | **97**     | 3,30 €              | **3,30 €**                   | 3,30 €                | 0,00 €         | **3,30 €**         | **0,00 €**     |

**Note** : Les non-boursiers peuvent vendre (rare) mais sans profit - c'est un échange de faveur direct.

### 💰 Système à Double Monnaie (Important)

L'application gère deux types de soldes distincts :

1.  **Côté Vendeur (Réel)** :
    *   Utilise le **VRAI solde Izly**.
    *   Lors d'une vente, l'application se connecte en temps réel au compte Izly du vendeur pour vérifier les fonds et générer le QR code.
    *   *Sécurité* : Les identifiants sont chiffrés en base.

2.  **Côté Acheteur (Virtuel)** :
    *   Utilise un **Porte-monnaie Interne** à l'application (Wallet App).
    *   L'acheteur ne paie PAS avec son compte Izly (sinon il paierait plein tarif).
    *   Il doit recharger ce wallet (via CB dans la version finale).

> [!TIP]
> **Pour tester en local** : Comme Stripe n'est pas activé, vous devez créditer manuellement le wallet de l'acheteur via la base de données ou le script `backend/credit_wallet.py`.


---

## 🚀 Installation

### Prérequis

- **Python 3.11+**
- **Node.js 18+** et npm
- **Docker** et Docker Compose
- **Git**

### Cloner le projet

```bash
git clone https://github.com/ELREBEU/IzlyPython.git
cd IzlyPython
```

### Configuration Backend

```bash
cd backend

# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase
```

### Configuration Frontend

```bash
cd frontend-web
npm install
```

### Configuration Supabase

```bash
cd backend/supabase
docker-compose up -d
```

Accédez à Supabase Studio : http://localhost:54323

---

## 🎯 Lancement du Projet

### Méthode 1 : Script Automatique (Recommandé)

Lance tous les services dans des terminaux séparés :

```bash
./deploy.sh
```

**Ce script démarre :**
- Supabase (Docker Compose)
- Backend FastAPI (Python)
- Frontend React (Vite)

### Méthode 2 : Lancement Manuel

#### Terminal 1 : Supabase

```bash
cd backend/supabase
docker-compose up
```

#### Terminal 2 : Backend FastAPI

```bash
cd backend

# Activer l'environnement virtuel
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Lancer le serveur
uvicorn app.main:app --reload
```

**Le backend sera accessible sur :**
- API : http://localhost:8000
- Documentation interactive : http://localhost:8000/docs

#### Terminal 3 : Frontend React

```bash
cd frontend-web
npm run dev -- --host
```

**Le frontend sera accessible sur :** http://localhost:5173

---

## 🏗 Architecture Technique

### Stack

- **Frontend** : React 18 + Vite + Tailwind CSS
- **Backend** : FastAPI (Python) + Scraping Izly
- **Base de Données** : Supabase (PostgreSQL)
- **Paiements** : Stripe (à implémenter)

### Structure du Projet

```
izly-project/
├── backend/
│   ├── app/
│   │   ├── routers/      # Endpoints API
│   │   │   ├── auth.py   # Login, QR Code, Import Izly
│   │   │   └── user.py   # Wallet, Transactions, Profile
│   │   ├── services/
│   │   │   └── izly_scraper.py  # Scraping Izly officiel
│   │   ├── models/       # Pydantic models
│   │   ├── db/           # Supabase client
│   │   └── main.py       # FastAPI app
│   ├── supabase/         # Docker Compose Supabase
│   ├── venv/             # Environnement Python
│   └── requirements.txt
├── frontend-web/
│   ├── src/
│   │   ├── pages/        # Dashboard, Payment, Profile, etc.
│   │   ├── components/   # UI réutilisables
│   │   └── services/
│   │       └── api.js    # Client API backend
│   └── public/
│       └── icons/        # Icônes SVG Izly
└── deploy.sh             # Script de déploiement auto
```

---

## 📚 Documentation API

### Authentification

#### `POST /api/auth/import-izly`
Importe les données Izly (profil, solde, transactions) et **chiffre les credentials** pour usage futur

**Body :**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Note** : L'UUID est auto-généré via l'email. Les credentials sont chiffrés avec Fernet pour générer les QR codes automatiquement.

#### `POST /api/auth/qr-code`
Génère un QR Code de paiement Izly

**Body :**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response :**
```json
{
  "qr_code_base64": "iVBORw0KGgoAAAANS...",
  "expiration": "29/12/2025 00:05:00"
}
```

### Utilisateur

#### `GET /api/users/wallet/{user_id}`
Récupère le solde Izly

#### `GET /api/users/transactions/{user_id}`
Récupère l'historique des transactions

#### `GET /api/users/profile/{user_id}`
Récupère le profil complet (nom, email, code tarif, etc.)

### Marketplace (Trade)

#### `GET /api/market/offers`
Liste les offres de repas disponibles (vendeurs actifs).

#### `GET /api/trade/history/{user_id}`
Récupère l'historique des transactions de trading.

#### `GET /api/trade/chat/{session_id}`
Récupère les messages et le statut d'une session de trade en cours.

---

## 📱 Fonctionnalités Clés

### 1. Clone Izly (Face Visible)
- Interface identique à l'application officielle.
- Consultation du solde et de l'historique réel.
- Génération de QR Code de paiement.

### 2. Izly Trading (Face Cachée)
- **Dashboard "Uber-style"** : Interface moderne et fluide.
- **Mode Acheteur (Manger)** : Carte interactive des vendeurs à proximité.
- **Mode Vendeur (Vendre)** : Mise en vente de repas et génération de revenus.
- **Chat en Temps Réel** : Communication sécurisée entre acheteur et vendeur.
- **QR Code Holographique** : Preuve de transaction unique.

## 🔐 Sécurité

- **Credentials stockés chiffrés** dans Supabase
- **Sessions Izly** maintenues côté backend
- **Pré-autorisation bancaire** (Stripe) pour éviter les abus
- **Watchdog** vérifie les montants réels débités

---

## 🛠 Développement

### Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend-web
npm run dev -- --host
```

### Supabase Local

```bash
cd backend/supabase
docker-compose logs -f  # Voir les logs
docker-compose down     # Arrêter
docker-compose up -d    # Redémarrer en arrière-plan
```

---

## 📝 Licence

Ce projet est un POC éducatif. L'utilisation réelle nécessite l'accord des Crous et d'Izly.

---

## 👥 Contributeurs

- Développé par l'équipe Izly Trading
- Scraping Izly : Utilise l'API officielle mon-espace.izly.fr

---

## 🆘 Support

Pour toute question :
- Ouvrir une issue sur GitHub
- Consulter `/backend/app/routers/` pour les endpoints disponibles
- Vérifier `http://localhost:8000/docs` pour la doc interactive