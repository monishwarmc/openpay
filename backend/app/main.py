import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes import orders, payments

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Development convenience only. Use Alembic migrations before production.
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="OpenPay Simulator API",
    description="Development-only payment simulator. It does not process real payments.",
    version="0.1.0",
    lifespan=lifespan,
)

origins = [os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(orders.router)
app.include_router(payments.router)

@app.get("/health")
def health():
    return {"status": "ok", "mode": "SIMULATOR"}
