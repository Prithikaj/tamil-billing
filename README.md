# 🛒 Tamil Voice Billing Assistant

A mobile-first web app for **Shops** — speak item names in Tamil, get an instant bill, share it via WhatsApp, and manage customer credit accounts (Khata) backed by a PostgreSQL database.

---

## Features

### Billing Tab 🛒
- Tamil voice input using browser Speech Recognition (`ta-IN`)
- Speaks item name → AI parses product, quantity, unit
- Price dialog with live subtotal preview
- Editable bill table — tap any price to change it
- Delete items
- Running total shown on finish button
- WhatsApp share via `wa.me` deep link (no API key needed)
- Print-ready bill with store header, address, and date

### Khata Tab 📒 (Credit Ledger)
- Add credit customers with name and phone number
- Record purchases on credit using voice input
- Record payments — auto-deducted from balance
- Full transaction history per customer
- Balance shown in red (owes) / green (clear) / blue (overpaid)
- WhatsApp statement sent directly to customer's number
- Data stored in **PostgreSQL** — survives browser clears, works across devices

---

## Folder Structure

```
voice-billing/
├── backend/
│   ├── main.py          FastAPI app + all API routes
│   ├── models.py        SQLModel DB models (Customer, Transaction)
│   ├── database.py      DB engine setup (PostgreSQL / SQLite fallback)
│   ├── schemas.py       Pydantic request/response schemas
│   ├── parser.py        Tamil text → product/qty/unit (rule-based)
│   ├── bill.py          Bill text formatter
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── Root.jsx         Tab navigation (Billing / Khata)
        ├── App.jsx          Billing screen
        ├── index.css
        ├── hooks/
        │   └── useKhata.js  Khata state — calls backend API
        ├── pages/
        │   └── KhataPage.jsx
        └── components/
            ├── Bill.jsx
            ├── ItemCard.jsx
            ├── VoiceButton.jsx
            ├── PriceDialog.jsx
            └── khata/
                ├── CustomerList.jsx
                ├── CustomerDetail.jsx
                ├── AddCustomerDialog.jsx
                ├── PaymentDialog.jsx
                └── KhataBillEntry.jsx
```

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Local dev uses **SQLite** automatically (`billing.db`) — no database setup needed.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in **Chrome** (required for Speech Recognition).

---

## Environment Variables

### Backend — `.env` (copy from `.env.example`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string from Render | Production only |

Local dev automatically falls back to SQLite when `DATABASE_URL` is not set.

### Frontend — set in Vercel dashboard

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your Render backend URL, e.g. `https://tamil-billing.onrender.com` |

---

## Deployment

### Stack
| Part | Platform | Cost |
|------|----------|------|
| Backend (FastAPI) | Render Web Service | Free |
| Database (PostgreSQL) | Render PostgreSQL | Free |
| Frontend (React) | Vercel | Free |

### 1 — Backend on Render

1. Go to https://render.com → **New → Web Service**
2. Connect your GitHub repo
3. Settings:

| Field | Value |
|-------|-------|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Instance Type | Free |

### 2 — Database on Render

1. **New → PostgreSQL**
2. Name: `tamil-billing-db`, Region: Virginia, Plan: Free
3. After creation, copy the **Internal Database URL**
4. In your Web Service → **Environment** → add:
   - `DATABASE_URL` = (paste Internal Database URL)
5. Render auto-redeploys — tables are created automatically on first startup

### 3 — Frontend on Vercel

1. Go to https://vercel.com → **Add New → Project**
2. Import your GitHub repo
3. Settings:

| Field | Value |
|-------|-------|
| Root Directory | `frontend` |
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

4. **Environment Variables** → add:
   - `VITE_API_URL` = `https://tamil-billing.onrender.com`
5. Deploy

---

## API Reference

### Billing

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Health check |
| POST | `/parse` | Tamil text → `{ product, quantity, unit }` |
| POST | `/calculate` | `{ qty, price }` → `{ subtotal }` |
| POST | `/finish` | `{ items[] }` → `{ total }` |

### Khata (Credit Ledger)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/customers` | List all customers with balances |
| POST | `/customers` | Create customer `{ name, phone }` |
| GET | `/customers/{id}` | Get one customer with transactions |
| DELETE | `/customers/{id}` | Delete customer and all transactions |
| POST | `/customers/{id}/purchase` | Add purchase `{ items[], total }` |
| POST | `/customers/{id}/payment` | Add payment `{ amount, note }` |
| DELETE | `/customers/{id}/transactions/{tx_id}` | Delete a transaction |

---

## Tamil Voice Support

**Numbers recognised:**
ஒரு (1), இரண்டு (2), மூன்று (3), நான்கு (4), ஐந்து (5), ஆறு (6), ஏழு (7), எட்டு (8), ஒன்பது (9), பத்து (10), இருபது (20), நூறு (100), அரை (0.5), கால் (0.25)

**Units recognised:**
கிலோ → kg | கிராம் → g | லிட்டர் → litre | பாக்கெட் → packet | டின் → tin | பீஸ் → piece | பாட்டில் → bottle

**Example phrases:**
- `அரிசி இரண்டு கிலோ` → Rice, 2 kg
- `பால் மூன்று பாக்கெட்` → Milk, 3 packets
- `எண்ணெய் அரை லிட்டர்` → Oil, 0.5 litre

---

## Notes

- Voice recognition requires **Chrome** (desktop or Android). On iPhone use **Safari**.
- Render free tier sleeps after 15 min of inactivity — first request takes ~30s to wake. Use https://uptimerobot.com to keep it awake with a free ping every 5 minutes.
- The `/calculate` endpoint exists but subtotals are computed client-side for speed.
- WhatsApp sharing uses `wa.me` deep links — no Twilio or API keys needed.
- All data (customers, transactions) is stored in PostgreSQL. Billing (daily bills) is stateless — no data stored.
