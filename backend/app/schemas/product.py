from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, field_validator

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=3, max_length=50)
    price: Decimal = Field(..., gt=0, decimal_places=2)
    stock_quantity: int = Field(default=0, ge=0)

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, v: str) -> str:
        # Strip and validate SKU format (uppercase alphanumeric, hyphens, underscores)
        cleaned = v.strip().upper()
        if not cleaned:
            raise ValueError("SKU cannot be empty")
        return cleaned

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=3, max_length=50)
    price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    stock_quantity: Optional[int] = Field(None, ge=0)

    @field_validator("sku")
    @classmethod
    def validate_sku(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        cleaned = v.strip().upper()
        if not cleaned:
            raise ValueError("SKU cannot be empty")
        return cleaned

class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v)
        }
