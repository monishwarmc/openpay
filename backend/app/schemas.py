from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    customer_email: str = Field(min_length=5, max_length=255)
    description: str = Field(default="SaaS purchase", min_length=2, max_length=255)
    amount: int = Field(gt=0, le=10_000_000_00, description="Amount in paise")

class AttemptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    method: str
    status: str
    provider_reference: str
    created_at: datetime

class OrderOut(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_email: str
    description: str
    amount: int
    currency: str
    status: str
    environment: str
    created_at: datetime
    attempts: list[AttemptOut] = []

class SimulatePayment(BaseModel):
    method: str = Field(pattern="^(UPI|CARD|NETBANKING)$")
    outcome: str = Field(default="SUCCESS", pattern="^(SUCCESS|FAILED|PENDING)$")
