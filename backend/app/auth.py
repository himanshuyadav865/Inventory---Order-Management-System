import os
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Mocking user for local testing without Firebase
    return {"uid": "mock-user-123", "email": "test@example.com"}
