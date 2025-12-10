from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.TransactionResponse)
def create_transaction(
    tx: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # Logic to update inventory based on transaction type
    
    # helper to get or create inventory
    def get_or_create_inventory(base_id, asset_type_id):
        inv = db.query(models.Inventory).filter(
            models.Inventory.baseId == base_id,
            models.Inventory.assetTypeId == asset_type_id
        ).first()
        if not inv:
            inv = models.Inventory(baseId=base_id, assetTypeId=asset_type_id, quantity=0)
            db.add(inv)
        return inv

    if tx.type == models.TransactionType.PURCHASE:
        if not tx.toBaseId:
             raise HTTPException(status_code=400, detail="toBaseId required for PURCHASE")
        inv = get_or_create_inventory(tx.toBaseId, tx.assetTypeId)
        inv.quantity += tx.quantity

    elif tx.type == models.TransactionType.TRANSFER_IN or tx.type == models.TransactionType.TRANSFER_OUT:
        # Note: Front end should probably just send one "TRANSFER" type, but based on schema
        # We will assume TRANSFER represents moving from A to B
        if not tx.fromBaseId or not tx.toBaseId:
            raise HTTPException(status_code=400, detail="fromBaseId and toBaseId required for TRANSFER")
        
        src_inv = get_or_create_inventory(tx.fromBaseId, tx.assetTypeId)
        if src_inv.quantity < tx.quantity:
            raise HTTPException(status_code=400, detail="Insufficient inventory at source base")
        
        dst_inv = get_or_create_inventory(tx.toBaseId, tx.assetTypeId)
        
        src_inv.quantity -= tx.quantity
        dst_inv.quantity += tx.quantity

    elif tx.type in [models.TransactionType.ASSIGNMENT, models.TransactionType.EXPENDITURE]:
        if not tx.fromBaseId:
            raise HTTPException(status_code=400, detail="fromBaseId required for this transaction")
        
        src_inv = get_or_create_inventory(tx.fromBaseId, tx.assetTypeId)
        if src_inv.quantity < tx.quantity:
             raise HTTPException(status_code=400, detail="Insufficient inventory")
        
        src_inv.quantity -= tx.quantity

    # Create Transaction Record
    new_tx = models.Transaction(
        type=tx.type,
        quantity=tx.quantity,
        assetTypeId=tx.assetTypeId,
        fromBaseId=tx.fromBaseId,
        toBaseId=tx.toBaseId,
        recipient=tx.recipient
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx
