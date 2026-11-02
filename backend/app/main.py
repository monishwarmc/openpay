import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import orders, payments


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="OpenPay Simulator API",
    description="Development-only payment simulator.",
    version="0.1.0",
    lifespan=lifespan,
)

origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGIN",
        "https://payrecilens.vercel.app"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(orders.router)
app.include_router(payments.router)


@app.get("/health")
def health():
    return {"status": "ok", "mode": "SIMULATOR"}