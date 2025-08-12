# Deployment Configuration

## Build Fix Applied
- Removed `moonshot-ai` and `openai` from requirements.txt (causing build failures)
- Added `slowapi` for rate limiting functionality
- Kept only essential dependencies for Google Gemini integration

## Render Deployment
1. Create Python service with `render-python.yaml` configuration
2. Create Node.js service with `render-node.yaml` configuration  
3. Set environment variables (API keys) in Render dashboard
4. Deploy frontend to Vercel with appropriate environment variables

## Essential Environment Variables
- Python Backend: GOOGLE_API_KEY, ENVIRONMENT=production
- Node.js API: NODE_ENV=production, PYTHON_API_URL
- Frontend: VITE_NODE_API_URL, VITE_PYTHON_API_URL, Firebase config

*Note: Never commit actual API keys or sensitive credentials to git*
