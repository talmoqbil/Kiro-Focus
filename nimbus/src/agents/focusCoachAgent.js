/**
 * Focus Coach Agent - Provides personalized encouragement and feedback
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 11.4
 * 
 * Modes:
 * - encouragement: Session start motivation
 * - analysis: Session completion praise
 * - motivation: Re-engagement after inactivity
 * - supportive: Session abandonment support
 */

import { FOCUS_COACH_SYSTEM_PROMPT } from './agentPrompts.js';
import { callAgentAPI, parseAgentResponse } from './agentApiClient.js';
import { getFocusCoachFallback } from './kiroDialogue.js';

/**
 * Get time of day category
 * @returns {'morning' | 'afternoon' | 'evening'}
 */
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Detect the type of goal to help the LLM phrase it correctly
 * @param {string} goal - The user's goal text
 * @returns {'company_name' | 'project_type' | 'description'}
 */
function detectGoalType(goal) {
  const normalized = goal.trim().toLowerCase();
  
  // Common company names that users might reference
  const companyPatterns = [
    'google', 'netflix', 'uber', 'airbnb', 'spotify', 'twitter', 'facebook',
    'amazon', 'instagram', 'tiktok', 'slack', 'discord', 'zoom', 'stripe',
    'shopify', 'dropbox', 'github', 'linkedin', 'pinterest', 'reddit', 'youtube'
  ];
  
  if (companyPatterns.some(company => normalized.includes(company))) {
    return 'company_name';
  }
  
  // Common project type patterns
  const projectTypePatterns = [
    'api', 'website', 'app', 'application', 'service', 'platform', 'system',
    'backend', 'frontend', 'microservice', 'pipeline', 'dashboard'
  ];
  
  if (projectTypePatterns.some(type => normalized.includes(type))) {
    return 'project_type';
  }
  
  // If it's short (1-2 words) and capitalized, likely a company/product name
  const words = goal.trim().split(/\s+/);
  if (words.length <= 2 && /^[A-Z]/.test(goal.trim())) {
    return 'company_name';
  }
  
  return 'description';
}

/**
 * Build the input context for Focus Coach
 * Requirements: 7.5, 7.6
 * 
 * @param {string} mode - 'encouragement' | 'analysis' | 'motivation' | 'supportive'
 * @param {Object} sessionData - User session data
 * @param {string|null} currentGoal - User's current architecture goal (optional)
 * @returns {Object} - Formatted input for the agent
 */
export function buildFocusCoachInput(mode, sessionData, currentGoal = null) {
  const {
    duration = 0,
    completed = false,
    recentSessions = [],
    streak = 0,
    totalSessions = 0,
    completionRate = 0,
    daysSinceLastSession = 0
  } = sessionData;
  
  return {
    mode,
    sessionData: {
      duration,
      completed,
      recentSessions: recentSessions.slice(0, 5), // Last 5 sessions
      streak,
      totalSessions,
      completionRate: Math.round(completionRate * 100) / 100,
      timeOfDay: getTimeOfDay(),
      daysSinceLastSession
    },
    currentGoal
  };
}

/**
 * Format the user prompt for the Focus Coach
 * @param {Object} input - The built input from buildFocusCoachInput
 * @returns {string} - Formatted prompt string
 */
function formatUserPrompt(input) {
  const { mode, sessionData, currentGoal } = input;
  
  let prompt = `Mode: ${mode.toUpperCase()}\n\n`;
  
  // CRITICAL: Include goal at the top if set
  if (currentGoal) {
    const goalType = detectGoalType(currentGoal);
    prompt += `🎯 USER'S GOAL: "${currentGoal}"\n`;
    prompt += `Goal type: ${goalType}\n`;
    prompt += `IMPORTANT: Reference this goal naturally using proper grammar (see system prompt for examples)!\n\n`;
  }
  
  prompt += `User Context:\n`;
  prompt += `- Time of day: ${sessionData.timeOfDay}\n`;
  prompt += `- Current streak: ${sessionData.streak} days\n`;
  prompt += `- Total sessions: ${sessionData.totalSessions}\n`;
  prompt += `- Completion rate: ${sessionData.completionRate}%\n`;
  
  if (mode === 'encouragement') {
    prompt += `- Starting session duration: ${Math.round(sessionData.duration / 60)} minutes\n`;
    if (currentGoal) {
      prompt += `\nEncourage them to focus on their goal. Remember to phrase it naturally!\n`;
    }
  }
  
  if (mode === 'analysis') {
    prompt += `- Just completed: ${sessionData.completed ? 'Yes' : 'No'}\n`;
    prompt += `- Session duration: ${Math.round(sessionData.duration / 60)} minutes\n`;
    if (currentGoal) {
      prompt += `\nCelebrate their progress toward their goal. Remember to phrase it naturally!\n`;
    }
  }
  
  if (mode === 'motivation') {
    prompt += `- Days since last session: ${sessionData.daysSinceLastSession}\n`;
    if (currentGoal) {
      prompt += `\nWelcome them back and mention their goal. Remember to phrase it naturally!\n`;
    }
  }
  
  if (mode === 'supportive') {
    prompt += `- Session was abandoned early\n`;
    prompt += `- Attempted duration: ${Math.round(sessionData.duration / 60)} minutes\n`;
    if (currentGoal) {
      prompt += `\nEncourage them about their goal. Remember to phrase it naturally!\n`;
    }
  }
  
  if (sessionData.recentSessions.length > 0) {
    prompt += `\nRecent session history:\n`;
    sessionData.recentSessions.forEach((session, i) => {
      prompt += `  ${i + 1}. ${session.completed ? '✓' : '✗'} ${Math.round(session.duration / 60)}min - ${session.creditsEarned} credits\n`;
    });
  }
  
  prompt += `\nProvide a ${mode} response as JSON.`;
  
  return prompt;
}

/**
 * Call the Focus Coach Agent
 * Requirements: 7.1, 7.2, 7.3, 7.4, 11.4
 * 
 * @param {Object} input - The input from buildFocusCoachInput
 * @returns {Promise<Object>} - Agent response
 */
export async function callFocusCoachAgent(input) {
  const userPrompt = formatUserPrompt(input);
  
  const response = await callAgentAPI(
    FOCUS_COACH_SYSTEM_PROMPT,
    userPrompt,
    500 // max tokens
  );
  
  return response;
}

/**
 * Parse Focus Coach response with defaults
 * Requirements: 11.4
 * 
 * @param {Object} response - The API response
 * @param {string} mode - The mode for fallback selection
 * @returns {Object} - Parsed response
 */
export function parseFocusCoachResponse(response, mode) {
  const fallback = getFocusCoachFallback(mode);
  
  return parseAgentResponse(response, {
    message: fallback.message,
    suggestedDuration: fallback.suggestedDuration,
    tone: fallback.tone
  });
}

/**
 * High-level function to get Focus Coach feedback
 * Combines building input, calling API, and parsing response
 * 
 * @param {string} mode - 'encouragement' | 'analysis' | 'motivation' | 'supportive'
 * @param {Object} sessionData - User session data
 * @param {string|null} currentGoal - User's current architecture goal (optional)
 * @returns {Promise<Object>} - Parsed agent response
 */
export async function getFocusCoachFeedback(mode, sessionData, currentGoal = null) {
  const input = buildFocusCoachInput(mode, sessionData, currentGoal);
  const response = await callFocusCoachAgent(input);
  return parseFocusCoachResponse(response, mode);
}
