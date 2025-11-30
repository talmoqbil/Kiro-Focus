/**
 * Cloud State Builder and Applier Utilities
 * Handles extracting persistable state and restoring from cloud
 * 
 * Requirements: 13.5
 */

const SESSION_HISTORY_LIMIT = 100;

/**
 * Build cloud state from application state
 * Extracts only the fields that should be persisted to cloud
 * @param {Object} state - The full application state
 * @returns {Object} Cloud state object ready for persistence
 */
export function buildCloudState(state) {
  const { userProgress, architecture } = state;
  
  return {
    credits: userProgress.credits,
    currentStreak: userProgress.currentStreak,
    lastSessionDate: userProgress.lastSessionDate,
    ownedComponents: [...userProgress.ownedComponents],
    placedComponents: [...architecture.placedComponents],
    connections: [...architecture.connections],
    // Limit session history to most recent 100 sessions
    sessionHistory: userProgress.sessionHistory.slice(-SESSION_HISTORY_LIMIT),
  };
}

/**
 * Apply cloud state to application state via actions
 * Restores persisted state from cloud
 * @param {Object} cloudState - The cloud state to restore
 * @param {Object} actions - The action dispatchers from AppContext
 */
export function applyCloudState(cloudState, actions) {
  if (!cloudState || !actions) {
    return;
  }

  // Build the state object for importState action
  const importData = {
    userProgress: {
      credits: cloudState.credits ?? 0,
      currentStreak: cloudState.currentStreak ?? 0,
      lastSessionDate: cloudState.lastSessionDate ?? null,
      ownedComponents: cloudState.ownedComponents ?? [],
      sessionHistory: cloudState.sessionHistory ?? [],
      // Calculate derived fields from session history
      sessionsCompleted: (cloudState.sessionHistory ?? []).filter(s => s.completed).length,
      totalSessionTime: (cloudState.sessionHistory ?? []).reduce((sum, s) => sum + (s.duration || 0), 0),
    },
    architecture: {
      placedComponents: cloudState.placedComponents ?? [],
      connections: cloudState.connections ?? [],
    },
  };

  actions.importState(importData);
}

/**
 * Validate cloud state structure
 * @param {Object} cloudState - The cloud state to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidCloudState(cloudState) {
  if (!cloudState || typeof cloudState !== 'object') {
    return false;
  }

  // Check required fields exist and have correct types
  if (typeof cloudState.credits !== 'number') return false;
  if (typeof cloudState.currentStreak !== 'number') return false;
  if (!Array.isArray(cloudState.ownedComponents)) return false;
  if (!Array.isArray(cloudState.placedComponents)) return false;
  if (!Array.isArray(cloudState.connections)) return false;
  if (!Array.isArray(cloudState.sessionHistory)) return false;

  return true;
}
