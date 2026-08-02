from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# ── Billing (unchanged) ─────────────────────────────────────────────────────

class ParseRequest(BaseModel):
    text: str


class ParseResponse(BaseModel):
    product: str
    quantity: float
    unit: str


class CalculateRequest(BaseModel):
    qty: float
    price: float


class CalculateResponse(BaseModel):
    subtotal: float


class BillItem(BaseModel):
    product: str
    qty: float
    unit: str
    price: float
    subtotal: float


class FinishRequest(BaseModel):
    items: List[BillItem]


class FinishResponse(BaseModel):
    total: float
    message: str = ""


# ── Khata API schemas ────────────────────────────────────────────────────────

class CustomerCreate(BaseModel):
    name: str
    phone: str


class TransactionOut(BaseModel):
    id: int
    type: str          # 'purchase' | 'payment'
    amount: float
    note: str
    items: List[BillItem]
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerOut(BaseModel):
    id: int
    name: str
    phone: str
    created_at: datetime
    transactions: List[TransactionOut] = []
    balance: float = 0.0

    class Config:
        from_attributes = True


class PurchaseCreate(BaseModel):
    items: List[BillItem]
    total: float


class PaymentCreate(BaseModel):
    amount: float
    note: str = ""
