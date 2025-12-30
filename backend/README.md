# Izly Trading - Backend API

This is the backend for the Izly Trading application, built with **FastAPI** and **Supabase**.

## 🏗 Architecture

- **Framework**: FastAPI (Python 3.11+)
- **Database**: Supabase (PostgreSQL)
- **Scraping**: `requests` + `BeautifulSoup4`
- **Authentication**: Custom scraping-based auth + Supabase Auth (planned)

## 🚀 Getting Started

### 1. Prerequisites

- Python 3.11 or higher
- Docker (for local Supabase)

### 2. Installation

Navigate to the backend directory and set up the virtual environment:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Database Setup (Local Supabase)

We use a local Supabase instance running via Docker.

1.  **Start Supabase** (from the project root, NOT inside `backend/`):
    ```bash
    cd .. # Go to project root
    npx supabase start
    ```
    *This will start the database and automatically configure your `.env` file in `backend/`.*

2.  **Reset Database** (if needed):
    ```bash
    npx supabase db reset
    ```

### 4. Running the Server

Make sure your virtual environment is activated (`source venv/bin/activate`).

```bash
# From the backend directory
uvicorn app.main:app --reload
```

The API will be available at:
- **API Root**: `http://127.0.0.1:8000`
- **Documentation**: `http://127.0.0.1:8000/docs`

## 🧪 Testing

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/import-izly`: Login and scrape user data (Profile, Balance, History).

### Market (Seller)
- `POST /api/market/share-my-code`: Create a market offer.
  - Verifies seller balance and tariff eligibility (Boursier/Alternant).
  - **No expiration**: Offer remains open until booked.
- `GET /api/market/offers`: List all available offers (Status: OPEN).

### Trade (Buyer)
- `POST /api/trade/book/{offer_id}`: Book an offer.
  - Verifies buyer balance (App Wallet).
  - Verifies seller balance (Izly Scraper).
  - Generates a **fresh QR Code** (valid 15 min) and sends it to the buyer.
- `POST /api/trade/regenerate/{session_id}`: Regenerate an expired QR Code.
  - Re-verifies seller balance.
  - Generates a new QR Code if the previous one expired.

## 📂 Project Structure

```
backend/
├── app/
│   ├── core/           # Configuration (Env vars, Security)
│   ├── db/             # Database connection (Supabase)
│   ├── models/         # Pydantic Models
│   ├── routers/        # API Endpoints (Auth, Market, Trade)
│   ├── services/       # Business Logic (Scraper, Bot)
│   └── main.py         # App Entry Point
└── requirements.txt    # Python Dependencies
```
