import express from 'express';
import cors from 'cors';
import basicChatRoute from './routes/basicChat.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Security Middleware
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
});

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',  // Alternative dev port
    // Add your production domain here when deploying
    // 'https://yourdomain.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Financial advisor endpoint - connects to Python LangGraph backend
app.post('/api/advisor', async (req, res) => {
  const { prompt, userProfile, transactions, holdings, monthlyData, detailedProfile } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  try {
    // Security: Log only non-sensitive metadata
    console.log('[Advisor] Processing financial advice request');
    console.log('[Advisor] Request metadata:', {
      hasProfile: !!userProfile,
      hasDetailedProfile: !!detailedProfile,
      transactionCount: transactions?.length || 0,
      holdingsCount: holdings?.length || 0,
      monthlyDataCount: monthlyData?.length || 0
    });
    
    // Prepare comprehensive user context for deep analysis
    const userContext = {
      userProfile,
      transactions,
      holdings,
      monthlyData,
      detailedProfile
    };
    
    // Call Python LangGraph backend with user context
    const response = await fetch('http://localhost:8000/financial-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: prompt,
        userContext: userContext
      })
    });
    
    if (!response.ok) {
      throw new Error(`Python backend error: ${response.status}`);
    }
    
    const data = await response.json();
    // Security: Log only response status, not user data
    console.log('[Advisor] Backend response received successfully');
    
    // Extract the final result from the LangGraph workflow - Python backend now handles proper formatting
    const data_final = data.final || {};
    const tool_use = data_final.tool_use || {};
    
    // Get the AI-generated response directly from the Python backend
    const result = tool_use.response || tool_use.result || 
                   "I'm here to help with your financial questions. Could you please provide more specific details about what you'd like assistance with?";
    
    // Extract any structured data for charts/visualizations
    const structuredData = tool_use.structuredData || data_final.structuredData || null;
    
    res.json({
      response: result,
      reasoning: data_final.reasoning || "Analysis completed using financial knowledge base",
      structuredData: structuredData,
      timestamp: new Date().toISOString(),
      source: 'langgraph-agent'
    });
    
  } catch (error) {
    console.error('[Advisor] Error:', error);
    
    // Fallback response when Python backend is unavailable
    res.status(503).json({
      error: 'Deep analysis temporarily unavailable',
      fallbackResponse: "I apologize, but the advanced analysis system is currently unavailable. Please try the Basic Chat mode for immediate assistance with your financial questions.",
      timestamp: new Date().toISOString(),
      suggestion: 'Use Basic Chat mode for quick financial advice',
      source: 'fallback'
    });
  }
});

// Basic chat endpoint for simple LLM interactions
app.use('/api/chat', basicChatRoute);

// Catch-all endpoint that redirects to the new system
app.post('/api/groq', async (req, res) => {
  try {
    // Inform user about the new system
    const response = "I'm now using the advanced AI agent system. Please use the new chat interface for comprehensive financial analysis.";
    
    res.json({
      response: response,
      timestamp: new Date().toISOString(),
      source: 'redirect-notice'
    });
    
  } catch (error) {
    console.error('Error in groq endpoint:', error);
    res.status(500).json({
      error: 'An error occurred',
      message: error.message
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available_endpoints: ['/api/health', '/api/advisor', '/api/chat'],
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🧠 Financial Advisor API available at http://localhost:${PORT}/api/advisor`);
  console.log(`🔍 Health check available at http://localhost:${PORT}/api/health`);
  console.log(`💡 Make sure Python LangGraph backend is running on port 8000`);
});
