/**
 * Secure API utilities for authenticated requests
 */
import { getAuth } from 'firebase/auth';

/**
 * Get Firebase ID token for API authentication
 */
export const getAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

/**
 * Make authenticated API request
 */
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add authentication header if token is available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const requestOptions = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(url, requestOptions);
    
    // Handle authentication errors
    if (response.status === 401) {
      console.warn('Authentication failed - user may need to re-login');
      // Could trigger a re-authentication flow here
    }
    
    if (response.status === 429) {
      throw new Error('Too many requests. Please wait a moment before trying again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Make authenticated POST request to financial advice endpoint
 */
export const getFinancialAdvice = async (prompt, userContext) => {
  return makeAuthenticatedRequest('http://localhost:8000/financial-advice', {
    method: 'POST',
    body: JSON.stringify({
      question: prompt,
      userContext: userContext
    })
  });
};

/**
 * Make authenticated request to basic chat endpoint
 */
export const getBasicChatResponse = async (message, userProfile, detailedProfile, transactions, holdings, monthlyData) => {
  return makeAuthenticatedRequest('http://localhost:8080/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      userProfile,
      detailedProfile,
      transactions,
      holdings,
      monthlyData
    })
  });
};
