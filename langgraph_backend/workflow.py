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
    user_context = state.get("userContext", {})
    
    # Import AI model to generate proper response
    import os
    import google.generativeai as genai
    
    # Configure Google AI
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Prepare user financial data summary for the AI
    user_data_summary = ""
    if user_context and isinstance(user_context, dict):
        user_profile = user_context.get("userProfile", {})
        detailed_profile = user_context.get("detailedProfile", {})
        transactions = user_context.get("transactions", [])
        holdings = user_context.get("holdings", [])
        monthly_data = user_context.get("monthlyData", [])
        
        if user_profile or detailed_profile:
            user_data_summary = "\n\nUser's Financial Profile:\n"
            
            # Basic profile info
            if user_profile:
                user_data_summary += f"- Age: {user_profile.get('age', 'Not specified')}\n"
                user_data_summary += f"- Income: ${user_profile.get('income', 'Not specified')}\n"
                user_data_summary += f"- Occupation: {user_profile.get('occupation', 'Not specified')}\n"
            
            # Detailed profile info
            if detailed_profile:
                user_data_summary += f"- Employment Status: {detailed_profile.get('employmentStatus', 'Not specified')}\n"
                user_data_summary += f"- Financial Goals: {detailed_profile.get('financialGoals', 'Not specified')}\n"
                user_data_summary += f"- Risk Tolerance: {detailed_profile.get('riskTolerance', 'Not specified')}\n"
                user_data_summary += f"- Investment Experience: {detailed_profile.get('investmentExperience', 'Not specified')}\n"
                
                if detailed_profile.get('currentDebt'):
                    user_data_summary += f"- Current Debt: ${detailed_profile.get('currentDebt')}\n"
                if detailed_profile.get('emergencyFund'):
                    user_data_summary += f"- Emergency Fund: ${detailed_profile.get('emergencyFund')}\n"
                if detailed_profile.get('retirementSavings'):
                    user_data_summary += f"- Retirement Savings: ${detailed_profile.get('retirementSavings')}\n"
            
            # Transaction summary
            if transactions and len(transactions) > 0:
                total_income = sum(t.get('amount', 0) for t in transactions if t.get('type') == 'income')
                total_expenses = sum(t.get('amount', 0) for t in transactions if t.get('type') == 'expense')
                user_data_summary += f"- Recent Income: ${total_income}\n"
                user_data_summary += f"- Recent Expenses: ${total_expenses}\n"
            
            # Holdings summary
            if holdings and len(holdings) > 0:
                total_value = sum(h.get('value', 0) for h in holdings)
                user_data_summary += f"- Total Investment Holdings: ${total_value}\n"
                user_data_summary += f"- Number of Holdings: {len(holdings)}\n"
    
    # Generate enhanced response using RAG context
    if rag_context and len(rag_context) > 100:
        # Create a prompt for the AI to analyze the content and provide a user-friendly response
        prompt = f"""You are a helpful financial advisor AI. A user has asked: "{question}"

I've found the following relevant financial information from reliable sources:
{rag_context}{user_data_summary}

Please provide a clear, helpful, and user-friendly response to the user's question. Your response should:
1. Directly answer their question
2. Be conversational and easy to understand
3. Include specific actionable advice when appropriate
4. Be concise but comprehensive (aim for 200-400 words)
5. Use bullet points or numbered lists when helpful
6. Avoid technical jargon unless necessary
7. IMPORTANT: If user financial data is provided, personalize your advice based on their specific situation, income, goals, and risk tolerance

Do not include source URLs, scraped dates, or technical metadata in your response. Focus on being helpful and educational."""

        try:
            # Generate response using AI
            ai_response = model.generate_content(prompt)
            response = ai_response.text if ai_response.text else "I apologize, but I couldn't generate a proper response at this time. Please try rephrasing your question."
        except Exception as e:
            print(f"Error generating AI response: {e}")
            # Fallback to a structured response based on question type
            if "investment" in question.lower() or "invest" in question.lower():
                response = """Here are some excellent investment strategies for beginners:

**1. Start with Index Funds**
- Low fees and instant diversification
- Track market performance automatically
- Good for long-term growth

**2. Use Dollar-Cost Averaging**
- Invest a fixed amount regularly
- Reduces impact of market volatility
- Builds discipline and consistency

**3. Consider Target-Date Funds**
- Automatically adjusts risk as you age
- Professional management included
- Perfect "set it and forget it" option

**4. Employer 401(k) Plans**
- Take advantage of company matching
- Tax benefits and automatic contributions
- Often the best place to start

**5. Emergency Fund First**
- Save 3-6 months of expenses
- Keep in high-yield savings account
- Provides financial security before investing

Remember: start early, stay consistent, and focus on low-cost, diversified options. Time in the market beats timing the market!"""
            else:
                response = f"For your question about '{question}', I recommend starting with the fundamentals of personal finance. Consider building an emergency fund, paying off high-interest debt, and then exploring investment options that match your risk tolerance and time horizon."
    else:
        # Fallback response when no context is available
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
