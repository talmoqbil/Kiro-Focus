/**
 * Agent API Client - Wrapper for OpenAI API calls with error handling
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 * 
 * Features:
 * - 5 second timeout with retry
 * - Rate limiting (max 5 messages/hour)
 * - Error logging and fallback triggering
 */

import { getErrorRecoveryMessage } from './kiroDialogue.js';

// API Configuration - Using OpenAI
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const API_TIMEOUT = 5000; // 5 seconds
const MAX_RETRIES = 1;

// Rate limiting configuration
const MAX_MESSAGES_PER_HOUR = 30;

// Rate limiter state (module-level singleton)
let rateLimiterState = {
  messagesThisHour: 0,
  hourStartTime: Date.now()
};

/**
 * Reset rate limiter if hour has passed
 */
function checkAndResetRateLimiter() {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;
  
  if (now - rateLimiterState.hourStartTime >= hourInMs) {
    rateLimiterState = {
      messagesThisHour: 0,
      hourStartTime: now
    };
  }
}

/**
 * Check if we can make another API call
 * @returns {boolean}
 */
export function canMakeApiCall() {
  checkAndResetRateLimiter();
  return rateLimiterState.messagesThisHour < MAX_MESSAGES_PER_HOUR;
}

/**
 * Get remaining API calls this hour
 * @returns {number}
 */
export function getRemainingCalls() {
  checkAndResetRateLimiter();
  return MAX_MESSAGES_PER_HOUR - rateLimiterState.messagesThisHour;
}

/**
 * Increment the rate limiter counter
 */
function incrementRateLimiter() {
  checkAndResetRateLimiter();
  rateLimiterState.messagesThisHour++;
}

/**
 * Reset rate limiter (for testing)
 */
export function resetRateLimiter() {
  rateLimiterState = {
    messagesThisHour: 0,
    hourStartTime: Date.now()
  };
}

/**
 * Get current rate limiter state (for testing/debugging)
 * @returns {Object}
 */
export function getRateLimiterState() {
  checkAndResetRateLimiter();
  return { ...rateLimiterState };
}

/**
 * Create a fetch request with timeout
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Log an error (could be extended to send to monitoring service)
 * @param {string} context - Where the error occurred
 * @param {Error} error - The error object
 */
function logError(context, error) {
  console.error(`[AgentAPI] ${context}:`, error.message || error);
}

/**
 * Call the OpenAI API with retry logic
 * Requirements: 11.1, 11.2, 11.3
 * 
 * @param {string} systemPrompt - The system prompt for the agent
 * @param {string} userPrompt - The user message/context
 * @param {number} maxTokens - Maximum tokens in response (default 500)
 * @returns {Promise<Object>} - Parsed response or fallback
 */
export async function callAgentAPI(systemPrompt, userPrompt, maxTokens = 500) {
  // Check rate limit first
  if (!canMakeApiCall()) {
    logError('Rate limit', new Error('Rate limit exceeded'));
    return {
      success: false,
      error: 'rate_limit',
      fallbackMessage: getErrorRecoveryMessage()
    };
  }
  
  // Get API key from environment
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    logError('Configuration', new Error('API key not configured'));
    return {
      success: false,
      error: 'no_api_key',
      fallbackMessage: getErrorRecoveryMessage()
    };
  }
  
  // OpenAI request format
  const requestBody = {
    model: 'gpt-4o-mini', // Cost-effective and fast
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' } // Ensure JSON response
  };
  
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  };
  
  let lastError = null;
  
  // Try with retry logic
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(API_ENDPOINT, fetchOptions, API_TIMEOUT);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      // Increment rate limiter on successful call
      incrementRateLimiter();
      
      // Extract the text content from OpenAI's response
      const textContent = data.choices?.[0]?.message?.content;
      
      if (!textContent) {
        throw new Error('No text content in response');
      }
      
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(textContent);
        return {
          success: true,
          data: parsed
        };
      } catch {
        // If not valid JSON, return the raw text
        return {
          success: true,
          data: { message: textContent }
        };
      }
      
    } catch (error) {
      lastError = error;
      
      // Check if it's a timeout (AbortError)
      if (error.name === 'AbortError') {
        logError(`Timeout (attempt ${attempt + 1})`, error);
        // Continue to retry
      } else {
        logError(`API call (attempt ${attempt + 1})`, error);
        // For non-timeout errors, don't retry
        break;
      }
    }
  }
  
  // All retries failed
  return {
    success: false,
    error: lastError?.name === 'AbortError' ? 'timeout' : 'api_error',
    fallbackMessage: getErrorRecoveryMessage()
  };
}

/**
 * Parse agent response with defaults for missing fields
 * Requirements: 11.4
 * 
 * @param {Object} response - The API response
 * @param {Object} defaults - Default values for missing fields
 * @returns {Object} - Parsed response with defaults applied
 */
export function parseAgentResponse(response, defaults = {}) {
  if (!response.success) {
    return {
      ...defaults,
      message: response.fallbackMessage || defaults.message || getErrorRecoveryMessage()
    };
  }
  
  const data = response.data || {};
  
  // Apply defaults for any missing fields
  return {
    ...defaults,
    ...data
  };
}
