/**
 * Cloud State API Client
 * Handles communication with the cloud backend for state persistence
 * 
 * Requirements: 13.3, 13.10, 13.11
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Load state from cloud backend
 * @param {string} userId - The anonymous user ID
 * @returns {Promise<Object|null>} The cloud state or null if not found/error
 */
export async function loadStateFromCloud(userId) {
  if (!API_BASE_URL || !userId) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/state?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Cloud state load failed:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.state) {
      return data.state;
    }
    
    return null;
  } catch (error) {
    // Graceful degradation - log but don't throw
    console.warn('Cloud state load error:', error.message);
    return null;
  }
}

/**
 * Save state to cloud backend
 * @param {string} userId - The anonymous user ID
 * @param {Object} state - The cloud state to save
 * @returns {Promise<boolean>} True if save succeeded, false otherwise
 */
export async function saveStateToCloud(userId, state) {
  if (!API_BASE_URL || !userId || !state) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/state`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, state }),
    });

    if (!response.ok) {
      console.warn('Cloud state save failed:', response.status);
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    // Graceful degradation - log but don't throw
    console.warn('Cloud state save error:', error.message);
    return false;
  }
}
