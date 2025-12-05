/**
 * Shop Logic Utilities
 * 
 * Implements purchase logic for the component shop.
 * Handles credit checking, prerequisite validation, and purchase processing.
 * 
 * **Validates: Requirements 4.2, 4.3, 4.4, 4.5**
 */

import { getComponentById } from '../data/components';

/**
 * Check if a component can be purchased.
 * Returns true if user has sufficient credits AND all prerequisites are met.
 * Only EC2 can be purchased multiple times (for multiple instances).
 * 
 * @param {Object} component - Component to check
 * @param {number} credits - User's current credits
 * @param {string[]} ownedComponents - Array of owned component IDs
 * @returns {Object} - { canPurchase: boolean, reason: string }
 * 
 * **Validates: Requirements 4.2, 4.3, 4.4**
 */
export function canPurchase(component, credits, ownedComponents) {
  // Check if already owned (except EC2 which can have multiple instances)
  if (component.id !== 'ec2' && ownedComponents.includes(component.id)) {
    return {
      canPurchase: false,
      reason: 'already_owned',
      message: 'You already own this component'
    };
  }

  // Check prerequisites first (must own at least one of each prerequisite)
  const prereqResult = checkPrerequisites(component, ownedComponents);
  if (!prereqResult.met) {
    return {
      canPurchase: false,
      reason: 'prerequisites_not_met',
      message: prereqResult.message,
      missingPrerequisites: prereqResult.missing
    };
  }

  // Check credits
  if (credits < component.cost) {
    return {
      canPurchase: false,
      reason: 'insufficient_credits',
      message: `Need ${component.cost - credits} more credits`,
      shortage: component.cost - credits
    };
  }

  return {
    canPurchase: true,
    reason: 'available',
    message: 'Ready to purchase'
  };
}

/**
 * Check if all prerequisites for a component are met.
 * 
 * @param {Object} component - Component to check
 * @param {string[]} ownedComponents - Array of owned component IDs
 * @returns {Object} - { met: boolean, missing: string[], message: string }
 * 
 * **Validates: Requirements 4.4**
 */
export function checkPrerequisites(component, ownedComponents) {
  // No prerequisites means always met
  if (!component.prerequisites || component.prerequisites.length === 0) {
    return {
      met: true,
      missing: [],
      message: 'No prerequisites required'
    };
  }

  // Find missing prerequisites
  const missing = component.prerequisites.filter(
    prereqId => !ownedComponents.includes(prereqId)
  );

  if (missing.length === 0) {
    return {
      met: true,
      missing: [],
      message: 'All prerequisites met'
    };
  }

  // Get names of missing prerequisites for display
  const missingNames = missing.map(id => {
    const prereq = getComponentById(id);
    return prereq ? prereq.name : id;
  });

  return {
    met: false,
    missing,
    missingNames,
    message: `Requires: ${missingNames.join(', ')}`
  };
}

/**
 * Process a component purchase.
 * Deducts credits and adds component to owned list.
 * 
 * @param {Object} component - Component being purchased
 * @param {number} credits - User's current credits
 * @param {string[]} ownedComponents - Array of owned component IDs
 * @returns {Object} - { success: boolean, newCredits: number, newOwnedComponents: string[], error?: string }
 * 
 * **Validates: Requirements 4.5**
 */
export function processPurchase(component, credits, ownedComponents) {
  // Validate purchase is allowed
  const purchaseCheck = canPurchase(component, credits, ownedComponents);
  
  if (!purchaseCheck.canPurchase) {
    return {
      success: false,
      newCredits: credits,
      newOwnedComponents: ownedComponents,
      error: purchaseCheck.message
    };
  }

  // Process the purchase
  const newCredits = credits - component.cost;
  const newOwnedComponents = [...ownedComponents, component.id];

  return {
    success: true,
    newCredits,
    newOwnedComponents,
    creditsSpent: component.cost,
    componentPurchased: component.id
  };
}

/**
 * Get the purchase state for a component (for UI display).
 * Only EC2 can be purchased multiple times.
 * 
 * @param {Object} component - Component to check
 * @param {number} credits - User's current credits
 * @param {string[]} ownedComponents - Array of owned component IDs
 * @returns {string} - 'owned' | 'available' | 'insufficient' | 'locked'
 */
export function getPurchaseState(component, credits, ownedComponents) {
  // Check if already owned (except EC2 which can have multiple instances)
  if (component.id !== 'ec2' && ownedComponents.includes(component.id)) {
    return 'owned';
  }

  // Check prerequisites (must own at least one of each prerequisite)
  const prereqResult = checkPrerequisites(component, ownedComponents);
  if (!prereqResult.met) {
    return 'locked';
  }

  if (credits < component.cost) {
    return 'insufficient';
  }

  return 'available';
}

/**
 * Check if user owns at least one of this component type.
 * Used for displaying "owned" badge while still allowing re-purchase.
 * 
 * @param {string} componentId - Component ID to check
 * @param {string[]} ownedComponents - Array of owned component IDs
 * @returns {boolean}
 */
export function isComponentOwned(componentId, ownedComponents) {
  return ownedComponents.includes(componentId);
}
