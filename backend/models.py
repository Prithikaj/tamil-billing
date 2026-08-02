"""
Database models — SQLModel tables for the Khata (credit ledger) feature.
"""

from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
import json


class Customer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    phone: str = Field(index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationship — one customer has many transactions
    transactions: List["Transaction"] = Relationship(back_populates="customer")


class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="customer.id", index=True)
    type: str  # 'purchase' | 'payment'
    amount: float
    note: str = ""
    items_json: str = Field(default="[]")  # JSON-serialised list of BillItems
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    customer: Optional[Customer] = Relationship(back_populates="transactions")

    @property
    def items(self):
        return json.loads(self.items_json)

    @items.setter
    def items(self, value):
        self.items_json = json.dumps(value)
