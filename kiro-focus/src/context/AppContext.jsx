import { createContext, useContext, useReducer, useCallback } from 'react';

// Initial state based on design document data models
const initialState = {
  // User Progress State
  userProgress: {
    credits: 1000, // Starting credits for testing
    totalSessionTime: 0, // seconds
    sessionsCompleted: 0,
    currentStreak: 0,
    lastSessionDate: null, // ISO date string
    ownedComponents: [], // component ids
    sessionHistory: [], // Session[]
  },
  
  // Timer State
  timerState: {
    isActive: false,
    isPaused: false,
    timeRemaining: 0, // seconds
    totalDuration: 0, // seconds
    startTime: null, // timestamp
    pauseCount: 0,
    pausedAt: null, // timestamp when paused
    totalPausedTime: 0, // total ms spent paused
  },
  
  // Architecture State
  architecture: {
    placedComponents: [], // PlacedComponent[]
    connections: [], // Connection[]
  },
  
  // UI State
  uiState: {
    activeView: 'timer', // 'timer' | 'shop' | 'canvas' | 'history'
    kiroMessage: null, // KiroMessage | null
    kiroEmotion: 'idle', // EmotionState
    showModal: null, // modal id or null
    messageQueue: [], // KiroMessage[]
  },
  
  // Agent State - Welcome-back message cooldown tracking
  // **Validates: Requirements 20.1**
  agentState: {
    lastWelcomeBackTimestamp: null, // Unix timestamp of last welcome-back message
    welcomeBackShownThisSession: false, // Resets on page load
  },
  
  // Goal State - User's architecture goal and recommendations
  // **Validates: Requirements 19.4**
  goalState: {
    goalText: null, // User's goal description (e.g., "static website", "serverless API")
    adviceText: null, // AI-generated advice summary
    recommendedServiceTypes: [], // Array of component IDs to highlight
    timestamp: null, // When the goal was set
  },
};

// Action types
const ActionTypes = {
  // User Progress
  SET_CREDITS: 'SET_CREDITS',
  ADD_CREDITS: 'ADD_CREDITS',
  SPEND_CREDITS: 'SPEND_CREDITS',
  ADD_SESSION: 'ADD_SESSION',
  UPDATE_STREAK: 'UPDATE_STREAK',
  ADD_OWNED_COMPONENT: 'ADD_OWNED_COMPONENT',
  
  // Timer
  SET_TIMER_STATE: 'SET_TIMER_STATE',
  START_TIMER: 'START_TIMER',
  PAUSE_TIMER: 'PAUSE_TIMER',
  RESUME_TIMER: 'RESUME_TIMER',
  TICK_TIMER: 'TICK_TIMER',
  RESET_TIMER: 'RESET_TIMER',
  
  // Architecture
  PLACE_COMPONENT: 'PLACE_COMPONENT',
  REMOVE_COMPONENT: 'REMOVE_COMPONENT',
  UPGRADE_COMPONENT: 'UPGRADE_COMPONENT',
  ADD_CONNECTION: 'ADD_CONNECTION',
  
  // UI
  SET_ACTIVE_VIEW: 'SET_ACTIVE_VIEW',
  SET_KIRO_MESSAGE: 'SET_KIRO_MESSAGE',
  SET_KIRO_EMOTION: 'SET_KIRO_EMOTION',
  ENQUEUE_MESSAGE: 'ENQUEUE_MESSAGE',
  DEQUEUE_MESSAGE: 'DEQUEUE_MESSAGE',
  SET_MODAL: 'SET_MODAL',
  
  // Agent State
  SET_WELCOME_BACK_SHOWN: 'SET_WELCOME_BACK_SHOWN',
  
  // Goal State
  SET_GOAL_ADVICE: 'SET_GOAL_ADVICE',
  CLEAR_GOAL: 'CLEAR_GOAL',
  
  // Import/Export
  IMPORT_STATE: 'IMPORT_STATE',
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    // User Progress actions
    case ActionTypes.SET_CREDITS:
      return {
        ...state,
        userProgress: { ...state.userProgress, credits: action.payload },
      };
    
    case ActionTypes.ADD_CREDITS:
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          credits: state.userProgress.credits + action.payload,
        },
      };
    
    case ActionTypes.SPEND_CREDITS:
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          credits: Math.max(0, state.userProgress.credits - action.payload),
        },
      };
    
    case ActionTypes.ADD_SESSION:
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          sessionHistory: [...state.userProgress.sessionHistory, action.payload],
          sessionsCompleted: action.payload.completed
            ? state.userProgress.sessionsCompleted + 1
            : state.userProgress.sessionsCompleted,
          totalSessionTime: state.userProgress.totalSessionTime + action.payload.duration,
          lastSessionDate: new Date().toISOString().split('T')[0],
        },
      };
    
    case ActionTypes.UPDATE_STREAK:
      return {
        ...state,
        userProgress: { ...state.userProgress, currentStreak: action.payload },
      };
    
    case ActionTypes.ADD_OWNED_COMPONENT:
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          ownedComponents: [...state.userProgress.ownedComponents, action.payload],
        },
      };
    
    // Timer actions
    case ActionTypes.SET_TIMER_STATE:
      return {
        ...state,
        timerState: { ...state.timerState, ...action.payload },
      };
    
    case ActionTypes.START_TIMER:
      return {
        ...state,
        timerState: {
          isActive: true,
          isPaused: false,
          timeRemaining: action.payload.duration,
          totalDuration: action.payload.duration,
          startTime: Date.now(),
          pauseCount: 0,
          pausedAt: null,
          totalPausedTime: 0,
        },
      };
    
    case ActionTypes.PAUSE_TIMER:
      return {
        ...state,
        timerState: {
          ...state.timerState,
          isPaused: true,
          pauseCount: state.timerState.pauseCount + 1,
          pausedAt: Date.now(),
        },
      };
    
    case ActionTypes.RESUME_TIMER: {
      const pauseDuration = state.timerState.pausedAt 
        ? Date.now() - state.timerState.pausedAt 
        : 0;
      return {
        ...state,
        timerState: {
          ...state.timerState,
          isPaused: false,
          pausedAt: null,
          totalPausedTime: state.timerState.totalPausedTime + pauseDuration,
        },
      };
    }
    
    case ActionTypes.TICK_TIMER:
      return {
        ...state,
        timerState: {
          ...state.timerState,
          timeRemaining: action.payload,
        },
      };
    
    case ActionTypes.RESET_TIMER:
      return {
        ...state,
        timerState: initialState.timerState,
      };
    
    // Architecture actions
    case ActionTypes.PLACE_COMPONENT:
      return {
        ...state,
        architecture: {
          ...state.architecture,
          placedComponents: [...state.architecture.placedComponents, action.payload],
        },
      };
    
    case ActionTypes.REMOVE_COMPONENT:
      return {
        ...state,
        architecture: {
          ...state.architecture,
          placedComponents: state.architecture.placedComponents.filter(
            (c) => c.id !== action.payload
          ),
          connections: state.architecture.connections.filter(
            (conn) => conn.from !== action.payload && conn.to !== action.payload
          ),
        },
      };
    
    case ActionTypes.ADD_CONNECTION:
      return {
        ...state,
        architecture: {
          ...state.architecture,
          connections: [...state.architecture.connections, action.payload],
        },
      };
    
    case ActionTypes.UPGRADE_COMPONENT:
      return {
        ...state,
        architecture: {
          ...state.architecture,
          placedComponents: state.architecture.placedComponents.map((c) =>
            c.id === action.payload.componentId
              ? { ...c, tier: action.payload.newTier }
              : c
          ),
        },
      };
    
    // UI actions
    case ActionTypes.SET_ACTIVE_VIEW:
      return {
        ...state,
        uiState: { ...state.uiState, activeView: action.payload },
      };
    
    case ActionTypes.SET_KIRO_MESSAGE:
      return {
        ...state,
        uiState: { ...state.uiState, kiroMessage: action.payload },
      };
    
    case ActionTypes.SET_KIRO_EMOTION:
      return {
        ...state,
        uiState: { ...state.uiState, kiroEmotion: action.payload },
      };
    
    case ActionTypes.ENQUEUE_MESSAGE:
      return {
        ...state,
        uiState: {
          ...state.uiState,
          messageQueue: [...state.uiState.messageQueue, action.payload],
        },
      };
    
    case ActionTypes.DEQUEUE_MESSAGE:
      return {
        ...state,
        uiState: {
          ...state.uiState,
          messageQueue: state.uiState.messageQueue.slice(1),
        },
      };
    
    case ActionTypes.SET_MODAL:
      return {
        ...state,
        uiState: { ...state.uiState, showModal: action.payload },
      };
    
    // Agent State actions
    // **Validates: Requirements 20.1**
    case ActionTypes.SET_WELCOME_BACK_SHOWN:
      return {
        ...state,
        agentState: {
          ...state.agentState,
          lastWelcomeBackTimestamp: Date.now(),
          welcomeBackShownThisSession: true,
        },
      };
    
    // Goal State actions
    // **Validates: Requirements 19.4**
    case ActionTypes.SET_GOAL_ADVICE:
      return {
        ...state,
        goalState: {
          goalText: action.payload.goalText,
          adviceText: action.payload.adviceText,
          recommendedServiceTypes: action.payload.recommendedServiceTypes || [],
          timestamp: Date.now(),
        },
      };
    
    case ActionTypes.CLEAR_GOAL:
      return {
        ...state,
        goalState: initialState.goalState,
      };
    
    // Import state
    case ActionTypes.IMPORT_STATE:
      return {
        ...state,
        userProgress: action.payload.userProgress || state.userProgress,
        architecture: action.payload.architecture || state.architecture,
      };
    
    default:
      return state;
  }
}

// Create context
const AppContext = createContext(null);

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Action creators
  const actions = {
    // Credits
    setCredits: useCallback((credits) => 
      dispatch({ type: ActionTypes.SET_CREDITS, payload: credits }), []),
    addCredits: useCallback((amount) => 
      dispatch({ type: ActionTypes.ADD_CREDITS, payload: amount }), []),
    spendCredits: useCallback((amount) => 
      dispatch({ type: ActionTypes.SPEND_CREDITS, payload: amount }), []),
    
    // Sessions
    addSession: useCallback((session) => 
      dispatch({ type: ActionTypes.ADD_SESSION, payload: session }), []),
    updateStreak: useCallback((streak) => 
      dispatch({ type: ActionTypes.UPDATE_STREAK, payload: streak }), []),
    
    // Components
    addOwnedComponent: useCallback((componentId) => 
      dispatch({ type: ActionTypes.ADD_OWNED_COMPONENT, payload: componentId }), []),
    
    // Timer
    startTimer: useCallback((duration) => 
      dispatch({ type: ActionTypes.START_TIMER, payload: { duration } }), []),
    pauseTimer: useCallback(() => 
      dispatch({ type: ActionTypes.PAUSE_TIMER }), []),
    resumeTimer: useCallback(() => 
      dispatch({ type: ActionTypes.RESUME_TIMER }), []),
    tickTimer: useCallback((timeRemaining) => 
      dispatch({ type: ActionTypes.TICK_TIMER, payload: timeRemaining }), []),
    resetTimer: useCallback(() => 
      dispatch({ type: ActionTypes.RESET_TIMER }), []),
    setTimerState: useCallback((timerState) => 
      dispatch({ type: ActionTypes.SET_TIMER_STATE, payload: timerState }), []),
    
    // Architecture
    placeComponent: useCallback((component) => 
      dispatch({ type: ActionTypes.PLACE_COMPONENT, payload: component }), []),
    removeComponent: useCallback((componentId) => 
      dispatch({ type: ActionTypes.REMOVE_COMPONENT, payload: componentId }), []),
    upgradeComponent: useCallback((componentId, newTier) => 
      dispatch({ type: ActionTypes.UPGRADE_COMPONENT, payload: { componentId, newTier } }), []),
    addConnection: useCallback((connection) => 
      dispatch({ type: ActionTypes.ADD_CONNECTION, payload: connection }), []),
    
    // UI
    setActiveView: useCallback((view) => 
      dispatch({ type: ActionTypes.SET_ACTIVE_VIEW, payload: view }), []),
    setKiroMessage: useCallback((message) => 
      dispatch({ type: ActionTypes.SET_KIRO_MESSAGE, payload: message }), []),
    setKiroEmotion: useCallback((emotion) => 
      dispatch({ type: ActionTypes.SET_KIRO_EMOTION, payload: emotion }), []),
    enqueueMessage: useCallback((message) => 
      dispatch({ type: ActionTypes.ENQUEUE_MESSAGE, payload: message }), []),
    dequeueMessage: useCallback(() => 
      dispatch({ type: ActionTypes.DEQUEUE_MESSAGE }), []),
    setModal: useCallback((modalId) => 
      dispatch({ type: ActionTypes.SET_MODAL, payload: modalId }), []),
    
    // Agent State
    markWelcomeBackShown: useCallback(() => 
      dispatch({ type: ActionTypes.SET_WELCOME_BACK_SHOWN }), []),
    
    // Goal State
    setGoalAdvice: useCallback((goalText, adviceText, recommendedServiceTypes) => 
      dispatch({ type: ActionTypes.SET_GOAL_ADVICE, payload: { goalText, adviceText, recommendedServiceTypes } }), []),
    clearGoal: useCallback(() => 
      dispatch({ type: ActionTypes.CLEAR_GOAL }), []),
    
    // Import
    importState: useCallback((data) => 
      dispatch({ type: ActionTypes.IMPORT_STATE, payload: data }), []),
  };
  
  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { ActionTypes };
