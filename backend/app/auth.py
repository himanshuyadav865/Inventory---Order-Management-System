import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin App
firebase_app = None
project_id = os.getenv("FIREBASE_PROJECT_ID")

if project_id:
    try:
        # Initialize with project ID. This is sufficient for token verification without a full service account JSON.
        cred = credentials.ApplicationDefault()
        firebase_app = firebase_admin.initialize_app(options={'projectId': project_id})
    except ValueError:
        # App already initialized
        firebase_app = firebase_admin.get_app()
else:
    print("WARNING: FIREBASE_PROJECT_ID is not set. Auth verification will fail.")

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not firebase_app:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase Admin not initialized properly (Missing FIREBASE_PROJECT_ID)."
        )

    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
