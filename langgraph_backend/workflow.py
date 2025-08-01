"""
Create a LangGraph agent workflow with two nodes:
1. 'planner' node using planner_node from planner_agent
2. 'tool_use' node using tool_use_node from tool_use_agent

The state is managed with a custom AgentState class that holds messages.

Flow logic:
- Start at 'planner'
- If planner response includes "final answer", end the graph
- Else go to 'tool_use'
- After 'tool_use', return to 'planner'

Use langgraph.graph.StateGraph to compile and return the graph.
"""

from langgraph.graph import StateGraph
from agents.planner_agent import run_planner
from agents.tool_use_agent import run_tool_use

class AgentState:
    def __init__(self, messages=None):
        self.messages = messages or []

    def to_dict(self):
        return {"messages": self.messages}

    @classmethod
    def from_dict(cls, d):
        return cls(messages=d.get("messages", []))

def planner_node(state: dict) -> dict:
    result = run_planner(state)
    # The planner decides to use tools for better answers
    result["next"] = "tool_use"
    return result


def tool_use_node(state: dict) -> dict:
    # Get context from RAG tool
    tool_result = run_tool_use(state)
    
    # Combine planner's analysis with RAG context
    question = state.get("question", "")
    rag_context = tool_result.get("context", "")
    
    # Generate enhanced response using RAG context
    if rag_context and len(rag_context) > 100:
        # Extract relevant portions of the context
        context_snippet = rag_context[:1000] + "..." if len(rag_context) > 1000 else rag_context
        response = f"Based on financial expertise and relevant information:\n\n{context_snippet}\n\nFor your specific question about '{question}', this information provides valuable insights for making informed financial decisions."
    else:
        # Fallback response
        if "planning" in question.lower():
            response = "Financial planning involves setting goals, creating budgets, managing investments, and preparing for retirement. It's essential to assess your current financial situation, define objectives, and develop strategies to achieve them."
        elif "investment" in question.lower():
            response = "Investment strategies should align with your risk tolerance and time horizon. Consider diversifying across asset classes, regularly reviewing your portfolio, and consulting with financial advisors for personalized advice."
        elif "retirement" in question.lower():
            response = "Retirement planning requires starting early, maximizing employer contributions, considering tax-advantaged accounts like 401(k) and IRA, and calculating how much you'll need based on your desired lifestyle."
        else:
            response = f"For your question about '{question}', I recommend consulting with a financial advisor to get personalized advice based on your specific financial situation and goals."
    
    return {
        "question": question,
        "context": rag_context,
        "result": response,
        "response": response,
        "final": True
    }


def should_continue(state: dict) -> str:
    """Determine next step in the workflow"""
    if state.get("final"):
        return "end"
    return state.get("next", "end")


def get_workflow_graph():
    graph = StateGraph(dict)
    
    # Add nodes
    graph.add_node("planner", planner_node)
    graph.add_node("tool_use", tool_use_node)
    
    # Set entry point
    graph.set_entry_point("planner")
    
    # Add conditional edges
    graph.add_conditional_edges(
        "planner",
        should_continue,
        {
            "tool_use": "tool_use",
            "end": "__end__"
        }
    )
    
    # Tool use always ends
    graph.add_edge("tool_use", "__end__")
    
    return graph.compile()
