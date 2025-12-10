from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    total_assets = db.query(func.sum(models.Inventory.quantity)).scalar() or 0
    total_value = 0 # Placeholder if we had value
    low_stock_items = db.query(models.Inventory).filter(models.Inventory.quantity < 10).count()
    
    recent_transactions = db.query(models.Transaction).order_by(models.Transaction.date.desc()).limit(5).all()
    
    return {
        "totalAssets": total_assets,
        "lowStockItems": low_stock_items,
        "recentTransactions": recent_transactions
    }
