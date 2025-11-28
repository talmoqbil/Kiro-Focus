/**
 * Credit Calculator Utilities
 * 
 * Implements all credit calculation formulas for Kiro Focus.
 * Base rate: 10 credits per 15 minutes of session duration.
 */

/**
 * Calculate base credits for a completed session.
 * Formula: floor(duration / 60 / 15) * 10 = floor(duration / 900) * 10
 * 
 * @param {number} duration - Session duration in seconds
 * @returns {number} Base credits earned
 * 
 * **Validates: Requirements 2.1**
 */
export function calculateBaseCredits(duration) {
  if (duration <= 0) return 0;
  // 10 credits per 15 minutes (900 seconds)
  return Math.floor(duration / 900) * 10;
}

/**
 * Calculate completion bonus for a session with zero pauses.
 * 20% bonus if pauseCount is 0, otherwise 0.
 * 
 * @param {number} baseCredits - The base credits earned
 * @param {number} pauseCount - Number of times the session was paused
 * @returns {number} Completion bonus credits
 * 
 * **Validates: Requirements 2.2**
 */
export function calculateCompletionBonus(baseCredits, pauseCount) {
  if (pauseCount === 0) {
    return Math.floor(baseCredits * 0.2);
  }
  return 0;
}

/**
 * Calculate streak bonus based on consecutive days.
 * 5% per consecutive day, maximum 50%.
 * 
 * @param {number} baseCredits - The base credits earned
 * @param {number} streak - Number of consecutive days with completed sessions
 * @returns {number} Streak bonus credits
 * 
 * **Validates: Requirements 2.3**
 */
export function calculateStreakBonus(baseCredits, streak) {
  if (streak <= 0) return 0;
  const bonusPercentage = Math.min(streak * 0.05, 0.5);
  return Math.floor(baseCredits * bonusPercentage);
}

/**
 * Calculate long session bonus for sessions >= 60 minutes.
 * 10% bonus for sessions 60 minutes or longer.
 * 
 * @param {number} baseCredits - The base credits earned
 * @param {number} duration - Session duration in seconds
 * @returns {number} Long session bonus credits
 * 
 * **Validates: Requirements 2.4**
 */
export function calculateLongSessionBonus(baseCredits, duration) {
  // 60 minutes = 3600 seconds
  if (duration >= 3600) {
    return Math.floor(baseCredits * 0.1);
  }
  return 0;
}

/**
 * Calculate partial credits for an abandoned session.
 * Awards 50% of credits earned for completed time.
 * 
 * @param {number} elapsedTime - Time elapsed before abandonment in seconds
 * @returns {number} Partial credits awarded
 * 
 * **Validates: Requirements 1.6, 2.5**
 */
export function calculatePartialCredits(elapsedTime) {
  if (elapsedTime <= 0) return 0;
  const baseCredits = calculateBaseCredits(elapsedTime);
  return Math.floor(baseCredits * 0.5);
}

/**
 * Calculate total credits for a session including all bonuses.
 * 
 * @param {Object} session - Session data
 * @param {number} session.duration - Session duration in seconds
 * @param {boolean} session.completed - Whether session was completed
 * @param {number} session.pauseCount - Number of pauses during session
 * @param {number} streak - Current streak (consecutive days)
 * @returns {Object} Credit breakdown with total
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
 */
export function calculateTotalCredits(session, streak) {
  const { duration, completed, pauseCount } = session;
  
  // Handle abandoned sessions
  if (!completed) {
    const partialCredits = calculatePartialCredits(duration);
    return {
      base: 0,
      completion: 0,
      streak: 0,
      longSession: 0,
      partial: partialCredits,
      total: partialCredits
    };
  }
  
  // Calculate all bonuses for completed sessions
  const base = calculateBaseCredits(duration);
  const completion = calculateCompletionBonus(base, pauseCount);
  const streakBonus = calculateStreakBonus(base, streak);
  const longSession = calculateLongSessionBonus(base, duration);
  
  const total = base + completion + streakBonus + longSession;
  
  return {
    base,
    completion,
    streak: streakBonus,
    longSession,
    partial: 0,
    total
  };
}
