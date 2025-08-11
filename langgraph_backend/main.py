
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from workflow import get_workflow_graph

load_dotenv()

app = FastAPI()


class Query(BaseModel):
    question: str
    userContext: Optional[Dict[str, Any]] = None


graph = get_workflow_graph()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/financial-advice")
async def financial_advice(query: Query):
    # Debug: Print received data
    print(f"[DEBUG] Question: {query.question}")
    print(f"[DEBUG] User context received: {query.userContext is not None}")
    if query.userContext:
        print(f"[DEBUG] User context keys: {list(query.userContext.keys())}")
    
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
        port=8000, 
        reload=True
    )