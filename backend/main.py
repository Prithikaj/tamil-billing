"""
Tamil Voice Billing Assistant — FastAPI Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    ParseRequest, ParseResponse,
    CalculateRequest, CalculateResponse,
    FinishRequest, FinishResponse,
)
from parser import parse_tamil_text
from bill import format_bill_text

app = FastAPI(title="Tamil Voice Billing API", version="1.0.0")

# Allow the Vite dev server and the Vercel production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
        "https://tamil-billing.vercel.app"],
    allow_credentials=True,   # tighten this to your Vercel URL after first deploy
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "message": "Tamil Voice Billing API is running"}


@app.post("/parse", response_model=ParseResponse)
def parse_text(req: ParseRequest):
    """
    Parse Tamil speech text into structured product/quantity/unit.
    POST /parse
    Body: { "text": "அரிசி இரண்டு கிலோ" }
    """
    result = parse_tamil_text(req.text)
    return ParseResponse(**result)


@app.post("/calculate", response_model=CalculateResponse)
def calculate(req: CalculateRequest):
    """
    Calculate subtotal for a single item.
    POST /calculate
    Body: { "qty": 2, "price": 58 }
    """
    return CalculateResponse(subtotal=round(req.qty * req.price, 2))


@app.post("/finish", response_model=FinishResponse)
def finish_bill(req: FinishRequest):
    """
    Finalise the bill and compute total.
    WhatsApp sharing is handled on the frontend via wa.me — no credentials needed.
    POST /finish
    Body: { "items": [...] }
    """
    total = round(sum(item.subtotal for item in req.items), 2)
    bill_text = format_bill_text(req.items, total)
    return FinishResponse(total=total, message="Bill ready")
