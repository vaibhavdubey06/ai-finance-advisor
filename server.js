import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Financial advisor endpoint - connects to Python LangGraph backend
app.post('/api/advisor', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  
  try {
    console.log(`[Advisor] User prompt: ${prompt}`);
    
    // Call Python LangGraph backend
    const response = await fetch('http://localhost:8000/financial-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: prompt })
    });
    
    if (!response.ok) {
      throw new Error(`Python backend error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[Advisor] Python backend response:', data);
    
    // Extract the final result from the LangGraph workflow
    // Priority: tool_use first (RAG responses), then planner (simple responses)
    const result = data.final?.tool_use?.response ||
                   data.final?.tool_use?.result ||
                   data.final?.planner?.response ||
                   data.final?.planner?.result ||
                   data.final?.response ||
                   data.final?.result ||
                   data.response ||
                   data.result ||
                   'No response from AI agents';
    
    res.json({ 
      success: true, 
      toolResult: { result },
      timestamp: new Date().toISOString() 
    });
    
  } catch (error) {
    console.error('[Advisor] Error:', error);
    res.status(500).json({ 
      error: `Failed to get financial advice: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

// Fallback endpoint for simple chat (for backward compatibility)
app.post('/api/groq', async (req, res) => {
  const { messages, stream = false } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  if (stream) {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  }

  try {
    // Simple response for backward compatibility
    const response = "I'm now using the advanced AI agent system. Please use the new chat interface for comprehensive financial analysis.";
    
    if (stream) {
      const words = response.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const space = i < words.length - 1 ? ' ' : '';
        
        res.write(`data: ${JSON.stringify({ 
          type: 'stream', 
          content: word + space 
        })}\n\n`);
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.json({ 
        success: true, 
        response: response,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error in groq endpoint:', error);
    
    if (stream) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.status(500).json({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found',
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