/**
 * Cloud Architect Agent - Explains cloud concepts and suggests architecture
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 11.4
 * 
 * Provides:
 * - Component explanations with real-world analogies
 * - Architecture suggestions based on owned components
 * - Pattern recognition (3-tier, etc.)
 */

import { ARCHITECT_AGENT_SYSTEM_PROMPT } from './agentPrompts.js';
import { callAgentAPI, parseAgentResponse } from './agentApiClient.js';
import { getArchitectFallback, detectArchitecturePattern } from './kiroDialogue.js';

/**
 * Build the input context for Architect Agent
 * Requirements: 8.2, 8.3
 * 
 * @param {Object[]} currentComponents - Array of owned components with type and tier
 * @param {number} credits - Current credit balance
 * @param {string|null} lastAction - 'purchase' | 'query' | null
 * @param {Object} lastPurchasedComponent - The most recently purchased component
 * @returns {Object} - Formatted input for the agent
 */
export function buildArchitectInput(currentComponents, credits, lastAction, lastPurchasedComponent = null) {
  return {
    currentComponents: currentComponents.map(c => ({
      type: c.type || c,
      tier: c.tier || 1
    })),
    credits,
    lastAction,
    lastPurchasedComponent: lastPurchasedComponent ? {
      type: lastPurchasedComponent.type || lastPurchasedComponent,
      tier: lastPurchasedComponent.tier || 1
    } : null
  };
}

/**
 * Format the user prompt for the Architect Agent
 * @param {Object} input - The built input from buildArchitectInput
 * @returns {string} - Formatted prompt string
 */
function formatUserPrompt(input) {
  const { currentComponents, credits, lastAction, lastPurchasedComponent } = input;
  
  let prompt = '';
  
  if (lastAction === 'purchase' && lastPurchasedComponent) {
    prompt += `Action: User just purchased a ${lastPurchasedComponent.type} component.\n\n`;
  } else if (lastAction === 'query') {
    prompt += `Action: User is viewing their architecture and wants advice.\n\n`;
  }
  
  prompt += `Current Infrastructure:\n`;
  
  if (currentComponents.length === 0) {
    prompt += `- No components owned yet\n`;
  } else {
    currentComponents.forEach(comp => {
      prompt += `- ${comp.type} (Tier ${comp.tier})\n`;
    });
  }
  
  prompt += `\nAvailable credits: ${credits}\n`;
  
  // Check for architecture patterns
  const componentTypes = currentComponents.map(c => c.type.toLowerCase());
  const pattern = detectArchitecturePattern(componentTypes);
  
  if (pattern) {
    prompt += `\nNote: User has built a "${pattern.pattern}" architecture pattern.\n`;
  }
  
  if (lastAction === 'purchase' && lastPurchasedComponent) {
    prompt += `\nPlease explain the ${lastPurchasedComponent.type} component and suggest what to build next.`;
  } else {
    prompt += `\nPlease analyze the current architecture and suggest improvements.`;
  }
  
  prompt += `\n\nRespond as JSON.`;
  
  return prompt;
}

/**
 * Call the Architect Agent
 * Requirements: 8.1, 8.2, 8.3, 8.4, 11.4
 * 
 * @param {Object} input - The input from buildArchitectInput
 * @returns {Promise<Object>} - Agent response
 */
export async function callArchitectAgent(input) {
  const userPrompt = formatUserPrompt(input);
  
  const response = await callAgentAPI(
    ARCHITECT_AGENT_SYSTEM_PROMPT,
    userPrompt,
    600 // max tokens (slightly more for detailed explanations)
  );
  
  return response;
}

/**
 * Parse Architect response with defaults
 * Requirements: 11.4
 * 
 * @param {Object} response - The API response
 * @param {string} componentType - The component type for fallback selection
 * @returns {Object} - Parsed response
 */
export function parseArchitectResponse(response, componentType) {
  const fallback = getArchitectFallback(componentType || 'ec2');
  
  return parseAgentResponse(response, {
    explanation: fallback.explanation,
    suggestedNext: fallback.suggestedNext,
    reasoning: fallback.reasoning,
    educationalNote: fallback.educationalNote
  });
}

/**
 * High-level function to get Architect feedback on a purchase
 * Requirements: 8.1, 8.2
 * 
 * @param {string} componentType - The purchased component type
 * @param {Object[]} allComponents - All owned components
 * @param {number} credits - Current credits
 * @returns {Promise<Object>} - Parsed agent response
 */
export async function getArchitectPurchaseFeedback(componentType, allComponents, credits) {
  const input = buildArchitectInput(
    allComponents,
    credits,
    'purchase',
    { type: componentType, tier: 1 }
  );
  
  const response = await callArchitectAgent(input);
  return parseArchitectResponse(response, componentType);
}

/**
 * High-level function to get Architect analysis of current architecture
 * Requirements: 8.3, 8.4
 * 
 * @param {Object[]} allComponents - All owned components
 * @param {number} credits - Current credits
 * @returns {Promise<Object>} - Parsed agent response
 */
export async function getArchitectAnalysis(allComponents, credits) {
  const input = buildArchitectInput(allComponents, credits, 'query');
  const response = await callArchitectAgent(input);
  
  // Use the first component type for fallback, or 'ec2' as default
  const firstComponent = allComponents[0]?.type || 'ec2';
  return parseArchitectResponse(response, firstComponent);
}

/**
 * Check if the current architecture matches a known pattern
 * Requirements: 8.6
 * 
 * @param {string[]} componentTypes - Array of component type strings
 * @returns {Object|null} - Pattern info or null
 */
export function checkArchitecturePattern(componentTypes) {
  return detectArchitecturePattern(componentTypes);
}
