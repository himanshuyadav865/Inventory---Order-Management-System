from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field

class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    customer_id: UUID
    items: List[OrderItemCreate] = Field(..., min_length=1)

class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    unit_price: Decimal
    product_name: Optional[str] = None
    product_sku: Optional[str] = None

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v)
        }

class OrderResponse(BaseModel):
    id: UUID
    customer_id: UUID
    total_amount: Decimal
    created_at: datetime
    items: List[OrderItemResponse]
    customer_name: Optional[str] = None

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v)
        }
