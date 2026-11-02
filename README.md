# OpenPay — Development Simulator

This is a local payment-flow simulator. It does **not** connect to UPI, card networks, banks, or move real money.

## Requirements
- Python 3.11+
- Node.js 20.9+
- Docker Engine + Docker Compose

## 1. Start PostgreSQL
From the project root:

```bash
docker compose up -d db
```

## 2. Start the backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend docs: http://localhost:8000/docs

## 3. Start the frontend
In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## 4. Test
1. Create an order on the dashboard.
2. Choose UPI, card, or net banking.
3. Select a simulated success, failure, or pending outcome.
4. Inspect the order and attempts in the dashboard or API docs.

Amounts are stored in paise. Example: ₹1,499 = 149900.

## Important
- Do not use this simulator for real payments.
- The demo has no merchant authentication, production secrets management, bank verification, refunds, or production-grade idempotency.
- Before live payments, implement the acquiring bank's approved API and webhook specifications, security controls, database migrations, monitoring, and legal/compliance review.
