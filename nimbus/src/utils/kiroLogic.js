/**
 * Kiro Mascot Logic - Emotion state management and message queue
 * Requirements: 3.2, 3.3, 3.4, 3.5, 3.7
 */

// Emotion states for Kiro mascot
export const EMOTIONS = {
  IDLE: 'idle',
  ENCOURAGING: 'encouraging',
  CELEBRATING: 'celebrating',
  CONCERNED: 'concerned',
  TEACHING: 'teaching'
};

// Event types that trigger emotion changes
export const EVENTS = {
  SESSION_START: 'session_start',
  SESSION_COMPLETE: 'session_complete',
  SESSION_ABANDON: 'session_abandon',
  ARCHITECT_RESPONSE: 'architect_response',
  IDLE: 'idle'
};

/**
 * Maps application events to Kiro emotion states
 * @param {string} event - The event type from EVENTS
 * @returns {string} - The corresponding emotion from EMOTIONS
 * 
 * Requirements:
 * - 3.2: Session start → encouraging state
 * - 3.3: Session complete → celebrating state
 * - 3.4: Session abandon → concerned state
 * - 3.5: Architect response → teaching state
 */
export function getEmotionForEvent(event) {
  switch (event) {
    case EVENTS.SESSION_START:
      return EMOTIONS.ENCOURAGING;
    case EVENTS.SESSION_COMPLETE:
      return EMOTIONS.CELEBRATING;
    case EVENTS.SESSION_ABANDON:
      return EMOTIONS.CONCERNED;
    case EVENTS.ARCHITECT_RESPONSE:
      return EMOTIONS.TEACHING;
    case EVENTS.IDLE:
    default:
      return EMOTIONS.IDLE;
  }
}

/**
 * Message queue management for Kiro speech bubbles
 * Implements FIFO ordering per Requirement 3.7
 */
export function createMessageQueue() {
  let queue = [];

  return {
    /**
     * Add a message to the end of the queue
     * @param {Object} message - Message object with text, duration, timestamp
     */
    enqueue(message) {
      const messageWithTimestamp = {
        ...message,
        timestamp: message.timestamp || Date.now(),
        duration: message.duration || 5000 // Default 5 seconds
      };
      queue.push(messageWithTimestamp);
    },

    /**
     * Remove and return the first message from the queue
     * @returns {Object|null} - The first message or null if empty
     */
    dequeue() {
      if (queue.length === 0) {
        return null;
      }
      return queue.shift();
    },

    /**
     * View the first message without removing it
     * @returns {Object|null} - The first message or null if empty
     */
    peek() {
      if (queue.length === 0) {
        return null;
      }
      return queue[0];
    },

    /**
     * Check if the queue is empty
     * @returns {boolean}
     */
    isEmpty() {
      return queue.length === 0;
    },

    /**
     * Get the current queue length
     * @returns {number}
     */
    size() {
      return queue.length;
    },

    /**
     * Clear all messages from the queue
     */
    clear() {
      queue = [];
    },

    /**
     * Get all messages (for testing/debugging)
     * @returns {Array}
     */
    getAll() {
      return [...queue];
    }
  };
}

/**
 * Create a Kiro message object
 * @param {string} text - The message text
 * @param {number} duration - How long to display (ms), default 5000
 * @returns {Object} - Message object
 */
export function createMessage(text, duration = 5000) {
  return {
    text,
    duration,
    timestamp: Date.now()
  };
}
