# Requirements Document

## Introduction

Kiro Focus is a gamified focus timer application that rewards users with "Cloud Credits" for completing timed focus sessions. Users spend credits to purchase and build AWS-style cloud infrastructure components on a visual canvas. The application features two AI agents (Focus Coach and Cloud Architect) that analyze user behavior, provide personalized encouragement, and teach cloud architecture concepts through gameplay. The target audience is computer science students, junior developers, and tech professionals who need focus tools and want to learn cloud concepts engagingly.

## Glossary

- **Cloud Credits**: Virtual currency earned by completing focus sessions, used to purchase infrastructure components
- **Focus Session**: A timed period where the user commits to focused work (15-90 minutes)
- **Infrastructure Component**: A visual representation of an AWS service (EC2, S3, RDS, etc.) that users purchase and place on the canvas
- **Infrastructure Canvas**: A grid-based workspace where users arrange purchased cloud components
- **Focus Coach Agent**: An AI agent that analyzes user behavior patterns and provides motivational feedback
- **Cloud Architect Agent**: An AI agent that explains cloud concepts and suggests logical architecture progressions
- **Kiro**: The ghost mascot character that serves as the visual personality for both AI agents
- **Streak**: Consecutive days with at least one completed focus session
- **Component Shop**: The interface where users browse and purchase infrastructure components
- **Tier**: The upgrade level of a component (1-4), with higher tiers costing more credits
- **Anonymous User ID**: A unique identifier generated using crypto.randomUUID() stored in localStorage to identify users without authentication
- **Cloud State**: The subset of application state that is persisted to the cloud backend (credits, streak, components, sessions)
- **Cloud State System**: The frontend module responsible for loading and saving state to the cloud backend
- **Lambda Function**: AWS serverless compute service that handles API requests for loading and saving state
- **DynamoDB**: AWS NoSQL database service used to store user state

## Requirements

### Requirement 1: Focus Timer Management

**User Story:** As a user, I want to start, pause, and complete timed focus sessions, so that I can track my focused work time and earn rewards.

#### Acceptance Criteria

1. WHEN a user selects a duration preset (15, 25, 45, 60, or 90 minutes) and clicks start, THEN the Timer System SHALL begin a countdown displaying remaining time in MM:SS format.
2. WHILE a focus session is active, THEN the Timer System SHALL display a circular progress ring that fills proportionally to elapsed time.
3. WHEN a user clicks pause during an active session, THEN the Timer System SHALL freeze the countdown and increment the pause counter.
4. WHEN a user clicks resume after pausing, THEN the Timer System SHALL continue the countdown from the paused time.
5. WHEN the countdown reaches zero, THEN the Timer System SHALL mark the session as complete and trigger credit calculation.
6. WHEN a user abandons a session early, THEN the Timer System SHALL mark the session as incomplete and award partial credits (50% of earned time).
7. WHEN the timer enters the final 60 seconds, THEN the Timer System SHALL change the display color to orange and apply a pulse animation.

### Requirement 2: Credit Calculation and Award

**User Story:** As a user, I want to earn Cloud Credits based on my focus session performance, so that I can purchase infrastructure components.

#### Acceptance Criteria

1. WHEN a session completes, THEN the Credit System SHALL calculate base credits at 10 credits per 15 minutes of session duration.
2. WHEN a session completes with zero pauses, THEN the Credit System SHALL apply a 20% completion bonus to base credits.
3. WHEN a user has an active streak, THEN the Credit System SHALL apply a streak bonus of 5% per consecutive day (maximum 50%).
4. WHEN a session duration is 60 minutes or longer, THEN the Credit System SHALL apply a 10% long session bonus.
5. WHEN a session is abandoned early, THEN the Credit System SHALL award 50% of credits earned for completed time.
6. WHEN credits are awarded, THEN the Credit Display SHALL animate the counter incrementing with a scale-up effect and color flash.

### Requirement 3: Kiro Mascot Display

**User Story:** As a user, I want to see an animated ghost mascot that communicates AI agent messages, so that I have a friendly companion during focus sessions.

#### Acceptance Criteria

1. WHILE the application is idle, THEN the Kiro Mascot SHALL display a gentle floating animation with occasional blinking.
2. WHEN a focus session starts, THEN the Kiro Mascot SHALL transition to an encouraging state with bounce animation and sparkle particles.
3. WHEN a focus session completes successfully, THEN the Kiro Mascot SHALL transition to a celebrating state with spin animation and confetti particles.
4. WHEN a focus session is abandoned, THEN the Kiro Mascot SHALL transition to a concerned state with slower floating and tilted head.
5. WHEN the Architect Agent provides an explanation, THEN the Kiro Mascot SHALL transition to a teaching state with pointing gesture.
6. WHEN an AI agent sends a message, THEN the Kiro Mascot SHALL display a speech bubble with typewriter text animation at 30ms per character.
7. WHEN a new message arrives while one is displaying, THEN the Kiro Mascot SHALL queue the message and display it after the current message dismisses.

### Requirement 4: Component Shop Interface

**User Story:** As a user, I want to browse and purchase cloud infrastructure components with my earned credits, so that I can build my architecture.

#### Acceptance Criteria

1. WHEN a user opens the Component Shop, THEN the Shop Interface SHALL display all available components with name, icon, cost, and short description.
2. WHEN a user has sufficient credits for a component, THEN the Shop Interface SHALL enable the purchase button with green styling.
3. WHEN a user has insufficient credits for a component, THEN the Shop Interface SHALL disable the purchase button and display the credit shortage.
4. WHEN a component has unmet prerequisites, THEN the Shop Interface SHALL display the component as locked with prerequisite information.
5. WHEN a user clicks purchase on an available component, THEN the Shop Interface SHALL deduct credits, add the component to owned inventory, and trigger the Architect Agent.
6. WHEN a user clicks "More Info" on a component, THEN the Shop Interface SHALL display a modal with full description, real-world example, and upgrade path.

### Requirement 5: Infrastructure Canvas

**User Story:** As a user, I want to place and arrange purchased components on a visual grid, so that I can build and visualize my cloud architecture.

#### Acceptance Criteria

1. WHEN a user views the Infrastructure Canvas, THEN the Canvas System SHALL display a grid background with 40x40 pixel cells.
2. WHEN a user drags a component from inventory, THEN the Canvas System SHALL display a ghost preview at 50% opacity that snaps to grid cells.
3. WHEN a user drops a component on the canvas, THEN the Canvas System SHALL place the component at the snapped grid position with full opacity and glow effect.
4. WHEN a user hovers over a placed component, THEN the Canvas System SHALL display a highlight border and tooltip with component details.
5. WHEN a user clicks a placed component, THEN the Canvas System SHALL open an info modal with upgrade and remove options.
6. WHEN no components are placed, THEN the Canvas System SHALL display an empty state message encouraging the user to complete sessions.

### Requirement 6: Session History Tracking

**User Story:** As a user, I want to view my past focus sessions and statistics, so that I can track my progress over time.

#### Acceptance Criteria

1. WHEN a user views Session History, THEN the History System SHALL display sessions grouped by date (Today, Yesterday, This Week, etc.).
2. WHEN displaying a session entry, THEN the History System SHALL show completion status icon, time, duration, and credits earned.
3. WHEN displaying summary statistics, THEN the History System SHALL show total sessions, total focus time, completion rate, average session length, and current streak.
4. WHEN a user clicks export, THEN the History System SHALL generate a downloadable JSON file containing all session data, credits, and owned components.
5. WHEN a user imports a backup file, THEN the History System SHALL restore session history, credits, and owned components from the JSON data.

### Requirement 7: Focus Coach Agent Integration

**User Story:** As a user, I want to receive personalized encouragement and feedback from an AI coach, so that I can improve my focus habits.

#### Acceptance Criteria

1. WHEN a focus session starts, THEN the Focus Coach Agent SHALL analyze recent session patterns and provide contextual encouragement via Kiro.
2. WHEN a focus session completes successfully, THEN the Focus Coach Agent SHALL provide specific praise referencing completion rate and streak data.
3. WHEN a focus session is abandoned, THEN the Focus Coach Agent SHALL provide supportive feedback identifying patterns and suggesting shorter sessions.
4. WHEN a user returns after one or more days of inactivity, THEN the Focus Coach Agent SHALL provide welcoming re-engagement message without guilt.
5. WHEN providing feedback, THEN the Focus Coach Agent SHALL limit messages to 2-3 sentences with specific data points from user history.
6. WHEN analyzing patterns, THEN the Focus Coach Agent SHALL suggest optimal session durations based on historical completion rates.

### Requirement 8: Cloud Architect Agent Integration

**User Story:** As a user, I want to learn about cloud infrastructure through AI explanations, so that I can understand what I'm building.

#### Acceptance Criteria

1. WHEN a user purchases a component, THEN the Architect Agent SHALL explain the component's purpose using simple language and real-world analogies.
2. WHEN explaining a component, THEN the Architect Agent SHALL reference how the component relates to previously owned components.
3. WHEN a user has multiple components, THEN the Architect Agent SHALL suggest the next logical component to purchase with reasoning.
4. WHEN a user views their architecture, THEN the Architect Agent SHALL validate the architecture and identify potential improvements.
5. WHEN providing explanations, THEN the Architect Agent SHALL limit messages to 3-4 sentences and include one real-world company example.
6. WHEN a user builds a recognizable architecture pattern (e.g., 3-tier), THEN the Architect Agent SHALL acknowledge and name the pattern.

### Requirement 9: Visual Theme and Styling

**User Story:** As a user, I want a dark, spectral-themed interface, so that the application feels cohesive and visually appealing.

#### Acceptance Criteria

1. WHEN the application loads, THEN the UI System SHALL apply a dark background color (#0a0e27) consistently across all views.
2. WHEN displaying interactive elements, THEN the UI System SHALL use purple (#b794f6) as the primary accent color.
3. WHEN displaying success states, THEN the UI System SHALL use green (#48bb78) for positive feedback.
4. WHEN displaying warning states, THEN the UI System SHALL use orange (#ed8936) for caution indicators.
5. WHEN displaying the Kiro mascot, THEN the UI System SHALL apply a purple glow effect (box-shadow with #b794f6).
6. WHEN animating UI elements, THEN the UI System SHALL maintain 60fps smooth animations.

### Requirement 10: Data Persistence Without LocalStorage

**User Story:** As a user, I want my progress saved and restorable, so that I do not lose my earned credits and session history.

#### Acceptance Criteria

1. WHEN the application manages user data, THEN the Storage System SHALL NOT use browser localStorage or sessionStorage.
2. WHEN a user wants to save progress, THEN the Storage System SHALL provide an export function generating a downloadable JSON file.
3. WHEN a user wants to restore progress, THEN the Storage System SHALL provide an import function accepting a JSON backup file.
4. WHEN exporting data, THEN the Storage System SHALL include session history, current credits, owned components, and placed architecture.
5. WHEN importing data, THEN the Storage System SHALL validate the JSON structure before restoring state.
6. WHEN importing data with a version mismatch, THEN the Storage System SHALL reject the import and display a version error message.

### Requirement 11: Agent Error Handling and Reliability

**User Story:** As a user, I want the AI agents to handle errors gracefully, so that the application remains functional even when AI services are unavailable.

#### Acceptance Criteria

1. WHEN an agent API call exceeds 5 seconds, THEN the Agent System SHALL timeout the request and display a fallback message from the local dialogue bank.
2. WHEN an agent API call times out, THEN the Agent System SHALL retry the request exactly once before falling back.
3. WHEN an agent API returns an error, THEN the Agent System SHALL log the error and display a generic encouraging message without disrupting the user experience.
4. WHEN an agent response has invalid JSON format, THEN the Agent System SHALL parse available fields and use defaults for missing fields.
5. WHEN displaying agent messages, THEN the Agent System SHALL enforce a rate limit of maximum 5 agent messages per hour to prevent spam.

### Requirement 12: Timer Accuracy Under Browser Conditions

**User Story:** As a user, I want the timer to remain accurate even when the browser tab is inactive, so that my focus sessions are tracked correctly.

#### Acceptance Criteria

1. WHEN the browser tab becomes inactive during a session, THEN the Timer System SHALL continue tracking elapsed time using timestamps rather than interval counts.
2. WHEN the user returns to an inactive tab, THEN the Timer System SHALL recalculate timeRemaining based on actual elapsed time from startTime.
3. WHEN timer drift exceeds 2 seconds, THEN the Timer System SHALL correct the displayed time to match actual elapsed time.
4. WHEN the timer component unmounts, THEN the Timer System SHALL clear all intervals to prevent memory leaks.

### Requirement 13: Anonymous Cloud Auto-Save

**User Story:** As a user, I want my progress automatically saved to the cloud without requiring login, so that I can refresh the page and continue where I left off.

#### Acceptance Criteria

1. WHEN the application loads for the first time, THEN the Cloud State System SHALL generate a unique anonymous user ID using crypto.randomUUID() and store it in localStorage with key 'kiro-focus-user-id'.
2. WHEN the application loads on subsequent visits, THEN the Cloud State System SHALL retrieve the existing user ID from localStorage.
3. WHEN the application starts, THEN the Cloud State System SHALL attempt to load the user's state from the cloud backend using the anonymous user ID.
4. WHILE the cloud state is loading, THEN the UI System SHALL display a subtle loading indicator.
5. WHEN cloud state is successfully loaded, THEN the Cloud State System SHALL restore credits, currentStreak, lastSessionDate, ownedComponents, placedComponents, connections, and sessionHistory (limited to 100 most recent).
6. WHEN a focus session completes, THEN the Cloud State System SHALL automatically save the current state to the cloud.
7. WHEN a component is purchased or removed from the shop, THEN the Cloud State System SHALL automatically save the current state to the cloud.
8. WHEN a component is placed or removed on the canvas, THEN the Cloud State System SHALL automatically save the current state to the cloud.
9. WHEN JSON data is imported, THEN the Cloud State System SHALL automatically save the imported state to the cloud.
10. WHEN cloud save fails, THEN the application SHALL continue functioning normally without disrupting the user experience.
11. WHEN cloud load fails on startup, THEN the application SHALL start with default state and continue functioning normally.

### Requirement 14: Cloud Backend Infrastructure

**User Story:** As a system, I want a serverless backend to store user state, so that users can persist their progress without authentication.

#### Acceptance Criteria

1. WHEN the backend receives a GET request to /state with userId parameter, THEN the Lambda Function SHALL return the stored state for that user or null if the user is new.
2. WHEN the backend receives a PUT request to /state with userId and state in the body, THEN the Lambda Function SHALL save the state to DynamoDB and return success.
3. WHEN the backend receives any request, THEN the Lambda Function SHALL include CORS headers allowing requests from any origin.
4. WHEN the backend receives an OPTIONS request, THEN the Lambda Function SHALL return 200 with CORS headers for preflight handling.
5. WHEN storing state in DynamoDB, THEN the Storage System SHALL use userId as the partition key and include an updatedAt timestamp.

### Requirement 15: Amplify Deployment Configuration

**User Story:** As a developer, I want the application configured for AWS Amplify deployment, so that the app can be hosted and deployed easily.

#### Acceptance Criteria

1. WHEN Amplify builds the application, THEN the Build System SHALL execute npm run build and output to the dist directory.
2. WHEN Amplify deploys the application, THEN the Build System SHALL use the VITE_API_BASE_URL environment variable for the backend API endpoint.
3. WHEN caching dependencies, THEN the Build System SHALL cache the node_modules directory to speed up subsequent builds.
