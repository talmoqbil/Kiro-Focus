/**
 * User ID Management Utility
 * Generates and persists anonymous user IDs for cloud state sync
 * 
 * Requirements: 13.1, 13.2
 */

const USER_ID_KEY = 'nimbus-user-id';

/**
 * Get or create anonymous user ID
 * Uses localStorage to persist across sessions
 * @returns {string} The user's unique anonymous ID
 */
export function getOrCreateUserId() {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

/**
 * Get the current user ID without creating one
 * @returns {string|null} The user's ID or null if not set
 */
export function getUserId() {
  return localStorage.getItem(USER_ID_KEY);
}

/**
 * Clear the user ID (useful for testing or reset)
 */
export function clearUserId() {
  localStorage.removeItem(USER_ID_KEY);
}
