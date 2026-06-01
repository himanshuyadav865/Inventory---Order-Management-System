from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.auth import get_current_user
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerResponse

router = APIRouter(prefix="/customers", tags=["Customers"], dependencies=[Depends(get_current_user)])

@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer_data: CustomerCreate, db: Session = Depends(get_db)):
    # Check email uniqueness
    existing_customer = db.query(Customer).filter(Customer.email == customer_data.email).first()
    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with email '{customer_data.email}' already exists"
        )
    
    new_customer = Customer(
        full_name=customer_data.full_name,
        email=customer_data.email,
        phone=customer_data.phone
    )
    db.add(new_customer)
    try:
        db.commit()
        db.refresh(new_customer)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity error: Customer could not be created. Ensure email is unique."
        )
    return new_customer

@router.get("", response_model=List[CustomerResponse])
def get_customers(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Customer)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Customer.full_name.ilike(search_filter)) |
            (Customer.email.ilike(search_filter)) |
            (Customer.phone.ilike(search_filter))
        )
    return query.order_by(Customer.created_at.desc()).all()

@router.get("/{id}", response_model=CustomerResponse)
def get_customer(id: UUID, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {id} not found"
        )
    return customer

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(id: UUID, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {id} not found"
        )
        
    db.delete(customer)
    db.commit()
    return None
