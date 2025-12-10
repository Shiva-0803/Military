from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .models import Role, TransactionType

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[Role] = None

class UserBase(BaseModel):
    username: str
    role: Role
    baseId: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    createdAt: datetime
    
    class Config:
        orm_mode = True

class BaseBase(BaseModel):
    name: str
    location: str

class BaseCreate(BaseBase):
    pass

class BaseResponse(BaseBase):
    id: int
    createdAt: datetime
    
    class Config:
        orm_mode = True

class AssetTypeBase(BaseModel):
    name: str
    description: Optional[str] = None

class AssetTypeCreate(AssetTypeBase):
    pass

class AssetTypeResponse(AssetTypeBase):
    id: int
    
    class Config:
        orm_mode = True

class InventoryBase(BaseModel):
    baseId: int
    assetTypeId: int
    quantity: int

class InventoryResponse(InventoryBase):
    class Config:
        orm_mode = True

class TransactionBase(BaseModel):
    type: TransactionType
    quantity: int
    assetTypeId: int
    fromBaseId: Optional[int] = None
    toBaseId: Optional[int] = None
    recipient: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    date: datetime
    
    class Config:
        orm_mode = True
