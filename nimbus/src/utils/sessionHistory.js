/**
 * Session History Utilities
 * 
 * Implements session grouping, statistics calculation, and streak tracking.
 * Uses local timezone for date grouping.
 * 
 * **Validates: Requirements 6.1, 6.2, 6.3**
 */

/**
 * Group sessions by date (Today, Yesterday, This Week, Last Week, Older).
 * Uses local timezone for date calculations.
 * 
 * @param {Array} sessions - Array of session objects
 * @returns {Object} - Sessions grouped by date category
 * 
 * **Validates: Requirements 6.1**
 */
export function groupSessionsByDate(sessions) {
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    lastWeek: [],
    older: []
  };

  if (!sessions || sessions.length === 0) {
    return groups;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000; // 24 hours in ms
  const thisWeekStart = todayStart - (now.getDay() * 86400000); // Sunday = week start
  const lastWeekStart = thisWeekStart - (7 * 86400000);

  // Sort sessions by startTime descending (most recent first)
  const sortedSessions = [...sessions].sort((a, b) => b.startTime - a.startTime);

  sortedSessions.forEach(session => {
    const sessionDate = new Date(session.startTime);
    const sessionDayStart = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate()
    ).getTime();

    if (sessionDayStart >= todayStart) {
      groups.today.push(session);
    } else if (sessionDayStart >= yesterdayStart) {
      groups.yesterday.push(session);
    } else if (sessionDayStart >= thisWeekStart) {
      groups.thisWeek.push(session);
    } else if (sessionDayStart >= lastWeekStart) {
      groups.lastWeek.push(session);
    } else {
      groups.older.push(session);
    }
  });

  return groups;
}

/**
 * Calculate summary statistics from session history.
 * 
 * @param {Array} sessions - Array of session objects
 * @returns {Object} - Statistics object
 * 
 * **Validates: Requirements 6.3**
 */
export function calculateStatistics(sessions) {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      totalFocusTime: 0,
      completionRate: 0,
      averageSessionLength: 0,
      currentStreak: 0,
      totalCreditsEarned: 0
    };
  }

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.completed).length;
  const totalFocusTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalCreditsEarned = sessions.reduce((sum, s) => sum + (s.creditsEarned || 0), 0);

  return {
    totalSessions,
    totalFocusTime,
    completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
    averageSessionLength: totalSessions > 0 ? totalFocusTime / totalSessions : 0,
    currentStreak: calculateStreak(sessions),
    totalCreditsEarned
  };
}

/**
 * Calculate current streak (consecutive days with at least one completed session).
 * Streak must end today or yesterday to be considered active.
 * 
 * @param {Array} sessions - Array of session objects
 * @returns {number} - Current streak count
 * 
 * **Validates: Requirements 6.3**
 */
export function calculateStreak(sessions) {
  if (!sessions || sessions.length === 0) {
    return 0;
  }

  // Filter to completed sessions only
  const completedSessions = sessions.filter(s => s.completed);
  if (completedSessions.length === 0) {
    return 0;
  }

  // Get unique dates with completed sessions (in local timezone)
  const sessionDates = new Set();
  completedSessions.forEach(session => {
    const date = new Date(session.startTime);
    const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    sessionDates.add(dateStr);
  });

  // Convert to sorted array of date strings
  const sortedDates = Array.from(sessionDates).sort().reverse();

  // Check if streak is active (last session was today or yesterday)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const yesterday = new Date(now.getTime() - 86400000);
  const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

  if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
    return 0; // Streak broken
  }

  // Count consecutive days
  let streak = 1;
  let currentDate = new Date(now);
  
  // If most recent session was yesterday, start from yesterday
  if (sortedDates[0] === yesterdayStr) {
    currentDate = yesterday;
  }

  for (let i = 1; i < 365; i++) { // Max 1 year lookback
    const prevDate = new Date(currentDate.getTime() - (i * 86400000));
    const prevDateStr = `${prevDate.getFullYear()}-${prevDate.getMonth()}-${prevDate.getDate()}`;
    
    if (sessionDates.has(prevDateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Format duration in seconds to human-readable string.
 * 
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted string (e.g., "1h 30m" or "45m")
 */
export function formatDuration(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Format timestamp to time string (HH:MM AM/PM).
 * 
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} - Formatted time string
 */
export function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

/**
 * Format timestamp to date string.
 * 
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} - Formatted date string
 */
export function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}
