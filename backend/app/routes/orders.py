from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.auth import get_current_user
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderCreate, OrderResponse
from app.services.inventory import create_order_transaction

router = APIRouter(prefix="/orders", tags=["Orders"], dependencies=[Depends(get_current_user)])

def format_order_to_response(order: Order) -> dict:
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": order.customer.full_name if order.customer else "Unknown Customer",
        "total_amount": order.total_amount,
        "created_at": order.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "product_name": item.product.name if item.product else "Unknown Product",
                "product_sku": item.product.sku if item.product else "N/A"
            }
            for item in order.items
        ]
    }

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    # Run the transaction-safe order placement service
    new_order = create_order_transaction(db, order_data)
    
    # Reload with joined relationships to prevent lazy loading issues
    refreshed_order = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == new_order.id).first()
    
    return format_order_to_response(refreshed_order)

@router.get("", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    # Eagerly load customer and items to optimize database performance
    orders = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    ).order_by(Order.created_at.desc()).all()
    
    return [format_order_to_response(order) for order in orders]

@router.get("/{id}", response_model=OrderResponse)
def get_order(id: UUID, db: Session = Depends(get_db)):
    order = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {id} not found"
        )
    return format_order_to_response(order)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(id: UUID, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {id} not found"
        )
    
    # Optional: If you delete an order, do you want to restore the stock?
    # Usually in simple inventory systems deleting an order doesn't automatically restore stock
    # unless specified, but let's just delete the order and let cascade delete items.
    db.delete(order)
    db.commit()
    return None
