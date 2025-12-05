/**
 * Storage Helpers - Export/Import Functionality
 * 
 * Handles data persistence via JSON export/import (no localStorage).
 * Includes version checking and validation.
 * 
 * **Validates: Requirements 10.2, 10.3, 10.4, 10.5, 10.6**
 */

// Current application version for export/import compatibility
export const CURRENT_VERSION = '1.0.0';

/**
 * Export user data to JSON string.
 * Includes version, export date, user progress, and architecture.
 * 
 * @param {Object} userProgress - User progress state
 * @param {Object} architecture - Architecture state
 * @returns {string} - JSON string of export data
 * 
 * **Validates: Requirements 10.2, 10.4**
 */
export function exportData(userProgress, architecture) {
  const exportPayload = {
    version: CURRENT_VERSION,
    exportDate: new Date().toISOString(),
    userProgress: {
      credits: userProgress.credits,
      totalSessionTime: userProgress.totalSessionTime,
      sessionsCompleted: userProgress.sessionsCompleted,
      currentStreak: userProgress.currentStreak,
      lastSessionDate: userProgress.lastSessionDate,
      ownedComponents: userProgress.ownedComponents,
      sessionHistory: userProgress.sessionHistory
    },
    architecture: {
      placedComponents: architecture.placedComponents,
      connections: architecture.connections
    }
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Validate import data structure and version.
 * Returns validation result with errors if any.
 * 
 * @param {string} jsonString - JSON string to validate
 * @returns {Object} - { valid: boolean, data?: Object, error?: string }
 * 
 * **Validates: Requirements 10.5, 10.6**
 */
export function validateImportData(jsonString) {
  // Try to parse JSON
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    return {
      valid: false,
      error: 'Invalid JSON format: Unable to parse file'
    };
  }

  // Check for required top-level fields
  if (!data.version) {
    return {
      valid: false,
      error: 'Missing version field in backup file'
    };
  }

  // Version check - reject mismatched versions
  if (data.version !== CURRENT_VERSION) {
    return {
      valid: false,
      error: `Version mismatch: Expected ${CURRENT_VERSION}, got ${data.version}`
    };
  }

  // Check for userProgress
  if (!data.userProgress) {
    return {
      valid: false,
      error: 'Missing userProgress data in backup file'
    };
  }

  // Validate userProgress structure
  const requiredUserFields = ['credits', 'ownedComponents', 'sessionHistory'];
  for (const field of requiredUserFields) {
    if (data.userProgress[field] === undefined) {
      return {
        valid: false,
        error: `Missing required field: userProgress.${field}`
      };
    }
  }

  // Validate types
  if (typeof data.userProgress.credits !== 'number') {
    return {
      valid: false,
      error: 'Invalid data type: credits must be a number'
    };
  }

  if (!Array.isArray(data.userProgress.ownedComponents)) {
    return {
      valid: false,
      error: 'Invalid data type: ownedComponents must be an array'
    };
  }

  if (!Array.isArray(data.userProgress.sessionHistory)) {
    return {
      valid: false,
      error: 'Invalid data type: sessionHistory must be an array'
    };
  }

  // Validate session history entries
  for (let i = 0; i < data.userProgress.sessionHistory.length; i++) {
    const session = data.userProgress.sessionHistory[i];
    if (!session.id || session.startTime === undefined || session.duration === undefined) {
      return {
        valid: false,
        error: `Invalid session entry at index ${i}: missing required fields`
      };
    }
  }

  // Check architecture if present
  if (data.architecture) {
    if (data.architecture.placedComponents && !Array.isArray(data.architecture.placedComponents)) {
      return {
        valid: false,
        error: 'Invalid data type: placedComponents must be an array'
      };
    }
    if (data.architecture.connections && !Array.isArray(data.architecture.connections)) {
      return {
        valid: false,
        error: 'Invalid data type: connections must be an array'
      };
    }
  }

  return {
    valid: true,
    data
  };
}

/**
 * Import data from JSON string.
 * Validates and returns parsed state or error.
 * 
 * @param {string} jsonString - JSON string to import
 * @returns {Object} - { success: boolean, data?: Object, error?: string }
 * 
 * **Validates: Requirements 10.3, 10.5, 10.6**
 */
export function importData(jsonString) {
  const validation = validateImportData(jsonString);

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }

  const data = validation.data;

  // Normalize and return the data
  return {
    success: true,
    data: {
      userProgress: {
        credits: data.userProgress.credits || 0,
        totalSessionTime: data.userProgress.totalSessionTime || 0,
        sessionsCompleted: data.userProgress.sessionsCompleted || 0,
        currentStreak: data.userProgress.currentStreak || 0,
        lastSessionDate: data.userProgress.lastSessionDate || null,
        ownedComponents: data.userProgress.ownedComponents || [],
        sessionHistory: data.userProgress.sessionHistory || []
      },
      architecture: {
        placedComponents: data.architecture?.placedComponents || [],
        connections: data.architecture?.connections || []
      }
    }
  };
}

/**
 * Trigger file download with the given content.
 * 
 * @param {string} content - File content
 * @param {string} filename - Name for the downloaded file
 */
export function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate a filename for export with current date.
 * 
 * @returns {string} - Filename like "nimbus-backup-2024-01-15.json"
 */
export function generateExportFilename() {
  const date = new Date().toISOString().split('T')[0];
  return `nimbus-backup-${date}.json`;
}
