def run_planner(state: dict) -> dict:
    """
    Accepts a 'question' as input and returns a plan, next_step, and end=True to stop the graph after one cycle.
    Always includes 'question' in the returned state.
    """
    question = state.get("question", "")
    return {
        "question": question,
        "plan": f"Determine financial action for: {question}",
        "next_step": "tool_use",
        "end": True  # Important: this stops the graph to prevent infinite recursion
    }