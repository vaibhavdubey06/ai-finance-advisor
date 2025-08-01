
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from workflow import get_workflow_graph

load_dotenv()

app = FastAPI()


class Query(BaseModel):
    question: str


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
    # Pass the question as expected by the workflow nodes
    state_dict = {"question": query.question}
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