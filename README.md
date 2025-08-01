#  AI Finance Advisor

An intelligent financial advisor application powered by **LangGraph multi-agent architecture** with **RAG (Retrieval-Augmented Generation)** capabilities. Get personalized financial advice backed by real-time data and comprehensive financial knowledge.

##  Features

###  **Multi-Agent AI Architecture**
- **Planner Agent**: Analyzes financial queries and determines optimal response strategy
- **Tool-Use Agent**: Executes specialized financial tools and knowledge retrieval
- **Dynamic Routing**: Automatically routes simple vs complex questions to appropriate agents

###  **RAG Knowledge System**
- **Vector Database**: FAISS-powered similarity search
- **Financial Knowledge Base**: Curated Investopedia articles covering:
  - Mutual Funds & Investment Strategies
  - Compound Interest & Financial Modeling
  - Retirement Planning & Analysis
- **Real-time Retrieval**: Context-aware document extraction for accurate responses

###  **Intelligent Features**
- **Personalized Advice**: Tailored recommendations based on user profile
- **Investment Tracking**: Portfolio management and performance analysis
- **Financial Planning**: Goal-setting and progress monitoring
- **Interactive Charts**: Data visualization with Recharts
- **Secure Authentication**: Firebase-powered user management

##  **Architecture**

```
Frontend (React + Vite)
    
Node.js API Gateway (Express)
    
Python LangGraph Backend (FastAPI)
    
Multi-Agent Workflow
     Planner Agent (Query Analysis)
     Tool-Use Agent (RAG + Execution)
         
    Knowledge Base (FAISS + Embeddings)
```

##  **Quick Start**

### Prerequisites
- **Node.js**  18.0.0
- **Python**  3.9.0
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/vaibhavdubey06/ai-finance-advisor.git
cd ai-finance-advisor
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Add your API keys to .env:
# GOOGLE_API_KEY=your_google_api_key_here
# FIREBASE_API_KEY=your_firebase_key_here
# (see .env.example for all required variables)
```

### 3. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Backend Setup
```bash
# Install Python dependencies
npm run python:install
# Or manually: cd langgraph_backend && pip install -r requirements.txt

# Start Python backend
npm run python:start
# Or manually: cd langgraph_backend && python main.py
```

### 5. API Gateway Setup
```bash
# In a new terminal, start Node.js API server
npm start
```

### 6. Full Development Mode
```bash
# Run all services concurrently
npm run dev:full
```

##  **Access Points**

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3001
- **Python Backend**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

##  **Project Structure**

```
ai-finance-advisor/
  src/                     # React frontend
     components/          # Reusable UI components
     assets/              # Images and static files
     utils/               # Utility functions
    App.jsx                 # Main application component
    main.jsx                # Application entry point
    ...
  langgraph_backend/       # Python AI backend
     agents/              # AI agent implementations
       planner_agent.py    # Query planning agent
       tool_use_agent.py   # Tool execution agent
     tools/               # AI tools and utilities
       rag_tool.py         # RAG implementation
       ingest_docs.py      # Document processing
     graph/               # LangGraph workflow
       graph.py            # Multi-agent orchestration
     data/                # Knowledge base
       articles/           # Financial articles
    main.py                 # FastAPI server
    requirements.txt        # Python dependencies
  public/                  # Static assets
 server.js                   # Node.js API gateway
 package.json                # Node.js dependencies
 README.md                   # This file
```

##  **Configuration**

### Environment Variables (.env)
```env
# Google AI
GOOGLE_API_KEY=your_google_gemini_api_key

# Firebase
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id

# Server Configuration
NODE_ENV=development
PORT=3001
PYTHON_PORT=8000
```

##  **Development**

### Adding New Financial Knowledge
1. Add articles to `langgraph_backend/data/articles/`
2. Run document ingestion: `python langgraph_backend/tools/ingest_docs.py`
3. Articles are automatically indexed for RAG retrieval

### Creating Custom Agents
1. Implement new agent in `langgraph_backend/agents/`
2. Add agent to workflow in `langgraph_backend/graph/graph.py`
3. Update routing logic as needed

### API Integration
- **Frontend  Node.js**: RESTful API calls
- **Node.js  Python**: HTTP requests to FastAPI
- **Python**: LangGraph multi-agent workflow execution

##  **Testing**

```bash
# Frontend testing
npm run lint

# Backend testing
cd langgraph_backend
python -m pytest

# Integration testing
node test_integration.js
```

##  **Features in Detail**

### **AI Financial Advisor**
- **Smart Query Processing**: Automatically determines question complexity
- **Contextual Responses**: RAG-powered answers with source attribution
- **Multi-modal Support**: Text analysis with future image/document support

### **Portfolio Management**
- **Real-time Tracking**: Investment performance monitoring
- **Risk Analysis**: Portfolio diversification recommendations
- **Goal Tracking**: Financial target progress visualization

### **Educational Resources**
- **Interactive Learning**: Embedded financial education
- **Market Insights**: Current market analysis and trends
- **Planning Tools**: Retirement and investment calculators

##  **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  **Acknowledgments**

- **LangChain/LangGraph**: Multi-agent framework
- **Google Gemini**: AI model for embeddings and generation
- **Investopedia**: Financial knowledge source
- **React & Vite**: Frontend framework and build tool
- **FastAPI**: Python backend framework

##  **Support**

For questions and support:
-  Email: your.email@example.com
-  Issues: [GitHub Issues](https://github.com/vaibhavdubey06/ai-finance-advisor/issues)
-  Discussions: [GitHub Discussions](https://github.com/vaibhavdubey06/ai-finance-advisor/discussions)

---

**Made with  for smarter financial planning**
