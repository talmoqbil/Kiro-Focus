/**
 * Cloud Architect Agent - Explains cloud concepts and suggests architecture
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 11.4
 * 
 * Provides:
 * - Component explanations with real-world analogies
 * - Architecture suggestions based on owned components
 * - Pattern recognition (3-tier, etc.)
 */

import { ARCHITECT_AGENT_SYSTEM_PROMPT, GOAL_PROMPT_TEMPLATE } from './agentPrompts.js';
import { callAgentAPI, parseAgentResponse } from './agentApiClient.js';
import { getArchitectFallback, detectArchitecturePattern } from './kiroDialogue.js';

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
 * Format a goal naturally for fallback messages
 * @param {string} goal - The user's goal text
 * @returns {string} - Naturally phrased goal reference
 */
function formatGoalNaturally(goal) {
  const goalType = detectGoalType(goal);
  const trimmed = goal.trim();
  
  if (goalType === 'company_name') {
    return `${trimmed}-style architecture`;
  } else if (goalType === 'project_type') {
    return trimmed;
  } else {
    return `${trimmed} project`;
  }
}

/**
 * Build the input context for Architect Agent
 * Requirements: 8.2, 8.3, 19.7
 * 
 * @param {Object[]} currentComponents - Array of owned components with type and tier
 * @param {number} credits - Current credit balance
 * @param {string|null} lastAction - 'purchase' | 'query' | null
 * @param {Object} lastPurchasedComponent - The most recently purchased component
 * @param {string|null} currentGoal - User's current architecture goal (optional)
 * @returns {Object} - Formatted input for the agent
 */
export function buildArchitectInput(currentComponents, credits, lastAction, lastPurchasedComponent = null, currentGoal = null) {
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
    } : null,
    currentGoal
  };
}

/**
 * Format the user prompt for the Architect Agent
 * Requirements: 19.7
 * @param {Object} input - The built input from buildArchitectInput
 * @returns {string} - Formatted prompt string
 */
function formatUserPrompt(input) {
  const { currentComponents, credits, lastAction, lastPurchasedComponent, currentGoal } = input;
  
  let prompt = '';
  
  if (lastAction === 'purchase' && lastPurchasedComponent) {
    prompt += `Action: User just purchased a ${lastPurchasedComponent.type} component.\n\n`;
  } else if (lastAction === 'query') {
    prompt += `Action: User is viewing their architecture and wants advice.\n\n`;
  }
  
  // Include current goal if set (Requirements 19.7)
  if (currentGoal) {
    const goalType = detectGoalType(currentGoal);
    prompt += `User's Goal: "${currentGoal}" (${goalType})\n`;
    prompt += `Note: Phrase the goal naturally - see system prompt for grammar rules.\n\n`;
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
    prompt += `\nPlease explain the ${lastPurchasedComponent.type} component`;
    if (currentGoal) {
      prompt += ` and how it helps achieve their goal of "${currentGoal}"`;
    }
    prompt += ` and suggest what to build next.`;
  } else {
    prompt += `\nPlease analyze the current architecture and suggest improvements`;
    if (currentGoal) {
      prompt += ` to help achieve their goal of "${currentGoal}"`;
    }
    prompt += `.`;
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
 * @param {string|null} currentGoal - User's current architecture goal (optional)
 * @returns {Promise<Object>} - Parsed agent response
 */
export async function getArchitectPurchaseFeedback(componentType, allComponents, credits, currentGoal = null) {
  const input = buildArchitectInput(
    allComponents,
    credits,
    'purchase',
    { type: componentType, tier: 1 },
    currentGoal
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
 * @param {string|null} currentGoal - User's current architecture goal (optional)
 * @returns {Promise<Object>} - Parsed agent response
 */
export async function getArchitectAnalysis(allComponents, credits, currentGoal = null) {
  const input = buildArchitectInput(allComponents, credits, 'query', null, currentGoal);
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

/**
 * Call the Goal Advice Agent to get recommendations for a user's architecture goal
 * Requirements: 19.2, 19.3, 19.5, 19.8
 * 
 * @param {string} goalText - User's goal description (e.g., "static website", "serverless API")
 * @param {Object[]} availableServices - Array of available service objects with id and name
 * @returns {Promise<Object>} - { summary: string, recommendedServiceTypes: string[] }
 */
export async function callGoalAdviceAgent(goalText, availableServices) {
  // Format available services for the prompt
  const servicesText = availableServices
    .map(s => `- ${s.id}: ${s.name} - ${s.description}`)
    .join('\n');
  
  // Build the prompt from template
  const userPrompt = GOAL_PROMPT_TEMPLATE
    .replace('{goalText}', goalText)
    .replace('{availableServices}', servicesText);
  
  try {
    const response = await callAgentAPI(
      'You are a helpful cloud architecture advisor.',
      userPrompt,
      600
    );
    
    // If API call failed, use fallback immediately
    if (!response.success) {
      console.warn('Goal advice API failed, using fallback:', response.error);
      return getGoalFallback(goalText, availableServices);
    }
    
    // Parse the successful response
    const formattedGoal = formatGoalNaturally(goalText);
    const parsed = parseAgentResponse(response, {
      summary: `Great choice! Building your ${formattedGoal} is a fantastic project. Let me suggest some services to get you started.`,
      recommendations: []
    });
    
    // Extract service IDs from recommendations
    const recommendedServiceTypes = (parsed.recommendations || [])
      .map(r => r.serviceId)
      .filter(id => availableServices.some(s => s.id === id));
    
    // If no valid recommendations were extracted, use fallback
    if (recommendedServiceTypes.length === 0) {
      console.warn('No valid recommendations from API, using fallback');
      return getGoalFallback(goalText, availableServices);
    }
    
    return {
      summary: parsed.summary || `Let's build your ${formattedGoal}!`,
      recommendedServiceTypes
    };
  } catch (error) {
    // Fallback: return generic advice based on common patterns
    console.error('Goal advice agent error:', error);
    return getGoalFallback(goalText, availableServices);
  }
}

/**
 * Get placement feedback when a component is placed on the canvas
 * Provides context-aware guidance on how to use the placed component
 * 
 * @param {string} componentType - The placed component type
 * @param {Object[]} placedComponents - All components currently on canvas
 * @param {Object[]} connections - Current connections on canvas
 * @param {string|null} currentGoal - User's current architecture goal (optional)
 * @returns {Promise<Object>} - { message: string }
 */
export async function getPlacementFeedback(componentType, placedComponents, connections, currentGoal = null) {
  // Build context about current canvas state
  const componentList = placedComponents.map(c => c.type).join(', ') || 'none';
  const connectionCount = connections.length;
  
  let prompt = `Action: User just placed a ${componentType} component on their architecture canvas.\n\n`;
  
  if (currentGoal) {
    prompt += `User's Goal: "${currentGoal}"\n\n`;
  }
  
  prompt += `Current Canvas State:\n`;
  prompt += `- Components on canvas: ${componentList}\n`;
  prompt += `- Connections established: ${connectionCount}\n\n`;
  
  prompt += `Please provide a brief, helpful message (2-3 sentences max) that:\n`;
  prompt += `1. Acknowledges the placement\n`;
  prompt += `2. Suggests what to connect it to or what to add next\n`;
  if (currentGoal) {
    prompt += `3. Relates it to their goal of "${currentGoal}"\n`;
  }
  prompt += `\nRespond as JSON with a "message" field.`;
  
  try {
    const response = await callAgentAPI(
      ARCHITECT_AGENT_SYSTEM_PROMPT,
      prompt,
      200 // shorter response for placement feedback
    );
    
    const parsed = parseAgentResponse(response, {
      message: getPlacementFallback(componentType, placedComponents, currentGoal)
    });
    
    return { message: parsed.message };
  } catch (error) {
    console.error('Placement feedback error:', error);
    return { message: getPlacementFallback(componentType, placedComponents, currentGoal) };
  }
}

/**
 * Get fallback placement message when API fails
 * @param {string} componentType - The placed component
 * @param {Object[]} placedComponents - Components on canvas
 * @param {string|null} currentGoal - User's goal
 * @returns {string} - Fallback message
 */
function getPlacementFallback(componentType, placedComponents, currentGoal) {
  const type = componentType.toLowerCase();
  const otherComponents = placedComponents.filter(c => c.type.toLowerCase() !== type);
  
  const suggestions = {
    ec2: "EC2 is your compute workhorse! Connect it to a database for data persistence, or add a load balancer in front for high availability.",
    s3: "S3 is perfect for storing static assets! Consider connecting it to CloudFront for faster delivery, or to Lambda for event-driven processing.",
    rds: "RDS gives you managed databases! Connect your EC2 or Lambda functions to it for data persistence.",
    cloudfront: "CloudFront speeds up content delivery! Connect it to S3 for static hosting, or to your load balancer for dynamic content.",
    loadbalancer: "Load balancer distributes traffic! Connect it to multiple EC2 instances or ECS containers for high availability.",
    lambda: "Lambda runs code without servers! Connect it to DynamoDB for data, or SQS for async processing.",
    dynamodb: "DynamoDB is a fast NoSQL database! Connect Lambda or EC2 to it for serverless data storage.",
    route53: "Route 53 handles DNS! Connect it to CloudFront or your load balancer to route traffic to your app.",
    ecs: "ECS runs containers! Add a load balancer in front and connect to RDS or DynamoDB for data.",
    elasticache: "ElastiCache speeds up data access! Connect your compute services to it for caching.",
    sqs: "SQS queues messages! Connect it between services for reliable async communication.",
    sns: "SNS sends notifications! Connect it to Lambda or SQS for event-driven architectures.",
    eventbridge: "EventBridge routes events! Connect it to Lambda for serverless event processing.",
    cognito: "Cognito handles auth! Connect it to your API Gateway or load balancer for user authentication.",
    waf: "WAF protects your app! Connect it to CloudFront or your load balancer for security.",
    cloudwatch: "CloudWatch monitors everything! Other services automatically send metrics here."
  };
  
  let message = suggestions[type] || `${componentType} is now on your canvas! Use Connect Mode to wire it up with other services.`;
  
  if (currentGoal && otherComponents.length === 0) {
    message += ` This is a great start for your ${formatGoalNaturally(currentGoal)}!`;
  }
  
  return message;
}

/**
 * Get fallback recommendations when API fails
 * @param {string} goalText - User's goal
 * @param {Object[]} availableServices - Available services
 * @returns {Object} - Fallback response
 */
function getGoalFallback(goalText, availableServices) {
  const goalLower = goalText.toLowerCase();
  let recommended = [];
  
  // Pattern matching for common goals - check company names first
  if (goalLower.includes('netflix') || goalLower.includes('streaming') || goalLower.includes('video')) {
    recommended = ['s3', 'cloudfront', 'ec2', 'elasticache', 'dynamodb'];
  } else if (goalLower.includes('uber') || goalLower.includes('lyft') || goalLower.includes('ride')) {
    recommended = ['ec2', 'rds', 'loadbalancer', 'sqs', 'sns'];
  } else if (goalLower.includes('airbnb') || goalLower.includes('booking') || goalLower.includes('marketplace')) {
    recommended = ['ec2', 'rds', 'loadbalancer', 's3', 'cognito'];
  } else if (goalLower.includes('twitter') || goalLower.includes('social') || goalLower.includes('feed')) {
    recommended = ['ec2', 'dynamodb', 'elasticache', 'sqs', 'cloudfront'];
  } else if (goalLower.includes('slack') || goalLower.includes('discord') || goalLower.includes('chat') || goalLower.includes('messaging')) {
    recommended = ['ec2', 'dynamodb', 'sqs', 'sns', 'cognito'];
  } else if (goalLower.includes('spotify') || goalLower.includes('music')) {
    recommended = ['s3', 'cloudfront', 'dynamodb', 'lambda', 'cognito'];
  } else if (goalLower.includes('google') || goalLower.includes('search')) {
    recommended = ['ec2', 'dynamodb', 'elasticache', 'loadbalancer', 's3'];
  } else if (goalLower.includes('static') || goalLower.includes('website') || goalLower.includes('landing') || goalLower.includes('blog')) {
    recommended = ['s3', 'cloudfront', 'route53'];
  } else if (goalLower.includes('api') || goalLower.includes('serverless') || goalLower.includes('function') || goalLower.includes('backend')) {
    recommended = ['lambda', 'dynamodb', 'sqs', 'cognito'];
  } else if (goalLower.includes('web app') || goalLower.includes('application') || goalLower.includes('saas')) {
    recommended = ['ec2', 'rds', 'loadbalancer', 's3', 'cognito'];
  } else if (goalLower.includes('container') || goalLower.includes('docker') || goalLower.includes('microservice') || goalLower.includes('kubernetes')) {
    recommended = ['ecs', 'loadbalancer', 'elasticache', 'cloudwatch', 'ecr'];
  } else if (goalLower.includes('data') || goalLower.includes('analytics') || goalLower.includes('pipeline') || goalLower.includes('etl')) {
    recommended = ['s3', 'dynamodb', 'lambda', 'sqs', 'eventbridge'];
  } else if (goalLower.includes('e-commerce') || goalLower.includes('ecommerce') || goalLower.includes('shop') || goalLower.includes('store')) {
    recommended = ['ec2', 'rds', 'loadbalancer', 's3', 'cloudfront', 'cognito'];
  } else if (goalLower.includes('iot') || goalLower.includes('sensor') || goalLower.includes('device')) {
    recommended = ['lambda', 'dynamodb', 'sqs', 'sns', 'eventbridge'];
  } else if (goalLower.includes('game') || goalLower.includes('gaming')) {
    recommended = ['ec2', 'dynamodb', 'elasticache', 'loadbalancer', 'cloudwatch'];
  } else {
    // Default: suggest foundational services
    recommended = ['ec2', 's3', 'rds', 'lambda'];
  }
  
  // Filter to only available services
  const validRecommended = recommended.filter(id => 
    availableServices.some(s => s.id === id)
  );
  
  const formattedGoal = formatGoalNaturally(goalText);
  return {
    summary: `Great goal! Building your ${formattedGoal} is a fantastic project. Here are some AWS services that will help you get started.`,
    recommendedServiceTypes: validRecommended
  };
}
