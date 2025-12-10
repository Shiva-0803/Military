from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter()

@router.get("/types", response_model=List[schemas.AssetTypeResponse])
def get_asset_types(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return db.query(models.AssetType).all()

@router.post("/types", response_model=schemas.AssetTypeResponse)
def create_asset_type(
    asset_type: schemas.AssetTypeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    # Only Admin or Logistics can create types
    if current_user.role not in [models.Role.ADMIN, models.Role.LOGISTICS_OFFICER]:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    db_asset_type = models.AssetType(name=asset_type.name, description=asset_type.description)
    db.add(db_asset_type)
    db.commit()
    db.refresh(db_asset_type)
    return db_asset_type

@router.get("/inventory/{base_id}", response_model=List[schemas.InventoryResponse])
def get_base_inventory(
    base_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(dependencies.get_current_user)
):
    return db.query(models.Inventory).filter(models.Inventory.baseId == base_id).all()
