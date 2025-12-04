/**
 * Connection Rules Module
 * 
 * Defines component categories and connection validation rules for the infrastructure canvas.
 * This module serves as the single source of truth for category-based connection validation.
 * 
 * **Validates: Requirements 16.2, 16.3, 17.1, 17.2, 17.4**
 */

/**
 * Component Categories
 * Each component belongs to exactly one category.
 * @typedef {'edge' | 'load_balancer' | 'compute' | 'serverless' | 'storage' | 'database' | 'cache' | 'async' | 'auth' | 'security' | 'observability'} ComponentCategory
 */
export const COMPONENT_CATEGORIES = {
  EDGE: 'edge',
  LOAD_BALANCER: 'load_balancer',
  COMPUTE: 'compute',
  SERVERLESS: 'serverless',
  STORAGE: 'storage',
  DATABASE: 'database',
  CACHE: 'cache',
  ASYNC: 'async',
  AUTH: 'auth',
  SECURITY: 'security',
  OBSERVABILITY: 'observability'
};

/**
 * DocLink interface for AWS documentation links
 * @typedef {Object} DocLink
 * @property {string} title - Display title for the link
 * @property {string} url - URL to the documentation
 */

/**
 * Connection rules mapping: category → allowed target categories
 * Based on Requirements 17.2
 */
export const CONNECTION_RULES = {
  // edge (Route 53) → may connect to edge (CloudFront) or load_balancer
  // edge (CloudFront) → may connect to load_balancer, compute, serverless, or storage
  [COMPONENT_CATEGORIES.EDGE]: [
    COMPONENT_CATEGORIES.EDGE,
    COMPONENT_CATEGORIES.LOAD_BALANCER,
    COMPONENT_CATEGORIES.COMPUTE,
    COMPONENT_CATEGORIES.SERVERLESS,
    COMPONENT_CATEGORIES.STORAGE,
    COMPONENT_CATEGORIES.OBSERVABILITY
  ],
  
  // load_balancer → may connect to compute or serverless
  [COMPONENT_CATEGORIES.LOAD_BALANCER]: [
    COMPONENT_CATEGORIES.COMPUTE,
    COMPONENT_CATEGORIES.SERVERLESS,
    COMPONENT_CATEGORIES.OBSERVABILITY
  ],
  
  // compute or serverless → may connect to database, cache, storage, or async
  [COMPONENT_CATEGORIES.COMPUTE]: [
    COMPONENT_CATEGORIES.DATABASE,
    COMPONENT_CATEGORIES.CACHE,
    COMPONENT_CATEGORIES.STORAGE,
    COMPONENT_CATEGORIES.ASYNC,
    COMPONENT_CATEGORIES.OBSERVABILITY
  ],
  
  [COMPONENT_CATEGORIES.SERVERLESS]: [
    COMPONENT_CATEGORIES.DATABASE,
    COMPONENT_CATEGORIES.CACHE,
    COMPONENT_CATEGORIES.STORAGE,
    COMPONENT_CATEGORIES.ASYNC,
    COMPONENT_CATEGORIES.OBSERVABILITY
  ],
  
  // storage (S3) → may connect to async (S3 events)
  [COMPONENT_CATEGORIES.STORAGE]: [
    COMPONENT_CATEGORIES.ASYNC,
    COMPONENT_CATEGORIES.OBSERVABILITY
  ],
  
  // database → may connect to async (for events/streams)
  [COMPONENT_CATEGORIES.DATABASE]: [
    COMPONENT_CATEGORIES.ASYNC,
    COMPONENT_CATEGORIES.OBSERVABILITY
  ],
  
  // cache → may connect to observability
  [COMPONENT_CATEGORIES.CACHE]: [
    COMPONENT_CATEGORIES.OBSERVABILITY
  ],
  
  // async (SQS/SNS/EventBridge) → may connect to serverless or compute
  [COMPONENT_CATEGORIES.ASYNC]: [
    COMPONENT_CATEGORIES.SERVERLESS,
    COMPONENT_CATEGORIES.COMPUTE,
    COMPONENT_CATEGORIES.OBSERVABILITY
  ],
  
  // auth (Cognito) → may connect to edge, load_balancer, or serverless
  [COMPONENT_CATEGORIES.AUTH]: [
    COMPONENT_CATEGORIES.EDGE,
    COMPONENT_CATEGORIES.LOAD_BALANCER,
    COMPONENT_CATEGORIES.SERVERLESS,
    COMPONENT_CATEGORIES.OBSERVABILITY
  ],
  
  // security (WAF) → may connect to edge or load_balancer
  [COMPONENT_CATEGORIES.SECURITY]: [
    COMPONENT_CATEGORIES.EDGE,
    COMPONENT_CATEGORIES.LOAD_BALANCER,
    COMPONENT_CATEGORIES.OBSERVABILITY
  ],
  
  // observability SHALL NOT be the source of any connection
  [COMPONENT_CATEGORIES.OBSERVABILITY]: []
};

/**
 * Human-readable category names for display
 */
export const CATEGORY_DISPLAY_NAMES = {
  [COMPONENT_CATEGORIES.EDGE]: 'Edge/CDN',
  [COMPONENT_CATEGORIES.LOAD_BALANCER]: 'Load Balancer',
  [COMPONENT_CATEGORIES.COMPUTE]: 'Compute',
  [COMPONENT_CATEGORIES.SERVERLESS]: 'Serverless',
  [COMPONENT_CATEGORIES.STORAGE]: 'Storage',
  [COMPONENT_CATEGORIES.DATABASE]: 'Database',
  [COMPONENT_CATEGORIES.CACHE]: 'Cache',
  [COMPONENT_CATEGORIES.ASYNC]: 'Async/Integration',
  [COMPONENT_CATEGORIES.AUTH]: 'Authentication',
  [COMPONENT_CATEGORIES.SECURITY]: 'Security',
  [COMPONENT_CATEGORIES.OBSERVABILITY]: 'Observability'
};

/**
 * Check if a connection between two components is valid based on category rules
 * @param {Object} fromComponent - Source component with category property
 * @param {Object} toComponent - Target component with category property
 * @returns {boolean} - True if connection is valid
 */
export function isValidConnection(fromComponent, toComponent) {
  if (!fromComponent || !toComponent) return false;
  if (!fromComponent.category || !toComponent.category) return false;
  
  const allowedTargets = CONNECTION_RULES[fromComponent.category];
  if (!allowedTargets) return false;
  
  return allowedTargets.includes(toComponent.category);
}

/**
 * Get a helpful hint message for why a connection is invalid
 * @param {string} fromCategory - Source component category
 * @param {string} toCategory - Target component category
 * @returns {string} - Human-readable explanation
 */
export function getConnectionHint(fromCategory, toCategory) {
  const fromName = CATEGORY_DISPLAY_NAMES[fromCategory] || fromCategory;
  const toName = CATEGORY_DISPLAY_NAMES[toCategory] || toCategory;
  
  // Special case: observability cannot be a source
  if (fromCategory === COMPONENT_CATEGORIES.OBSERVABILITY) {
    return `${fromName} components receive data from other services but don't initiate connections. Try connecting from the other component instead.`;
  }
  
  const allowedTargets = CONNECTION_RULES[fromCategory];
  if (!allowedTargets || allowedTargets.length === 0) {
    return `${fromName} components cannot connect to other services.`;
  }
  
  const allowedNames = allowedTargets
    .filter(cat => cat !== COMPONENT_CATEGORIES.OBSERVABILITY)
    .map(cat => CATEGORY_DISPLAY_NAMES[cat])
    .join(', ');
  
  return `${fromName} components can connect to: ${allowedNames}. ${toName} is not a valid target.`;
}
