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
 * Build the input context for Focus Coach
 * Requirements: 7.5, 7.6
 * 
 * @param {string} mode - 'encouragement' | 'analysis' | 'motivation' | 'supportive'
 * @param {Object} sessionData - User session data
 * @returns {Object} - Formatted input for the agent
 */
export function buildFocusCoachInput(mode, sessionData) {
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
    }
  };
}

/**
 * Format the user prompt for the Focus Coach
 * @param {Object} input - The built input from buildFocusCoachInput
 * @returns {string} - Formatted prompt string
 */
function formatUserPrompt(input) {
  const { mode, sessionData } = input;
  
  let prompt = `Mode: ${mode.toUpperCase()}\n\n`;
  prompt += `User Context:\n`;
  prompt += `- Time of day: ${sessionData.timeOfDay}\n`;
  prompt += `- Current streak: ${sessionData.streak} days\n`;
  prompt += `- Total sessions: ${sessionData.totalSessions}\n`;
  prompt += `- Completion rate: ${sessionData.completionRate}%\n`;
  
  if (mode === 'encouragement') {
    prompt += `- Starting session duration: ${Math.round(sessionData.duration / 60)} minutes\n`;
  }
  
  if (mode === 'analysis') {
    prompt += `- Just completed: ${sessionData.completed ? 'Yes' : 'No'}\n`;
    prompt += `- Session duration: ${Math.round(sessionData.duration / 60)} minutes\n`;
  }
  
  if (mode === 'motivation') {
    prompt += `- Days since last session: ${sessionData.daysSinceLastSession}\n`;
  }
  
  if (mode === 'supportive') {
    prompt += `- Session was abandoned early\n`;
    prompt += `- Attempted duration: ${Math.round(sessionData.duration / 60)} minutes\n`;
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
 * @returns {Promise<Object>} - Parsed agent response
 */
export async function getFocusCoachFeedback(mode, sessionData) {
  const input = buildFocusCoachInput(mode, sessionData);
  const response = await callFocusCoachAgent(input);
  return parseFocusCoachResponse(response, mode);
}
