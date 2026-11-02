import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from ..database import get_db
from ..models import PaymentOrder
from ..schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("", response_model=OrderOut, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    order = PaymentOrder(
        order_number=f"op_{secrets.token_hex(6)}",
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        description=payload.description,
        amount=payload.amount,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db)):
    stmt = select(PaymentOrder).options(selectinload(PaymentOrder.attempts)).order_by(PaymentOrder.id.desc())
    return db.scalars(stmt).all()

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    stmt = select(PaymentOrder).options(selectinload(PaymentOrder.attempts)).where(PaymentOrder.id == order_id)
    order = db.scalar(stmt)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
