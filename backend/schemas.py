from pydantic import BaseModel
from typing import List


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
