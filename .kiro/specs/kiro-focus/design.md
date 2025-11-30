# Design Document: Kiro Focus

## Overview

Kiro Focus is a React-based single-page application that gamifies focus sessions by rewarding users with Cloud Credits to build AWS-style infrastructure. The application features a timer system, component shop, visual canvas, and two AI agents (Focus Coach and Cloud Architect) that provide personalized feedback through an animated ghost mascot named Kiro.

The architecture follows a component-based design with centralized state management using React Context. AI agent interactions are handled through API calls to Claude, with responses displayed through the Kiro mascot's speech bubble system.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        App.jsx (Root)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              AppContext (Global State)                   │   │
│  │  - userProgress (credits, streak, history)              │   │
│  │  - timerState (active, paused, remaining)               │   │
│  │  - architecture (components, connections)               │   │
│  │  - uiState (activeView, kiroMessage)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌───────────┬───────────┬───────────┬───────────┐            │
│  │  Header   │           │           │           │            │
│  │(Credits)  │   Timer   │   Shop    │  Canvas   │            │
│  └───────────┴───────────┴───────────┴───────────┘            │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    KiroMascot                            │   │
│  │  (Fixed position, receives messages from agents)        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Agent Layer                            │   │
│  │  ┌─────────────────┐    ┌─────────────────┐            │   │
│  │  │  Focus Coach    │    │ Cloud Architect │            │   │
│  │  │     Agent       │    │     Agent       │            │   │
│  │  └─────────────────┘    └─────────────────┘            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. User interactions trigger state updates via Context
2. State changes trigger appropriate agent calls
3. Agent responses flow to KiroMascot for display
4. Timer uses setInterval for countdown, updates state every second
5. Credit calculations happen on session completion
6. Export/Import handles manual persistence
7. Cloud State System auto-saves on key events (session complete, purchase, canvas change)
8. On app startup, Cloud State System loads persisted state from backend

### Cloud Auto-Save Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React App)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Cloud State Module                          │   │
│  │  - getOrCreateUserId() → localStorage                   │   │
│  │  - loadStateFromCloud(userId) → GET /state              │   │
│  │  - saveStateToCloud(userId, state) → PUT /state         │   │
│  │  - buildCloudState(appState) → extract persistable data │   │
│  │  - applyCloudState(cloudState) → restore to app state   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AWS API Gateway                               │
│  GET /state?userId=xxx     │     PUT /state                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AWS Lambda Functions                          │
│  ┌─────────────────────┐    ┌─────────────────────┐           │
│  │  loadState Lambda   │    │  saveState Lambda   │           │
│  │  - GET handler      │    │  - PUT handler      │           │
│  │  - CORS headers     │    │  - CORS headers     │           │
│  └─────────────────────┘    └─────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AWS DynamoDB                                  │
│  Table: KiroFocusUserState                                     │
│  - Partition Key: userId (String)                              │
│  - Attributes: state (JSON), updatedAt (Number)                │
│  - Billing: PAY_PER_REQUEST (on-demand)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Timer Implementation Pattern (Drift Correction)

```javascript
// Timer with drift correction using timestamps
useEffect(() => {
  if (!isActive || isPaused) return;
  
  const intervalId = setInterval(() => {
    setTimerState(prev => {
      const newTimeRemaining = prev.timeRemaining - 1;
      
      // Drift correction: Check actual elapsed time
      const actualElapsed = (Date.now() - prev.startTime) / 1000;
      const expectedRemaining = prev.totalDuration - actualElapsed;
      
      // If drift > 2 seconds, correct it
      if (Math.abs(expectedRemaining - newTimeRemaining) > 2) {
        return { ...prev, timeRemaining: Math.max(0, Math.floor(expectedRemaining)) };
      }
      
      return { ...prev, timeRemaining: Math.max(0, newTimeRemaining) };
    });
  }, 1000);
  
  return () => clearInterval(intervalId); // Cleanup on unmount
}, [isActive, isPaused]);
```

### Kiro Visual Implementation (Pure CSS/SVG)

```css
.kiro-ghost {
  width: 120px;
  height: 140px;
  background: radial-gradient(circle, #ffffff 0%, #e0e0e0 100%);
  border-radius: 50% 50% 45% 45%;
  position: relative;
  opacity: 0.85;
  box-shadow: 0 0 20px #b794f6;
  animation: kiro-float 3s ease-in-out infinite;
}

.kiro-ghost::before, .kiro-ghost::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: #000;
  border-radius: 50%;
  top: 40px;
}

.kiro-ghost::before { left: 35px; }
.kiro-ghost::after { right: 35px; }

@keyframes kiro-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Emotion states via CSS class swaps */
.kiro-encouraging { animation: kiro-bounce 0.5s ease-out; }
.kiro-celebrating { animation: kiro-spin 1s ease-out; transform: scale(1.15); }
.kiro-concerned { animation: kiro-float 4s ease-in-out infinite; transform: rotate(15deg); }
.kiro-teaching { animation: kiro-nod 3s ease-in-out infinite; }

@keyframes kiro-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes kiro-spin {
  from { transform: rotate(0deg) scale(1.15); }
  to { transform: rotate(360deg) scale(1.15); }
}

@keyframes kiro-nod {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-3px) rotate(5deg); }
}
```

### Session Grouping Logic (Local Timezone)

```typescript
// Session grouping uses LOCAL timezone
const groupSessionsByDate = (sessions: Session[]) => {
  const groups = {
    today: [] as Session[],
    yesterday: [] as Session[],
    thisWeek: [] as Session[],
    lastWeek: [] as Session[],
    older: [] as Session[]
  };
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const thisWeekStart = todayStart - (now.getDay() * 86400000); // Sunday = week start
  const lastWeekStart = thisWeekStart - (7 * 86400000);
  
  sessions.forEach(session => {
    const sessionDate = new Date(session.startTime);
    const sessionDayStart = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate()
    ).getTime();
    
    if (sessionDayStart >= todayStart) groups.today.push(session);
    else if (sessionDayStart >= yesterdayStart) groups.yesterday.push(session);
    else if (sessionDayStart >= thisWeekStart) groups.thisWeek.push(session);
    else if (sessionDayStart >= lastWeekStart) groups.lastWeek.push(session);
    else groups.older.push(session);
  });
  
  return groups;
};
```

### Credit Animation (Eased, Not Linear)

```javascript
// Animate over 1 second with easing, not linear increment
const animateCreditsChange = (startValue, endValue, setDisplayedCredits) => {
  const duration = 1000; // ms
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
    const current = Math.floor(startValue + (endValue - startValue) * eased);
    setDisplayedCredits(current);
    
    if (progress < 1) requestAnimationFrame(animate);
  };
  
  requestAnimationFrame(animate);
};
```

## Components and Interfaces

### Core Components

#### Timer.jsx
```typescript
interface TimerProps {
  onSessionStart: (duration: number) => void;
  onSessionComplete: (session: SessionResult) => void;
  onSessionAbandon: (session: SessionResult) => void;
}

interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number; // seconds
  totalDuration: number; // seconds
  startTime: number | null; // timestamp
  pauseCount: number;
}

// Preset durations in seconds
const PRESET_DURATIONS = [
  { label: "Quick Focus", minutes: 15, seconds: 900 },
  { label: "Pomodoro", minutes: 25, seconds: 1500 },
  { label: "Deep Work", minutes: 45, seconds: 2700 },
  { label: "Flow State", minutes: 60, seconds: 3600 },
  { label: "Ultra Deep", minutes: 90, seconds: 5400 }
];
```

#### KiroMascot.jsx
```typescript
interface KiroMascotProps {
  emotion: "idle" | "encouraging" | "celebrating" | "concerned" | "teaching";
  message: KiroMessage | null;
}

interface KiroMessage {
  text: string;
  timestamp: number;
  duration: number; // ms before auto-dismiss
}

type EmotionState = "idle" | "encouraging" | "celebrating" | "concerned" | "teaching";
```

#### ComponentShop.jsx
```typescript
interface ComponentShopProps {
  userCredits: number;
  ownedComponents: string[];
  onPurchase: (componentId: string) => void;
}

interface ShopComponent {
  id: string;
  type: string;
  name: string;
  description: string;
  fullDescription: string;
  icon: string;
  cost: number;
  tier: number;
  upgradeTree: UpgradeTier[];
  prerequisites: string[] | null;
  category: string;
  realWorldExample: string;
}

interface UpgradeTier {
  tier: number;
  name: string;
  cost: number;
  description: string;
}
```

#### InfrastructureCanvas.jsx
```typescript
interface CanvasProps {
  placedComponents: PlacedComponent[];
  onPlaceComponent: (component: PlacedComponent) => void;
  onRemoveComponent: (componentId: string) => void;
}

interface PlacedComponent {
  id: string; // unique instance id (e.g., "ec2-1")
  type: string; // component type (e.g., "EC2")
  position: { x: number; y: number }; // grid position in pixels
  tier: number;
}

interface Connection {
  from: string; // component id
  to: string; // component id
  type: "network" | "data" | "cache";
}

// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 40; // pixels per cell
```

#### CreditDisplay.jsx
```typescript
interface CreditDisplayProps {
  credits: number;
  previousCredits: number; // for animation direction
}
```

#### SessionHistory.jsx
```typescript
interface SessionHistoryProps {
  sessions: Session[];
  onExport: () => void;
  onImport: (file: File) => void;
}

interface Session {
  id: string;
  startTime: number; // timestamp
  endTime: number; // timestamp
  duration: number; // seconds
  completed: boolean;
  pauseCount: number;
  creditsEarned: number;
  bonuses: {
    completion: number;
    streak: number;
    longSession: number;
  };
}
```

### Agent Interfaces

#### Agent API Call Pattern
```typescript
interface AgentAPICall {
  endpoint: "https://api.anthropic.com/v1/messages";
  method: "POST";
  headers: {
    "Content-Type": "application/json";
    "x-api-key": string; // From environment
    "anthropic-version": "2023-06-01";
  };
  body: {
    model: "claude-sonnet-4-20250514";
    max_tokens: 500 | 600; // 500 for Focus Coach, 600 for Architect
    messages: [{ role: "user"; content: string }];
  };
  timeout: 5000; // ms - triggers fallback after this
}

interface AgentErrorHandling {
  onTimeout: () => void;    // Display fallback from kiroDialogue.js, retry once
  onAPIError: () => void;   // Log error, display generic message, continue
  onParseError: () => void; // Use defaults for missing fields
}

// Rate limiting state
interface AgentRateLimiter {
  messagesThisHour: number;
  hourStartTime: number;
  maxMessagesPerHour: 5;
}
```

#### Focus Coach Agent
```typescript
interface FocusCoachInput {
  mode: "encouragement" | "analysis" | "motivation" | "supportive";
  sessionData: {
    duration: number;
    completed?: boolean;
    recentSessions: RecentSession[];
    streak: number;
    totalSessions: number;
    completionRate: number;
    timeOfDay: "morning" | "afternoon" | "evening";
    daysSinceLastSession?: number;
  };
}

interface FocusCoachOutput {
  message: string;
  suggestedDuration?: number; // seconds
  tone: "gentle" | "hype" | "supportive" | "celebratory";
}

interface RecentSession {
  duration: number;
  completed: boolean;
  creditsEarned: number;
}
```

#### Cloud Architect Agent
```typescript
interface ArchitectInput {
  currentComponents: ComponentOwnership[];
  credits: number;
  lastAction: "purchase" | "query" | null;
  lastPurchasedComponent?: ComponentOwnership;
}

interface ArchitectOutput {
  explanation: string;
  suggestedNext: string; // component type
  reasoning: string;
  educationalNote?: string;
}

interface ComponentOwnership {
  type: string;
  tier: number;
}
```

## Data Models

### User Progress State
```typescript
interface UserProgress {
  credits: number;
  totalSessionTime: number; // seconds
  sessionsCompleted: number;
  currentStreak: number;
  lastSessionDate: string | null; // ISO date string
  ownedComponents: string[]; // component ids
  sessionHistory: Session[];
}
```

### Architecture State
```typescript
interface ArchitectureState {
  placedComponents: PlacedComponent[];
  connections: Connection[];
}
```

### UI State
```typescript
interface UIState {
  activeView: "timer" | "shop" | "canvas" | "history";
  kiroMessage: KiroMessage | null;
  kiroEmotion: EmotionState;
  showModal: string | null; // modal id or null
  messageQueue: KiroMessage[];
}
```

### Export/Import Data Structure
```typescript
interface ExportData {
  version: string;
  exportDate: string; // ISO timestamp
  userProgress: UserProgress;
  architecture: ArchitectureState;
}
```

### Cloud State Interfaces

#### User ID Management
```typescript
// localStorage key for anonymous user ID
const USER_ID_KEY = 'kiro-focus-user-id';

/**
 * Get or create anonymous user ID
 * Uses localStorage to persist across sessions
 */
function getOrCreateUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}
```

#### Cloud State Data Structure
```typescript
interface CloudState {
  credits: number;
  currentStreak: number;
  lastSessionDate: string | null;
  ownedComponents: string[];
  placedComponents: PlacedComponent[];
  connections: Connection[];
  sessionHistory: Session[]; // Limited to 100 most recent
}

/**
 * Extract persistable state from app state
 */
function buildCloudState(state: AppState): CloudState {
  return {
    credits: state.userProgress.credits,
    currentStreak: state.userProgress.currentStreak,
    lastSessionDate: state.userProgress.lastSessionDate,
    ownedComponents: state.userProgress.ownedComponents,
    placedComponents: state.architecture.placedComponents,
    connections: state.architecture.connections,
    sessionHistory: state.userProgress.sessionHistory.slice(-100) // Limit to 100
  };
}

/**
 * Apply cloud state to app state
 */
function applyCloudState(cloudState: CloudState, actions: AppActions): void {
  // Restore user progress
  actions.setCredits(cloudState.credits);
  actions.updateStreak(cloudState.currentStreak);
  // ... restore other fields via importState action
}
```

#### Cloud API Client
```typescript
interface CloudAPIConfig {
  baseUrl: string; // From VITE_API_BASE_URL environment variable
}

interface LoadStateResponse {
  success: boolean;
  state: CloudState | null;
  error?: string;
}

interface SaveStateResponse {
  success: boolean;
  error?: string;
}

/**
 * Load state from cloud backend
 */
async function loadStateFromCloud(userId: string): Promise<LoadStateResponse> {
  const response = await fetch(`${API_BASE_URL}/state?userId=${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

/**
 * Save state to cloud backend
 */
async function saveStateToCloud(userId: string, state: CloudState): Promise<SaveStateResponse> {
  const response = await fetch(`${API_BASE_URL}/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, state })
  });
  return response.json();
}
```

#### Lambda Function Interfaces
```typescript
// Load State Lambda (GET /state)
interface LoadStateLambdaEvent {
  queryStringParameters: {
    userId: string;
  };
}

interface LoadStateLambdaResponse {
  statusCode: 200;
  headers: CORSHeaders;
  body: string; // JSON: { success: true, state: CloudState | null }
}

// Save State Lambda (PUT /state)
interface SaveStateLambdaEvent {
  body: string; // JSON: { userId: string, state: CloudState }
}

interface SaveStateLambdaResponse {
  statusCode: 200;
  headers: CORSHeaders;
  body: string; // JSON: { success: true }
}

// CORS Headers (required for all responses)
interface CORSHeaders {
  'Access-Control-Allow-Origin': '*';
  'Access-Control-Allow-Headers': 'Content-Type';
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS';
}
```

#### DynamoDB Schema
```typescript
// DynamoDB Table: KiroFocusUserState
interface DynamoDBItem {
  userId: string;      // Partition Key
  state: CloudState;   // JSON object
  updatedAt: number;   // Unix timestamp
}

// DynamoDB Table Configuration
const TABLE_CONFIG = {
  TableName: 'KiroFocusUserState',
  KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
  AttributeDefinitions: [{ AttributeName: 'userId', AttributeType: 'S' }],
  BillingMode: 'PAY_PER_REQUEST'
};
```

#### Amplify Configuration
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd kiro-focus
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: kiro-focus/dist
    files:
      - '**/*'
  cache:
    paths:
      - kiro-focus/node_modules/**/*
```

### Component Catalog
```typescript
const COMPONENTS_CATALOG: ShopComponent[] = [
  {
    id: "ec2",
    type: "EC2",
    name: "EC2 Instance",
    description: "Virtual computer in the cloud - the foundation of applications",
    fullDescription: "Amazon EC2 provides resizable compute capacity...",
    icon: "Server",
    cost: 50,
    tier: 1,
    upgradeTree: [
      { tier: 1, name: "t2.micro", cost: 50, description: "Entry-level" },
      { tier: 2, name: "t2.medium", cost: 100, description: "2x CPU and RAM" },
      { tier: 3, name: "m5.large", cost: 200, description: "Production-ready" },
      { tier: 4, name: "c5.xlarge", cost: 400, description: "Compute-optimized" }
    ],
    prerequisites: null,
    category: "Compute",
    realWorldExample: "Netflix uses thousands of EC2 instances..."
  },
  // S3, RDS, LoadBalancer, CloudFront...
];
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Timer Countdown Accuracy

*For any* valid duration preset (15, 25, 45, 60, or 90 minutes), when the timer starts, the initial timeRemaining value SHALL equal the selected duration in seconds.

**Validates: Requirements 1.1**

### Property 2: Progress Ring Calculation

*For any* active timer state with totalDuration > 0 and timeRemaining >= 0, the progress percentage SHALL equal ((totalDuration - timeRemaining) / totalDuration) * 100, bounded between 0 and 100.

**Validates: Requirements 1.2**

### Property 3: Pause and Resume Consistency

*For any* active timer state, pausing SHALL freeze timeRemaining at its current value and increment pauseCount by 1, and resuming SHALL continue from the exact paused timeRemaining value without modification.

**Validates: Requirements 1.3, 1.4**

### Property 4: Session Completion Detection

*For any* timer state where timeRemaining transitions from a positive value to 0, the session SHALL be marked as completed=true.

**Validates: Requirements 1.5**

### Property 5: Partial Credit Calculation for Abandonment

*For any* abandoned session with elapsed time > 0, the credits awarded SHALL equal exactly 50% of the credits that would have been earned for the completed elapsed time (using base rate of 10 credits per 15 minutes).

**Validates: Requirements 1.6, 2.5**

### Property 6: Final Minute Detection

*For any* active timer state, the isFinalMinute flag SHALL be true if and only if timeRemaining <= 60 and timeRemaining > 0.

**Validates: Requirements 1.7**

### Property 7: Base Credit Calculation

*For any* completed session with duration D seconds, the base credits SHALL equal floor(D / 60 / 15) * 10.

**Validates: Requirements 2.1**

### Property 8: Completion Bonus Calculation

*For any* completed session with pauseCount = 0, the completion bonus SHALL equal exactly 20% of the base credits. For pauseCount > 0, the completion bonus SHALL be 0.

**Validates: Requirements 2.2**

### Property 9: Streak Bonus Calculation

*For any* completed session with streak value S >= 0, the streak bonus SHALL equal min(S * 0.05, 0.5) * baseCredits.

**Validates: Requirements 2.3**

### Property 10: Long Session Bonus Calculation

*For any* completed session with duration >= 3600 seconds (60 minutes), the long session bonus SHALL equal 10% of base credits. For duration < 3600 seconds, the long session bonus SHALL be 0.

**Validates: Requirements 2.4**

### Property 11: Kiro Emotion State Transitions

*For any* application event, the Kiro emotion state SHALL transition according to:
- Session start → "encouraging"
- Session complete (completed=true) → "celebrating"
- Session abandon (completed=false) → "concerned"
- Architect agent response → "teaching"
- No active event → "idle"

**Validates: Requirements 3.2, 3.3, 3.4, 3.5**

### Property 12: Message Queue Ordering

*For any* sequence of messages M1, M2, ..., Mn arriving while a message is displaying, the messages SHALL be displayed in FIFO order (M1 first, then M2, etc.) after the current message dismisses.

**Validates: Requirements 3.7**

### Property 13: Purchase Availability Based on Credits

*For any* component with cost C and user with credits U, the purchase button SHALL be enabled if and only if U >= C and all prerequisites are met.

**Validates: Requirements 4.2, 4.3**

### Property 14: Prerequisite Checking

*For any* component with prerequisites P (non-null array), the component SHALL be locked if and only if there exists at least one prerequisite in P that is not in the user's ownedComponents array.

**Validates: Requirements 4.4**

### Property 15: Purchase Transaction Integrity

*For any* successful purchase of component with cost C, the user's credits SHALL decrease by exactly C, and the component id SHALL be added to ownedComponents exactly once.

**Validates: Requirements 4.5**

### Property 16: Grid Snap Calculation

*For any* position (x, y) on the canvas, the snapped position SHALL be (round(x / GRID_SIZE) * GRID_SIZE, round(y / GRID_SIZE) * GRID_SIZE) where GRID_SIZE = 40.

**Validates: Requirements 5.2, 5.3**

### Property 17: Empty State Detection

*For any* canvas state, the empty state message SHALL be displayed if and only if placedComponents.length === 0.

**Validates: Requirements 5.6**

### Property 18: Session Grouping by Date

*For any* set of sessions, sessions SHALL be grouped such that all sessions with the same calendar date (in local timezone) appear in the same group, and groups SHALL be ordered from most recent to oldest.

**Validates: Requirements 6.1**

### Property 19: Session Display Completeness

*For any* session in the history, the display SHALL include: completion status (boolean), start time, duration, and creditsEarned.

**Validates: Requirements 6.2**

### Property 20: Statistics Calculation

*For any* session history with n sessions, the statistics SHALL be:
- totalSessions = n
- totalFocusTime = sum of all session durations
- completionRate = (count of completed sessions / n) * 100
- averageSessionLength = totalFocusTime / n
- currentStreak = consecutive days with at least one completed session ending today

**Validates: Requirements 6.3**

### Property 21: Export/Import Round-Trip

*For any* valid application state S, exporting to JSON and then importing that JSON SHALL restore a state S' where S'.credits === S.credits, S'.sessionHistory is equivalent to S.sessionHistory, S'.ownedComponents is equivalent to S.ownedComponents, and S'.architecture is equivalent to S.architecture.

**Validates: Requirements 6.4, 6.5, 10.2, 10.3, 10.4, 10.5**

### Property 22: Re-engagement Detection

*For any* user returning to the application, if daysSinceLastSession >= 1, the Focus Coach Agent SHALL be invoked with mode="motivation".

**Validates: Requirements 7.4**

### Property 23: Timer Accuracy Under Throttling

*For any* timer running for duration D seconds with possible tab inactivity, the actual elapsed time (measured by timestamps) SHALL differ from the timer display by no more than 2 seconds.

**Validates: Requirements 12.1, 12.2, 12.3**

### Property 24: Export Version Validation

*For any* import attempt with a version field that does not match the current application version, the import SHALL be rejected with a version mismatch error.

**Validates: Requirements 10.6**

### Property 25: Agent Rate Limiting

*For any* sequence of agent invocations within a 1-hour window, the system SHALL display at most 5 agent messages, with subsequent invocations using fallback messages.

**Validates: Requirements 11.5**

### Property 26: Anonymous User ID Persistence

*For any* application session, calling getOrCreateUserId() multiple times SHALL return the same user ID, and the ID SHALL persist across page refreshes.

**Validates: Requirements 13.1, 13.2**

### Property 27: Cloud State Round-Trip

*For any* valid application state S, saving to cloud and then loading from cloud SHALL restore a state S' where S'.credits === S.credits, S'.currentStreak === S.currentStreak, S'.ownedComponents is equivalent to S.ownedComponents, and S'.placedComponents is equivalent to S.placedComponents.

**Validates: Requirements 13.5, 13.6, 13.7, 13.8**

### Property 28: Session History Limit

*For any* cloud state save operation, the sessionHistory array SHALL contain at most 100 sessions, with the most recent sessions preserved.

**Validates: Requirements 13.5**

### Property 29: Cloud Save Trigger Events

*For any* of the following events: session completion, component purchase, component removal, canvas placement, canvas removal, or JSON import, the Cloud State System SHALL trigger a save operation.

**Validates: Requirements 13.6, 13.7, 13.8, 13.9**

### Property 30: Graceful Degradation on Cloud Failure

*For any* cloud save or load failure, the application SHALL continue functioning normally with local state, without displaying error messages that disrupt the user experience.

**Validates: Requirements 13.10, 13.11**

## Error Handling

### Timer Errors
- **Browser tab inactive**: Timer continues in background; on return, calculate elapsed time from startTime
- **System sleep/close**: Log session with "interrupted" flag; offer to resume or discard on next app open
- **Rapid pause/resume**: After 3 pauses in 60 seconds, display gentle nudge about distraction

### Agent Errors
- **API timeout (>5s)**: Display fallback message from kiroDialogue.js; retry once
- **API error**: Log error, display generic encouraging message, continue without agent
- **Invalid response format**: Parse what's possible, use defaults for missing fields

### Data Errors
- **Import invalid JSON**: Display error message "Invalid backup file", do not modify state
- **Import missing fields**: Reject import with specific error about missing data
- **Corrupted session data**: Skip corrupted entries, import valid ones, warn user

### UI Errors
- **Canvas overflow**: Prevent placement outside grid bounds
- **Duplicate component placement**: Allow multiple instances with unique IDs (ec2-1, ec2-2)
- **Credit underflow**: Prevent purchase if it would result in negative credits

### Cloud State Errors
- **Cloud load timeout**: Start with default state, continue normally
- **Cloud load network error**: Start with default state, continue normally
- **Cloud save timeout**: Log error silently, do not disrupt user
- **Cloud save network error**: Log error silently, do not disrupt user
- **Invalid cloud state format**: Ignore cloud state, start with defaults
- **Missing userId in localStorage**: Generate new userId, start fresh

## Testing Strategy

### Property-Based Testing Framework

The application will use **fast-check** as the property-based testing library for JavaScript/TypeScript. Each correctness property will be implemented as a property-based test that runs a minimum of 100 iterations with randomly generated inputs.

### Test Annotation Format

Each property-based test MUST be annotated with:
```javascript
// **Feature: kiro-focus, Property {number}: {property_text}**
// **Validates: Requirements X.Y**
```

### Unit Testing Approach

Unit tests will cover:
- Specific edge cases (0 duration, max streak, empty history)
- Integration points between components
- Error condition handling
- UI state transitions

### Test File Organization

```
src/
├── __tests__/
│   ├── creditCalculator.test.js      // Properties 5, 7, 8, 9, 10
│   ├── timerLogic.test.js            // Properties 1, 2, 3, 4, 6
│   ├── shopLogic.test.js             // Properties 13, 14, 15
│   ├── canvasLogic.test.js           // Properties 16, 17
│   ├── sessionHistory.test.js        // Properties 18, 19, 20
│   ├── exportImport.test.js          // Property 21
│   ├── kiroMascot.test.js            // Properties 11, 12
│   ├── agentIntegration.test.js      // Property 22
│   └── cloudState.test.js            // Properties 26, 27, 28, 29, 30
```

### Test Data Generators

```javascript
// Duration generator (valid presets)
const durationArb = fc.constantFrom(900, 1500, 2700, 3600, 5400);

// Session generator
const sessionArb = fc.record({
  id: fc.uuid(),
  startTime: fc.integer({ min: 0, max: Date.now() }),
  duration: fc.integer({ min: 0, max: 5400 }),
  completed: fc.boolean(),
  pauseCount: fc.integer({ min: 0, max: 10 }),
  creditsEarned: fc.integer({ min: 0, max: 1000 })
});

// Component generator
const componentArb = fc.constantFrom('ec2', 's3', 'rds', 'loadbalancer', 'cloudfront');

// Position generator (canvas bounds)
const positionArb = fc.record({
  x: fc.integer({ min: 0, max: 760 }),
  y: fc.integer({ min: 0, max: 560 })
});
```

### Dual Testing Requirements

1. **Unit tests** verify specific examples and edge cases
2. **Property tests** verify universal properties across all valid inputs
3. Both test types are complementary and required for comprehensive coverage
