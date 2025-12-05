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
 * @param {string} fromName - Source component name (optional)
 * @param {string} toName - Target component name (optional)
 * @returns {string} - Human-readable explanation
 */
export function getConnectionHint(fromCategory, toCategory, fromName = null, toName = null) {
  const fromCatName = CATEGORY_DISPLAY_NAMES[fromCategory] || fromCategory;
  const toCatName = CATEGORY_DISPLAY_NAMES[toCategory] || toCategory;
  const sourceName = fromName || fromCatName;
  const targetName = toName || toCatName;
  
  // Special case: observability cannot be a source
  if (fromCategory === COMPONENT_CATEGORIES.OBSERVABILITY) {
    return `${sourceName} receives metrics from other services - it doesn't initiate connections. Try connecting TO it from ${targetName} instead!`;
  }
  
  // Special case: same category connections (usually invalid)
  if (fromCategory === toCategory && fromCategory !== COMPONENT_CATEGORIES.EDGE) {
    return `${sourceName} and ${targetName} are both ${fromCatName} services. In real architectures, you'd typically connect different service types together.`;
  }
  
  // Specific architectural guidance based on categories
  const specificHints = {
    [`${COMPONENT_CATEGORIES.DATABASE}-${COMPONENT_CATEGORIES.COMPUTE}`]: 
      `Databases don't call compute services - it's the other way around! Connect your ${targetName} TO ${sourceName} instead.`,
    [`${COMPONENT_CATEGORIES.DATABASE}-${COMPONENT_CATEGORIES.SERVERLESS}`]: 
      `Databases store data, they don't call functions. Connect your ${targetName} TO ${sourceName} to read/write data.`,
    [`${COMPONENT_CATEGORIES.STORAGE}-${COMPONENT_CATEGORIES.COMPUTE}`]: 
      `Storage services don't call compute directly. Connect ${targetName} TO ${sourceName}, or use events via SQS/SNS.`,
    [`${COMPONENT_CATEGORIES.CACHE}-${COMPONENT_CATEGORIES.DATABASE}`]: 
      `Cache sits in front of databases, not behind them. Your compute should connect to cache, which then connects to the database.`,
    [`${COMPONENT_CATEGORIES.COMPUTE}-${COMPONENT_CATEGORIES.EDGE}`]: 
      `Traffic flows from edge TO compute, not the other way. ${sourceName} should receive requests from ${targetName}.`,
    [`${COMPONENT_CATEGORIES.SERVERLESS}-${COMPONENT_CATEGORIES.EDGE}`]: 
      `Traffic flows from edge TO serverless functions. ${targetName} should connect TO ${sourceName}.`,
  };
  
  const key = `${fromCategory}-${toCategory}`;
  if (specificHints[key]) {
    return specificHints[key];
  }
  
  const allowedTargets = CONNECTION_RULES[fromCategory];
  if (!allowedTargets || allowedTargets.length === 0) {
    return `${sourceName} doesn't typically initiate connections to other services.`;
  }
  
  const allowedNames = allowedTargets
    .filter(cat => cat !== COMPONENT_CATEGORIES.OBSERVABILITY)
    .slice(0, 3) // Limit to 3 suggestions
    .map(cat => CATEGORY_DISPLAY_NAMES[cat])
    .join(', ');
  
  return `${sourceName} typically connects to ${allowedNames} services. Try connecting it to one of those instead!`;
}
