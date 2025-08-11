"""
Firebase Authentication Module for Backend Security
"""
import os
from functools import wraps
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Firebase Admin (when service account is available)
firebase_app = None
try:
    import firebase_admin
    from firebase_admin import credentials, auth
    
    # Check if service account key is provided
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
    
    if service_account_path and os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
        firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully")
    else:
        logger.warning("Firebase service account key not found. Authentication will be skipped in development.")
        
except ImportError:
    logger.warning("Firebase Admin SDK not available. Install with: pip install firebase-admin")
except Exception as e:
    logger.error(f"Failed to initialize Firebase Admin SDK: {e}")

# Security dependency
security = HTTPBearer(auto_error=False)

async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify Firebase ID token from Authorization header
    """
    if not firebase_app:
        # In development, skip authentication if Firebase is not configured
        if os.getenv("ENVIRONMENT") == "development":
            logger.info("Development mode: Skipping Firebase authentication")
            return {"uid": "dev-user", "email": "dev@example.com"}
        else:
            raise HTTPException(
                status_code=503,
                detail="Authentication service unavailable"
            )
    
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )
    
    try:
        # Verify the ID token
        decoded_token = auth.verify_id_token(credentials.credentials)
        user_id = decoded_token['uid']
        user_email = decoded_token.get('email', '')
        
        logger.info(f"Authenticated user: {user_id}")
        
        return {
            "uid": user_id,
            "email": user_email,
            "token_data": decoded_token
        }
        
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Token expired"
        )
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(
            status_code=401,
            detail="Authentication failed"
        )

async def optional_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Optional authentication - allows both authenticated and anonymous users
    """
    if not credentials:
        return None
    
    try:
        return await verify_firebase_token(credentials)
    except HTTPException:
        return None

def require_auth(f):
    """
    Decorator to require authentication for endpoints
    """
    @wraps(f)
    async def wrapper(*args, **kwargs):
        # Extract user from dependencies
        user = kwargs.get('current_user')
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Authentication required"
            )
        return await f(*args, **kwargs)
    return wrapper
