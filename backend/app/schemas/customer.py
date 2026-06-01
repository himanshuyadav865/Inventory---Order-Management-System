from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr

class CustomerBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=20)

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
