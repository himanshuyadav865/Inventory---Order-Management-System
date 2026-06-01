from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.auth import get_current_user
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(prefix="/products", tags=["Products"], dependencies=[Depends(get_current_user)])

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    # Check for SKU uniqueness
    existing_product = db.query(Product).filter(Product.sku == product_data.sku).first()
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product_data.sku}' already exists"
        )
    
    new_product = Product(
        name=product_data.name,
        sku=product_data.sku,
        price=product_data.price,
        stock_quantity=product_data.stock_quantity
    )
    
    db.add(new_product)
    try:
        db.commit()
        db.refresh(new_product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity error: Product could not be created. Ensure SKU is unique."
        )
    return new_product

@router.get("", response_model=List[ProductResponse])
def get_products(
    search: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_filter)) | 
            (Product.sku.ilike(search_filter))
        )
    # Order by created_at descending by default
    return query.order_by(Product.created_at.desc()).all()

@router.get("/{id}", response_model=ProductResponse)
def get_product(id: UUID, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {id} not found"
        )
    return product

@router.put("/{id}", response_model=ProductResponse)
def update_product(
    id: UUID, 
    product_data: ProductUpdate, 
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {id} not found"
        )
    
    # Check SKU uniqueness if it's being updated
    if product_data.sku is not None and product_data.sku != product.sku:
        existing_product = db.query(Product).filter(Product.sku == product_data.sku).first()
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{product_data.sku}' already exists"
            )
    
    # Update fields
    update_data = product_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
        
    try:
        db.commit()
        db.refresh(product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update product due to uniqueness constraint violation."
        )
    return product

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(id: UUID, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {id} not found"
        )
    
    # Check if product is in any order items to prevent database foreign key constraint violation
    # Instead of raw crash, handle gracefully
    from app.models.order_item import OrderItem
    has_orders = db.query(OrderItem).filter(OrderItem.product_id == id).first()
    if has_orders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product because it is referenced in one or more orders."
        )
        
    db.delete(product)
    db.commit()
    return None
