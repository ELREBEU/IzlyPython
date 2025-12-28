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

### Test Scraper (Standalone)
To test the scraping logic without the API:
```bash
python test_scraper.py
```

### Test API
Use the Swagger UI (`/docs`) to test the `POST /api/auth/import-izly` endpoint with your Izly credentials.

## 📂 Project Structure

```
backend/
├── app/
│   ├── core/           # Configuration (Env vars)
│   ├── db/             # Database connection (Supabase)
│   ├── models/         # Pydantic Models
│   ├── routers/        # API Endpoints
│   ├── services/       # Business Logic (Scraper)
│   └── main.py         # App Entry Point
├── requirements.txt    # Python Dependencies
└── test_scraper.py     # Standalone Test Script
```
