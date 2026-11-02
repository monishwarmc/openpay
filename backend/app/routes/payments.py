import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from ..database import get_db
from ..models import PaymentOrder, PaymentAttempt
from ..schemas import SimulatePayment, OrderOut

router = APIRouter(prefix="/api/payments", tags=["simulated payments"])

@router.post("/{order_id}/simulate", response_model=OrderOut)
def simulate_payment(order_id: int, payload: SimulatePayment, db: Session = Depends(get_db)):
    stmt = select(PaymentOrder).options(selectinload(PaymentOrder.attempts)).where(PaymentOrder.id == order_id)
    order = db.scalar(stmt)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == "SUCCESS":
        raise HTTPException(status_code=409, detail="This order is already paid")

    status = payload.outcome
    attempt = PaymentAttempt(
        order_id=order.id,
        method=payload.method,
        status=status,
        provider_reference=f"sim_{secrets.token_hex(8)}",
        simulator_outcome=status,
        event_data={"notice": "SIMULATED EVENT — no real funds moved"},
    )
    db.add(attempt)
    order.status = status
    db.commit()

    stmt = select(PaymentOrder).options(selectinload(PaymentOrder.attempts)).where(PaymentOrder.id == order_id)
    return db.scalar(stmt)
