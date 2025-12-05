# Nimbus User Guide

Welcome to Nimbus! This guide will teach you everything you need to know to use the application effectively.

## What is Nimbus?

Nimbus is a gamified focus timer that helps you stay productive while learning cloud architecture concepts. Complete focus sessions to earn "Cloud Credits," then spend those credits to build your own AWS-style infrastructure on a visual canvas.

---

## Quick Start (5 Minutes)

### 1. Start Your First Focus Session

1. Open Nimbus in your browser
2. You'll see the **Timer** view with preset duration buttons
3. Click a duration: **15**, **25**, **45**, **60**, or **90** minutes
4. Click **Start** to begin your focus session
5. The circular progress ring fills as time passes

### 2. Complete the Session

- Stay focused until the timer reaches zero
- You'll earn **Cloud Credits** based on your session duration
- Kiro (the ghost mascot) will celebrate with you!

### 3. Visit the Component Shop

1. Click the **Shop** tab in the navigation
2. Browse AWS-style infrastructure components
3. Click **Purchase** on any component you can afford
4. The Cloud Architect will explain what you just bought

### 4. Build on the Canvas

1. Click the **Canvas** tab
2. Drag your purchased components onto the grid
3. Use **Connect Mode** to wire components together
4. Build real cloud architecture patterns!

---

## Core Features

### Focus Timer

The timer is your primary way to earn Cloud Credits.

**Duration Presets:**
| Duration | Base Credits | Best For |
|----------|-------------|----------|
| 15 min | 10 credits | Quick tasks, warm-up |
| 25 min | ~17 credits | Pomodoro technique |
| 45 min | 30 credits | Deep work sessions |
| 60 min | 40 credits | Extended focus |
| 90 min | 60 credits | Maximum productivity |

**Timer Controls:**
- **Start**: Begin the countdown
- **Pause**: Temporarily stop (counts against your bonus)
- **Resume**: Continue from where you paused
- **Abandon**: End early (receive 50% partial credits)

**Visual Indicators:**
- Purple progress ring fills as time passes
- Orange color + pulse animation in final 60 seconds
- Kiro reacts to your session status

**Pro Tip:** The timer stays accurate even if you switch browser tabs!

---

### Cloud Credits System

Credits are the currency you earn and spend in Nimbus.

**How Credits Are Calculated:**

```
Final Credits = Base Credits × Bonuses
```

**Base Rate:** 10 credits per 15 minutes

**Bonuses:**
| Bonus Type | Amount | How to Earn |
|------------|--------|-------------|
| Completion | +20% | Finish session without abandoning |
| No Pauses | +20% | Complete without pausing |
| Long Session | +10% | Sessions 60+ minutes |
| Streak | +5% per day | Consecutive days (max 50%) |

**Example Calculation:**
- 45-minute session = 30 base credits
- Completed without pauses = +20% = 36 credits
- 3-day streak = +15% = 41 credits

---

### Component Shop

Purchase AWS-style infrastructure components to build your architecture.

**Categories:**

| Category | Components | Purpose |
|----------|------------|---------|
| Edge/DNS | Route 53, CloudFront | Traffic routing, CDN |
| Load Balancer | Application Load Balancer | Distribute traffic |
| Compute | EC2, ECS | Run applications |
| Serverless | Lambda | Event-driven code |
| Storage | S3 | Object storage |
| Database | RDS, DynamoDB | Data persistence |
| Cache | ElastiCache | Speed up data access |
| Async | SQS, SNS, EventBridge | Message queuing |
| Auth | Cognito | User authentication |
| Security | WAF | Web application firewall |
| Observability | CloudWatch | Monitoring and logs |

**Component Tiers:**
Each component can be upgraded through 4 tiers with real AWS naming:
- Tier 1: Basic (free with purchase)
- Tier 2: Enhanced (+150 credits)
- Tier 3: Professional (+300 credits)
- Tier 4: Enterprise (+500 credits)

**Learning Links:**
Click "More Info" on any component to see:
- Full description
- Real-world usage examples
- Links to official AWS documentation

---

### Infrastructure Canvas

Build and visualize your cloud architecture.

**Canvas Basics:**
- 800×600 pixel grid with 40×40 cells
- Drag components from your inventory
- Components snap to grid positions
- Hover for component details

**Connect Mode:**
1. Click **Connect Mode** button
2. Click a source component
3. Click a destination component
4. Valid connections are created automatically

**Connection Rules:**
The canvas enforces realistic AWS architecture patterns:

| From | Can Connect To |
|------|---------------|
| Route 53 | CloudFront, Load Balancer |
| CloudFront | Load Balancer, EC2, Lambda, S3 |
| Load Balancer | EC2, Lambda, ECS |
| EC2/Lambda | RDS, DynamoDB, S3, SQS, ElastiCache |
| S3 | Lambda (events), CloudFront |
| SQS/SNS | Lambda, EC2 |
| Cognito | Load Balancer, Lambda |
| Any | CloudWatch (monitoring) |

**Invalid connections show educational messages explaining why!**

**Component Actions:**
- Click a placed component to open its info modal
- Upgrade to higher tiers
- Remove from canvas
- View documentation links

---

### Kiro Mascot

Kiro is your friendly ghost companion who delivers AI agent messages.

**Emotion States:**
| State | When | Animation |
|-------|------|-----------|
| Idle | Default | Gentle floating, occasional blinks |
| Encouraging | Session starts | Bounce with sparkles |
| Celebrating | Session completes | Spin with confetti |
| Concerned | Session abandoned | Slow float, tilted head |
| Teaching | Architect explains | Pointing gesture |

**Message Display:**
- Messages appear in speech bubbles
- Typewriter animation (30ms per character)
- Messages queue if multiple arrive

---

### AI Agents

Two AI agents provide personalized guidance through Kiro.

**Focus Coach:**
- Motivational messages when sessions start
- Celebrates your completions with specific stats
- Supportive feedback if you abandon
- Suggests optimal session durations based on your history
- Welcome-back messages after breaks

**Cloud Architect:**
- Explains each component you purchase
- Uses real-world analogies (e.g., "S3 is like a filing cabinet")
- Suggests what to buy next based on your architecture
- Recognizes patterns (e.g., "You've built a 3-tier architecture!")
- References your goal in explanations

---

### Goal-Based Recommendations

Tell Nimbus what you want to build for personalized guidance.

**Setting a Goal:**
1. Go to the **Shop** tab
2. Find the **Goal** input field
3. Type what you want to build:
   - "Static website"
   - "Serverless API"
   - "Netflix-style streaming"
   - "E-commerce platform"
4. Click **Set Goal**

**What Happens:**
- Architect provides a summary of your goal
- Recommended components get a **"Recommended"** badge
- Future explanations reference your goal
- Canvas feedback relates to your objective

**Example Goals:**
| Goal | Recommended Components |
|------|----------------------|
| "Static website" | S3, CloudFront, Route 53 |
| "Serverless API" | Lambda, DynamoDB, SQS, Cognito |
| "Netflix clone" | S3, CloudFront, EC2, ElastiCache, DynamoDB |
| "Uber-style app" | EC2, RDS, Load Balancer, SQS, SNS |

---

### Session History

Track your focus progress over time.

**Viewing History:**
1. Click the **History** tab
2. Sessions are grouped by date:
   - Today
   - Yesterday
   - This Week
   - Earlier

**Session Entry Shows:**
- ✅ or ❌ completion status
- Time of session
- Duration
- Credits earned

**Statistics:**
- Total sessions completed
- Total focus time
- Completion rate percentage
- Average session length
- Current streak

---

## Saving Your Progress

### Cloud Auto-Save (Automatic)

If the backend is configured:
- Progress saves automatically after:
  - Completing a session
  - Purchasing a component
  - Placing/removing on canvas
  - Importing data
- Uses anonymous ID (no login required)
- Survives browser refresh

### JSON Export/Import (Manual Backup)

**Export:**
1. Go to **History** tab
2. Click **Export**
3. Save the `.json` file

**Import:**
1. Go to **History** tab
2. Click **Import**
3. Select your backup file
4. Data is restored

**What's Saved:**
- All session history
- Current credits
- Owned components
- Canvas layout and connections
- Current streak

---

## Tips for Success

### Maximize Your Credits

1. **Build streaks**: Focus every day for up to 50% bonus
2. **Avoid pausing**: Complete sessions without breaks for 20% bonus
3. **Go long**: 60+ minute sessions earn 10% extra
4. **Finish strong**: Completing earns 20% more than abandoning

### Learn Cloud Architecture

1. **Read explanations**: The Architect teaches real AWS concepts
2. **Follow the links**: Each component has official AWS docs
3. **Build patterns**: Try recreating real architectures:
   - 3-tier web app (EC2 + RDS + Load Balancer)
   - Serverless API (Lambda + DynamoDB + API Gateway)
   - Static site (S3 + CloudFront + Route 53)
4. **Set goals**: Get personalized recommendations

### Stay Focused

1. **Start small**: 15-25 minute sessions build the habit
2. **Use presets**: Don't overthink duration
3. **Trust the timer**: It works even in background tabs
4. **Listen to Kiro**: The Focus Coach knows your patterns

---

## Troubleshooting

### Timer Issues

**Timer seems inaccurate:**
- The timer uses timestamps, not intervals
- It self-corrects when you return to the tab
- Drift > 2 seconds is automatically fixed

**Timer doesn't start:**
- Ensure you selected a duration first
- Check browser console for errors

### AI Agent Issues

**No messages from Kiro:**
- AI agents require an OpenAI API key
- Check that `VITE_OPENAI_API_KEY` is set in `.env`
- Fallback messages appear if API fails

**Messages seem generic:**
- API may have timed out (5 second limit)
- Fallback dialogue bank is used
- This is normal and doesn't affect functionality

### Save/Load Issues

**Progress not saving:**
- Cloud save requires backend setup
- Use JSON export as backup
- Check browser console for API errors

**Import fails:**
- Ensure file is valid JSON
- Check version compatibility
- File must have correct structure

### Canvas Issues

**Can't connect components:**
- Check connection rules (not all connections are valid)
- Read the error message for guidance
- Some components can only be destinations (CloudWatch)

**Components won't place:**
- Ensure you own the component
- Check if grid position is occupied
- Try a different location

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Start/Pause Timer | `Space` (when timer focused) |
| Navigate tabs | `Tab` |
| Select component | `Enter` |
| Cancel action | `Escape` |

---

## Glossary

| Term | Definition |
|------|------------|
| Cloud Credits | Virtual currency earned from focus sessions |
| Focus Session | A timed period of concentrated work |
| Streak | Consecutive days with completed sessions |
| Component | An AWS-style infrastructure service |
| Tier | Upgrade level of a component (1-4) |
| Canvas | Visual grid for arranging components |
| Connection | A link between two components |
| Kiro | The ghost mascot character |
| Focus Coach | AI agent for motivation |
| Cloud Architect | AI agent for education |

---

## Getting Help

- **In-app**: Kiro provides contextual guidance
- **Documentation**: Click "More Info" on any component
- **AWS Docs**: Links provided for each service
- **GitHub**: Report issues at the project repository

Happy focusing! 🎯👻☁️
