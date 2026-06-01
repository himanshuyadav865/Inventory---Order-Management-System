from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.schemas.order import OrderCreate

def create_order_transaction(db: Session, order_data: OrderCreate) -> Order:
    # 1. Verify customer exists
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order_data.customer_id} not found"
        )
    
    # 2. Check for duplicate products in items (input validation)
    product_ids = [item.product_id for item in order_data.items]
    if len(product_ids) != len(set(product_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate products found in the order list. Combine the quantities instead."
        )

    total_amount = 0
    order_items = []
    
    # 3. Process each item
    for item in order_data.items:
        # Verify product exists (using with_for_update to lock the row and prevent race conditions)
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found"
            )
        
        # Verify stock availability
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                    f"Requested: {item.quantity}, Available: {product.stock_quantity}"
                )
            )
        
        # Calculate total amount
        item_total = product.price * item.quantity
        total_amount += item_total
        
        # Deduct stock
        product.stock_quantity -= item.quantity
        
        # Build OrderItem object
        order_item = OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price
        )
        order_items.append(order_item)
    
    # 4. Create order
    new_order = Order(
        customer_id=order_data.customer_id,
        total_amount=total_amount,
        items=order_items
    )
    
    db.add(new_order)
    
    try:
        db.commit()
        db.refresh(new_order)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete the order due to database error: {str(e)}"
        )
        
    return new_order
