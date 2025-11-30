/**
 * Timer Logic Utilities
 * 
 * Implements timer state management with drift correction for Kiro Focus.
 * Uses timestamps to maintain accuracy even when browser tab is inactive.
 */

/**
 * Preset durations available for focus sessions
 */
export const PRESET_DURATIONS = [
  { label: "Quick Focus", minutes: 15, seconds: 900 },
  { label: "Pomodoro", minutes: 25, seconds: 1500 },
  { label: "Deep Work", minutes: 45, seconds: 2700 },
  { label: "Flow State", minutes: 60, seconds: 3600 },
  { label: "Ultra Deep", minutes: 90, seconds: 5400 }
];

/**
 * Start a new timer with the given duration.
 * Returns initial timer state with startTime timestamp.
 * 
 * @param {number} duration - Duration in seconds
 * @returns {Object} Initial timer state
 * 
 * **Validates: Requirements 1.1**
 */
export function startTimer(duration) {
  return {
    isActive: true,
    isPaused: false,
    timeRemaining: duration,
    totalDuration: duration,
    startTime: Date.now(),
    pauseCount: 0,
    pausedAt: null,
    totalPausedTime: 0
  };
}

/**
 * Pause an active timer.
 * Freezes timeRemaining and increments pauseCount.
 * 
 * @param {Object} state - Current timer state
 * @returns {Object} Paused timer state
 * 
 * **Validates: Requirements 1.3**
 */
export function pauseTimer(state) {
  if (!state.isActive || state.isPaused) {
    return state;
  }
  
  return {
    ...state,
    isPaused: true,
    pauseCount: state.pauseCount + 1,
    pausedAt: Date.now()
  };
}


/**
 * Resume a paused timer.
 * Continues from the exact paused timeRemaining value.
 * 
 * @param {Object} state - Current timer state
 * @returns {Object} Resumed timer state
 * 
 * **Validates: Requirements 1.4**
 */
export function resumeTimer(state) {
  if (!state.isActive || !state.isPaused) {
    return state;
  }
  
  // Calculate how long we were paused and add to total paused time
  const pauseDuration = state.pausedAt ? Date.now() - state.pausedAt : 0;
  
  return {
    ...state,
    isPaused: false,
    pausedAt: null,
    totalPausedTime: state.totalPausedTime + pauseDuration
  };
}

/**
 * Tick the timer by one second with drift correction.
 * Compares actual elapsed time to expected time and corrects if drift > 2s.
 * 
 * @param {Object} state - Current timer state
 * @returns {Object} Updated timer state
 * 
 * **Validates: Requirements 12.1, 12.2, 12.3**
 */
export function tickTimer(state) {
  if (!state.isActive || state.isPaused) {
    return state;
  }
  
  // Calculate actual elapsed time accounting for pauses
  const now = Date.now();
  const totalElapsed = now - state.startTime;
  const activeElapsed = totalElapsed - state.totalPausedTime;
  const actualElapsedSeconds = activeElapsed / 1000;
  
  // Calculate expected remaining time based on actual elapsed
  const expectedRemaining = state.totalDuration - actualElapsedSeconds;
  
  // Simple decrement
  const newTimeRemaining = state.timeRemaining - 1;
  
  // Check for drift > 2 seconds
  const drift = Math.abs(expectedRemaining - newTimeRemaining);
  
  if (drift > 2) {
    // Correct drift by using actual elapsed time
    return {
      ...state,
      timeRemaining: Math.max(0, Math.floor(expectedRemaining))
    };
  }
  
  return {
    ...state,
    timeRemaining: Math.max(0, newTimeRemaining)
  };
}

/**
 * Correct timer drift if it exceeds 2 seconds.
 * Uses timestamps to calculate actual elapsed time.
 * 
 * @param {Object} state - Current timer state
 * @returns {Object} Corrected timer state
 * 
 * **Validates: Requirements 12.1, 12.2, 12.3**
 */
export function correctDrift(state) {
  if (!state.isActive || !state.startTime) {
    return state;
  }
  
  // Calculate actual elapsed time accounting for pauses
  const now = Date.now();
  const totalElapsed = now - state.startTime;
  const activeElapsed = totalElapsed - (state.totalPausedTime || 0);
  
  // If currently paused, also subtract time since pause started
  const pauseAdjustment = state.isPaused && state.pausedAt 
    ? now - state.pausedAt 
    : 0;
  
  const actualElapsedSeconds = (activeElapsed - pauseAdjustment) / 1000;
  const expectedRemaining = state.totalDuration - actualElapsedSeconds;
  
  // Check for drift > 2 seconds
  const drift = Math.abs(expectedRemaining - state.timeRemaining);
  
  if (drift > 2) {
    return {
      ...state,
      timeRemaining: Math.max(0, Math.floor(expectedRemaining))
    };
  }
  
  return state;
}

/**
 * Calculate progress percentage for the progress ring.
 * Returns percentage of elapsed time (0-100).
 * 
 * @param {Object} state - Current timer state
 * @returns {number} Progress percentage (0-100)
 * 
 * **Validates: Requirements 1.2**
 */
export function calculateProgress(state) {
  if (!state.totalDuration || state.totalDuration <= 0) {
    return 0;
  }
  
  if (state.timeRemaining < 0) {
    return 100;
  }
  
  const elapsed = state.totalDuration - state.timeRemaining;
  const progress = (elapsed / state.totalDuration) * 100;
  
  // Bound between 0 and 100
  return Math.max(0, Math.min(100, progress));
}

/**
 * Check if timer is in the final minute (last 60 seconds).
 * 
 * @param {Object} state - Current timer state
 * @returns {boolean} True if in final minute
 * 
 * **Validates: Requirements 1.7**
 */
export function isFinalMinute(state) {
  return state.timeRemaining <= 60 && state.timeRemaining > 0;
}

/**
 * Check if session is complete (timeRemaining reached 0).
 * 
 * @param {Object} state - Current timer state
 * @returns {boolean} True if session is complete
 * 
 * **Validates: Requirements 1.5**
 */
export function isSessionComplete(state) {
  return state.isActive && state.timeRemaining <= 0;
}

/**
 * Format time remaining as MM:SS string.
 * 
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.max(0, seconds) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate elapsed time for a session (for partial credit calculation).
 * 
 * @param {Object} state - Current timer state
 * @returns {number} Elapsed time in seconds
 */
export function getElapsedTime(state) {
  if (!state.totalDuration) return 0;
  return state.totalDuration - state.timeRemaining;
}
