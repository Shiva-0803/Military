from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, assets, transactions, dashboard
from .database import engine, Base

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Military Asset Manager")

# CORS
origins = ["*"]  # Configure appropriately for production

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(assets.router, prefix="/api/assets", tags=["assets"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
