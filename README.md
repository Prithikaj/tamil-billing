# 🛒 Tamil Voice Billing Assistant

A mobile-friendly web app for small shops — speak item names in Tamil, get an instant bill, and optionally send it to the customer's WhatsApp.

---

## Folder Structure

```
voice-billing/
├── backend/
│   ├── main.py          FastAPI app
│   ├── schemas.py       Pydantic models
│   ├── parser.py        Tamil text → product/qty/unit
│   ├── bill.py          Bill formatting + WhatsApp send
│   ├── requirements.txt
│   └── .env.example     Twilio credentials template
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        └── components/
            ├── Bill.jsx
            ├── ItemCard.jsx
            ├── VoiceButton.jsx
            └── PriceDialog.jsx
```

---

## Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

**Optional — WhatsApp (Twilio):**
```bash
copy .env.example .env
# Fill in TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
```

Start the API server:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in Chrome on your phone or desktop.

---

## How to Use

1. Tap **🎤 பேசுங்கள்** and speak an item in Tamil  
   Example: *"அரிசி இரண்டு கிலோ"*
2. The app recognises the item and asks for the **price per unit**
3. Type the price and tap **சேர்** — it calculates the subtotal automatically
4. Repeat for each item
5. Optionally enter the customer's **10-digit mobile number** for WhatsApp delivery
6. Tap **✅ பில் முடி** to see the final bill and send it

---

## WhatsApp Setup (Twilio — Free Sandbox)

1. Sign up at https://www.twilio.com/try-twilio (free)
2. Go to **Messaging → Try it out → Send a WhatsApp message**
3. Follow the sandbox join instructions on the customer's phone (one-time)
4. Copy your Account SID and Auth Token into `.env`
5. The default `TWILIO_WHATSAPP_FROM` sandbox number is `whatsapp:+14155238886`

The customer must first join the sandbox by sending  
`join <your-sandbox-keyword>` to **+14155238886** on WhatsApp — only once.

For production (no sandbox), upgrade to a paid Twilio number with WhatsApp Business API approval.

---

## Supported Tamil Numbers

ஒரு, இரண்டு, மூன்று, நான்கு, ஐந்து, ஆறு, ஏழு, எட்டு, ஒன்பது, பத்து, இருபது, முப்பது, நூறு, அரை (0.5), கால் (0.25)

## Supported Tamil Units

கிலோ → kg | கிராம் → g | லிட்டர் → litre | பாக்கெட் → packet | டின் → tin | பீஸ் → piece | பாட்டில் → bottle

---

## Version 2 Ideas

- Whisper AI for better Tamil accuracy
- PDF bill generation
- PWA / offline support
- Product price memory (localStorage)
