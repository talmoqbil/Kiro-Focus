/**
 * Agent Hooks - Custom React hooks for AI agent integration
 * Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.3, 8.4
 * 
 * Provides:
 * - useFocusCoach: Hook for Focus Coach agent interactions
 * - useArchitect: Hook for Cloud Architect agent interactions
 */

import { useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { getFocusCoachFeedback } from '../agents/focusCoachAgent.js';
import { getArchitectPurchaseFeedback, getArchitectAnalysis, checkArchitecturePattern } from '../agents/architectAgent.js';
import { canMakeApiCall } from '../agents/agentApiClient.js';
import { EVENTS } from '../utils/kiroLogic.js';

/**
 * Calculate days since last session
 * @param {string|null} lastSessionDate - ISO date string
 * @returns {number}
 */
function calculateDaysSinceLastSession(lastSessionDate) {
  if (!lastSessionDate) return 0;
  
  const last = new Date(lastSessionDate);
  const now = new Date();
  
  // Reset to start of day for accurate day counting
  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Calculate completion rate from session history
 * @param {Object[]} sessions - Session history array
 * @returns {number} - Completion rate as percentage (0-100)
 */
function calculateCompletionRate(sessions) {
  if (sessions.length === 0) return 0;
  const completed = sessions.filter(s => s.completed).length;
  return (completed / sessions.length) * 100;
}

/**
 * Hook for Focus Coach agent interactions
 * Requirements: 7.1, 7.2, 7.3, 7.4
 * 
 * @returns {Object} - Focus Coach methods
 */
export function useFocusCoach() {
  const { state, actions } = useApp();
  const isProcessingRef = useRef(false);
  
  /**
   * Send a message to Kiro with appropriate emotion
   */
  const sendKiroMessage = useCallback((message, emotion) => {
    actions.setKiroEmotion(emotion);
    actions.setKiroMessage({
      text: message,
      timestamp: Date.now(),
      duration: 6000 // 6 seconds
    });
  }, [actions]);
  
  /**
   * Handle session start - provide encouragement
   * Requirements: 7.1
   */
  const onSessionStart = useCallback(async (duration) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    try {
      const { userProgress } = state;
      
      const sessionData = {
        duration,
        recentSessions: userProgress.sessionHistory.slice(-5),
        streak: userProgress.currentStreak,
        totalSessions: userProgress.sessionsCompleted,
        completionRate: calculateCompletionRate(userProgress.sessionHistory)
      };
      
      const response = await getFocusCoachFeedback('encouragement', sessionData);
      sendKiroMessage(response.message, EVENTS.SESSION_START);
    } finally {
      isProcessingRef.current = false;
    }
  }, [state, sendKiroMessage]);
  
  /**
   * Handle session completion - provide praise
   * Requirements: 7.2
   */
  const onSessionComplete = useCallback(async (session) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    try {
      const { userProgress } = state;
      
      const sessionData = {
        duration: session.duration,
        completed: true,
        recentSessions: userProgress.sessionHistory.slice(-5),
        streak: userProgress.currentStreak,
        totalSessions: userProgress.sessionsCompleted,
        completionRate: calculateCompletionRate(userProgress.sessionHistory)
      };
      
      const response = await getFocusCoachFeedback('analysis', sessionData);
      sendKiroMessage(response.message, EVENTS.SESSION_COMPLETE);
    } finally {
      isProcessingRef.current = false;
    }
  }, [state, sendKiroMessage]);
  
  /**
   * Handle session abandonment - provide support
   * Requirements: 7.3
   */
  const onSessionAbandon = useCallback(async (session) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    try {
      const { userProgress } = state;
      
      const sessionData = {
        duration: session.duration,
        completed: false,
        recentSessions: userProgress.sessionHistory.slice(-5),
        streak: userProgress.currentStreak,
        totalSessions: userProgress.sessionsCompleted,
        completionRate: calculateCompletionRate(userProgress.sessionHistory)
      };
      
      const response = await getFocusCoachFeedback('supportive', sessionData);
      sendKiroMessage(response.message, EVENTS.SESSION_ABANDON);
    } finally {
      isProcessingRef.current = false;
    }
  }, [state, sendKiroMessage]);
  
  /**
   * Check for re-engagement and provide welcome message
   * Requirements: 7.4
   * 
   * @returns {boolean} - True if re-engagement message was sent
   */
  const checkReEngagement = useCallback(async () => {
    if (isProcessingRef.current) return false;
    
    const { userProgress } = state;
    const daysSinceLastSession = calculateDaysSinceLastSession(userProgress.lastSessionDate);
    
    // Only trigger re-engagement if >= 1 day since last session
    if (daysSinceLastSession < 1) return false;
    
    isProcessingRef.current = true;
    
    try {
      const sessionData = {
        daysSinceLastSession,
        recentSessions: userProgress.sessionHistory.slice(-5),
        streak: userProgress.currentStreak,
        totalSessions: userProgress.sessionsCompleted,
        completionRate: calculateCompletionRate(userProgress.sessionHistory)
      };
      
      const response = await getFocusCoachFeedback('motivation', sessionData);
      sendKiroMessage(response.message, EVENTS.IDLE);
      return true;
    } finally {
      isProcessingRef.current = false;
    }
  }, [state, sendKiroMessage]);
  
  return {
    onSessionStart,
    onSessionComplete,
    onSessionAbandon,
    checkReEngagement,
    canCallAgent: canMakeApiCall
  };
}

/**
 * Hook for Cloud Architect agent interactions
 * Requirements: 8.1, 8.3, 8.4
 * 
 * @returns {Object} - Architect methods
 */
export function useArchitect() {
  const { state, actions } = useApp();
  const isProcessingRef = useRef(false);
  
  /**
   * Send a message to Kiro with teaching emotion
   */
  const sendKiroMessage = useCallback((message) => {
    actions.setKiroEmotion(EVENTS.ARCHITECT_RESPONSE);
    actions.setKiroMessage({
      text: message,
      timestamp: Date.now(),
      duration: 8000 // 8 seconds for educational content
    });
  }, [actions]);
  
  /**
   * Handle component purchase - explain the component
   * Requirements: 8.1, 8.2
   */
  const onPurchase = useCallback(async (componentType) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    try {
      const { userProgress } = state;
      
      // Build component list from owned components
      const allComponents = userProgress.ownedComponents.map(id => ({
        type: id,
        tier: 1
      }));
      
      const response = await getArchitectPurchaseFeedback(
        componentType,
        allComponents,
        userProgress.credits
      );
      
      // Check for architecture pattern
      const pattern = checkArchitecturePattern(userProgress.ownedComponents);
      
      let message = response.explanation;
      
      // Add pattern recognition message if applicable
      if (pattern) {
        message += ` ${pattern.message}`;
      }
      
      // Add suggestion if available
      if (response.suggestedNext && response.reasoning) {
        message += ` Next up: consider getting ${response.suggestedNext}. ${response.reasoning}`;
      }
      
      sendKiroMessage(message);
    } finally {
      isProcessingRef.current = false;
    }
  }, [state, sendKiroMessage]);
  
  /**
   * Analyze current architecture and provide suggestions
   * Requirements: 8.3, 8.4
   */
  const analyzeArchitecture = useCallback(async () => {
    if (isProcessingRef.current) return null;
    isProcessingRef.current = true;
    
    try {
      const { userProgress } = state;
      
      if (userProgress.ownedComponents.length === 0) {
        sendKiroMessage("You haven't purchased any components yet! Complete some focus sessions to earn credits and start building your cloud infrastructure.");
        return null;
      }
      
      const allComponents = userProgress.ownedComponents.map(id => ({
        type: id,
        tier: 1
      }));
      
      const response = await getArchitectAnalysis(
        allComponents,
        userProgress.credits
      );
      
      sendKiroMessage(response.explanation);
      return response;
    } finally {
      isProcessingRef.current = false;
    }
  }, [state, sendKiroMessage]);
  
  /**
   * Get architecture pattern for current components
   * Requirements: 8.6
   */
  const getPattern = useCallback(() => {
    const { userProgress } = state;
    return checkArchitecturePattern(userProgress.ownedComponents);
  }, [state]);
  
  return {
    onPurchase,
    analyzeArchitecture,
    getPattern,
    canCallAgent: canMakeApiCall
  };
}

/**
 * Combined hook for both agents
 * Convenience hook that provides both Focus Coach and Architect functionality
 */
export function useAgents() {
  const focusCoach = useFocusCoach();
  const architect = useArchitect();
  
  return {
    focusCoach,
    architect
  };
}
