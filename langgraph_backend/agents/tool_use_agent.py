
from tools.rag_tool import query_rag

def run_tool_use(state: dict) -> dict:
    """
    Executes the RAG tool to fetch relevant context for the question.
    """
    question = state.get("question", "")
    if not question or not question.strip():
        return {
            "question": question,
            "context": "",
            "output": "No question provided."
        }
    rag_context = query_rag(question)
    return {
        "question": question,
        "context": rag_context,
        "output": rag_context
    }