from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class Role(str, enum.Enum):
    ADMIN = "ADMIN"
    BASE_COMMANDER = "BASE_COMMANDER"
    LOGISTICS_OFFICER = "LOGISTICS_OFFICER"

class TransactionType(str, enum.Enum):
    PURCHASE = "PURCHASE"
    TRANSFER_IN = "TRANSFER_IN"
    TRANSFER_OUT = "TRANSFER_OUT"
    ASSIGNMENT = "ASSIGNMENT"
    EXPENDITURE = "EXPENDITURE"

class BaseObj(Base):
    __tablename__ = "Base"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)
    location = Column(String(255))
    createdAt = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="base")
    inventory = relationship("Inventory", back_populates="base")
    snapshots = relationship("InventorySnapshot", back_populates="base")
    
    outgoing_transfers = relationship("Transaction", foreign_keys="[Transaction.fromBaseId]", back_populates="fromBase")
    incoming_transfers = relationship("Transaction", foreign_keys="[Transaction.toBaseId]", back_populates="toBase")

class User(Base):
    __tablename__ = "User"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    role = Column(Enum(Role))
    baseId = Column(Integer, ForeignKey("Base.id"), nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

    base = relationship("BaseObj", back_populates="users")

class AssetType(Base):
    __tablename__ = "AssetType"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)
    description = Column(String(255), nullable=True)

    inventory = relationship("Inventory", back_populates="assetType")
    snapshots = relationship("InventorySnapshot", back_populates="assetType")
    transactions = relationship("Transaction", back_populates="assetType")

class Inventory(Base):
    __tablename__ = "Inventory"

    baseId = Column(Integer, ForeignKey("Base.id"), primary_key=True)
    assetTypeId = Column(Integer, ForeignKey("AssetType.id"), primary_key=True)
    quantity = Column(Integer, default=0)

    base = relationship("BaseObj", back_populates="inventory")
    assetType = relationship("AssetType", back_populates="inventory")

class InventorySnapshot(Base):
    __tablename__ = "InventorySnapshot"

    id = Column(Integer, primary_key=True, index=True)
    baseId = Column(Integer, ForeignKey("Base.id"))
    assetTypeId = Column(Integer, ForeignKey("AssetType.id"))
    quantity = Column(Integer)
    date = Column(DateTime, default=datetime.utcnow)

    base = relationship("BaseObj", back_populates="snapshots")
    assetType = relationship("AssetType", back_populates="snapshots")

class Transaction(Base):
    __tablename__ = "Transaction"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(TransactionType))
    quantity = Column(Integer)
    date = Column(DateTime, default=datetime.utcnow)
    
    assetTypeId = Column(Integer, ForeignKey("AssetType.id"))
    fromBaseId = Column(Integer, ForeignKey("Base.id"), nullable=True)
    toBaseId = Column(Integer, ForeignKey("Base.id"), nullable=True)
    recipient = Column(String(255), nullable=True)

    assetType = relationship("AssetType", back_populates="transactions")
    fromBase = relationship("BaseObj", foreign_keys=[fromBaseId], back_populates="outgoing_transfers")
    toBase = relationship("BaseObj", foreign_keys=[toBaseId], back_populates="incoming_transfers")
