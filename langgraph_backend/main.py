
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from workflow import get_workflow_graph
from auth import verify_firebase_token, optional_auth
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load environment variables - check for production env first
if os.path.exists('.env.production'):
    load_dotenv('.env.production')
elif os.path.exists(os.path.join(os.path.dirname(__file__), '..', '.env')):
    load_dotenv(dotenv_path=os.path.join(
        os.path.dirname(__file__), '..', '.env'
    ))
else:
    load_dotenv()  # Load from current directory

# Get environment settings
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
PORT = int(os.getenv("PORT") or 8000)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="AI Finance Advisor API",
    version="1.0.0",
    docs_url="/docs" if ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if ENVIRONMENT != "production" else None
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


class Query(BaseModel):
    question: str
    userContext: Optional[Dict[str, Any]] = None


# Health check endpoint for deployment monitoring
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring services"""
    return {
        "status": "healthy",
        "environment": ENVIRONMENT,
        "version": "1.0.0"
    }


# Security: Add request validation
async def validate_request(query: Query):
    """Basic request validation and sanitization"""
    if not query.question or len(query.question.strip()) == 0:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    if len(query.question) > 2000:  # Limit question length
        raise HTTPException(status_code=400, detail="Question too long")
    
    return query


graph = get_workflow_graph()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev port
        "http://localhost:8080",  # Node.js server
        "https://ai-finance-advisor-oatv.vercel.app",  # Your Vercel deployment
        "https://*.vercel.app",  # All Vercel deployments
        "https://*.onrender.com"  # All Render services
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.post("/financial-advice")
@limiter.limit("10/minute")  # Allow 10 requests per minute per IP
async def financial_advice(
    request: Request,
    query: Query = Depends(validate_request),
    current_user: Optional[dict] = Depends(optional_auth)
):
    # Security: Log only non-sensitive metadata
    print("[DEBUG] Processing financial advice request")
    print(f"[DEBUG] User context provided: {query.userContext is not None}")
    print(f"[DEBUG] User authenticated: {current_user is not None}")
    if query.userContext:
        context_keys = list(query.userContext.keys())
        print(f"[DEBUG] Context sections: {len(context_keys)} sections")
    
    # Pass the question and user context to the workflow nodes
    state_dict = {
        "question": query.question,
        "userContext": query.userContext
    }
    results = []
    for step in graph.stream(state_dict):
        results.append(step)
    final = results[-1] if results else {}
    return {"intermediate": results, "final": final}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "langgraph_backend.main:app",
        host="0.0.0.0",
        port=PORT,
        reload=ENVIRONMENT != "production"
    )