"""
Tamil Voice Billing Assistant — FastAPI Backend
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
import json

from database import create_db_and_tables, get_session
from models import Customer, Transaction
from schemas import (
    ParseRequest, ParseResponse,
    CalculateRequest, CalculateResponse,
    FinishRequest, FinishResponse,
    CustomerCreate, CustomerOut, TransactionOut,
    PurchaseCreate, PaymentCreate,
)
from parser import parse_tamil_text
from bill import format_bill_text


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables on startup."""
    create_db_and_tables()
    yield


app = FastAPI(title="Tamil Voice Billing API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "Tamil Voice Billing API is running"}


# ── Billing (unchanged) ──────────────────────────────────────────────────────

@app.post("/parse", response_model=ParseResponse)
def parse_text(req: ParseRequest):
    result = parse_tamil_text(req.text)
    return ParseResponse(**result)


@app.post("/calculate", response_model=CalculateResponse)
def calculate(req: CalculateRequest):
    return CalculateResponse(subtotal=round(req.qty * req.price, 2))


@app.post("/finish", response_model=FinishResponse)
def finish_bill(req: FinishRequest):
    total = round(sum(item.subtotal for item in req.items), 2)
    format_bill_text(req.items, total)
    return FinishResponse(total=total, message="Bill ready")


# ── Khata — Customers ────────────────────────────────────────────────────────

def _customer_out(customer: Customer) -> CustomerOut:
    """Convert DB model to output schema with balance computed."""
    txs = []
    balance = 0.0
    for tx in customer.transactions:
        items = json.loads(tx.items_json) if tx.items_json else []
        txs.append(TransactionOut(
            id=tx.id,
            type=tx.type,
            amount=tx.amount,
            note=tx.note,
            items=items,
            created_at=tx.created_at,
        ))
        balance += tx.amount if tx.type == "purchase" else -tx.amount

    return CustomerOut(
        id=customer.id,
        name=customer.name,
        phone=customer.phone,
        created_at=customer.created_at,
        transactions=txs,
        balance=round(balance, 2),
    )


@app.get("/customers", response_model=list[CustomerOut])
def list_customers(session: Session = Depends(get_session)):
    customers = session.exec(select(Customer)).all()
    return [_customer_out(c) for c in customers]


@app.post("/customers", response_model=CustomerOut, status_code=201)
def create_customer(data: CustomerCreate, session: Session = Depends(get_session)):
    customer = Customer(name=data.name.strip(), phone=data.phone.strip())
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return _customer_out(customer)


@app.get("/customers/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, session: Session = Depends(get_session)):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return _customer_out(customer)


@app.delete("/customers/{customer_id}", status_code=204)
def delete_customer(customer_id: int, session: Session = Depends(get_session)):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    # Delete transactions first
    for tx in customer.transactions:
        session.delete(tx)
    session.delete(customer)
    session.commit()


# ── Khata — Transactions ─────────────────────────────────────────────────────

@app.post("/customers/{customer_id}/purchase", response_model=CustomerOut, status_code=201)
def add_purchase(
    customer_id: int,
    data: PurchaseCreate,
    session: Session = Depends(get_session),
):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    note = ", ".join(f"{it.product} x{it.qty}" for it in data.items)
    tx = Transaction(
        customer_id=customer_id,
        type="purchase",
        amount=round(data.total, 2),
        note=note,
        items_json=json.dumps([it.model_dump() for it in data.items]),
    )
    session.add(tx)
    session.commit()
    session.refresh(customer)
    return _customer_out(customer)


@app.post("/customers/{customer_id}/payment", response_model=CustomerOut, status_code=201)
def add_payment(
    customer_id: int,
    data: PaymentCreate,
    session: Session = Depends(get_session),
):
    customer = session.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    tx = Transaction(
        customer_id=customer_id,
        type="payment",
        amount=round(data.amount, 2),
        note=data.note or "Payment received",
        items_json="[]",
    )
    session.add(tx)
    session.commit()
    session.refresh(customer)
    return _customer_out(customer)


@app.delete("/customers/{customer_id}/transactions/{tx_id}", response_model=CustomerOut)
def delete_transaction(
    customer_id: int,
    tx_id: int,
    session: Session = Depends(get_session),
):
    tx = session.get(Transaction, tx_id)
    if not tx or tx.customer_id != customer_id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    session.delete(tx)
    session.commit()
    customer = session.get(Customer, customer_id)
    session.refresh(customer)
    return _customer_out(customer)
