from langgraph.graph import StateGraph, END
from langgraph_backend.agents.planner_agent import run_planner
from langgraph_backend.agents.tool_use_agent import run_tool_use
from typing import Dict, Any, Literal

def get_graph():
    # Create a new graph with a state that has 'next_step' key
    workflow = StateGraph(dict)
    
    # Add nodes
    workflow.add_node("planner", run_planner)
    workflow.add_node("tool_use", run_tool_use)
    
    # Set the entry point
    workflow.set_entry_point("planner")
    
    # Define the edges - always go back to planner after tool use
    workflow.add_edge("tool_use", "planner")
    
    # Define all possible actions and their routing
    FINANCIAL_ACTIONS = {
        # Knowledge-based actions
        "use_rag": "tool_use",
        
        # Calculation actions
        "calculate_emi": "tool_use",
        "calculate_roi": "tool_use",
        
        # Planning actions
        "set_goal": "tool_use",
        "analyze_portfolio": "tool_use",
        
        # Error handling
        "unknown_action": "tool_use",
    }
    
    def route_after_planner(state: Dict[str, Any]) -> str:
        """Route to the appropriate node based on the next_step in state."""
        next_step = state.get("next_step", "use_rag").lower()
        return FINANCIAL_ACTIONS.get(next_step, "tool_use")
    
    # Add conditional edges from planner
    workflow.add_conditional_edges(
        "planner",
        route_after_planner,
        FINANCIAL_ACTIONS
    )
    
    def should_end(state: Dict[str, Any]) -> Literal[True, False]:
        """Determine if the workflow should end."""
        # End if end=True or if there's an error
        return state.get("end", False) or "error" in state
    
    # Set the finish point
    workflow.add_conditional_edges(
        "planner",
        should_end,
        {
            True: END,  # End the graph
            False: "tool_use"  # Continue to tool use
        }
    )
    
    # Compile the workflow
    return workflow.compile()