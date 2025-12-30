from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, user, market, trade
from app.core.config import settings

app = FastAPI(
    title="Izly Trading API",
    description="Backend for Izly marketplace trading system",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/api/users", tags=["Users"])
app.include_router(market.router, prefix="/api/market", tags=["Market"])
app.include_router(trade.router, prefix="/api/trade", tags=["Trading"])

@app.get("/")
def read_root():
    return {
        "message": "Izly Trading API",
        "version": "2.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
