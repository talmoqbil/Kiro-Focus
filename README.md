# Kiro Focus

A gamified focus timer that rewards users with "Cloud Credits" for completing timed focus sessions. Users spend credits to purchase AWS-style cloud infrastructure components and arrange them on a visual canvas, learning cloud architecture concepts through play.

---

## 🎃 Kiroween Hackathon - Kiro IDE Development Workflow

This project was built for the **Kiroween Hackathon**, demonstrating advanced usage of Kiro IDE features for spec-driven development.

### Kiro Features Used

| Feature | Location | Purpose |
|---------|----------|---------|
| **Spec-Driven Development** | [.kiro/specs/kiro-focus/](.kiro/specs/kiro-focus/) | Requirements → Design → Tasks workflow |
| **Steering Documents** | [.kiro/steering/](.kiro/steering/) | Product, structure, and tech guidance |
| **Agent Hooks** | [.kiro/hooks/](.kiro/hooks/) | Automated quality checks and compliance |
| **MCP Integration** | [.kiro/settings/mcp.json](.kiro/settings/mcp.json) | AWS docs and web fetch capabilities |

### 📚 Development Process Documentation

| Document | Description |
|----------|-------------|
| [Development Workflow](.kiro/docs/development-workflow.md) | Comprehensive overview of the entire development process |
| [MCP Usage](.kiro/docs/mcp-usage.md) | How MCP servers enhanced development |
| [Hook Usage](.kiro/docs/hook-usage.md) | Agent hook implementation and impact |

### Key Metrics

| Metric | Value |
|--------|-------|
| Requirements tracked | 40+ acceptance criteria |
| Correctness Properties | 35+ formal properties |
| Implementation tasks | 27 completed systematically |
| Components built | 8 major React components |
| Agent hook invocations | ~72 quality checks |
| MCP queries | ~50 documentation lookups |

### Spec-Driven Development Highlights

**Requirements Document** ([requirements.md](.kiro/specs/kiro-focus/requirements.md)):
- 20 user stories with EARS-compliant acceptance criteria
- Clear scope boundaries preventing feature creep
- Testable criteria mapping to property-based tests

**Design Document** ([design.md](.kiro/specs/kiro-focus/design.md)):
- Architecture overview with component relationships
- Data models for all application state
- 35+ correctness properties for formal verification
- Testing strategy with property-based testing approach

**Tasks Document** ([tasks.md](.kiro/specs/kiro-focus/tasks.md)):
- 27 granular, actionable implementation tasks
- Full traceability to requirements
- Systematic progress tracking

---

## Features

### 🎯 Focus Timer
- Preset durations: 15, 25, 45, 60, 90 minutes
- Accurate timing even when browser tab is inactive
- Pause/resume with pause count tracking
- Visual progress ring with animations

### 💰 Cloud Credits System
- Earn credits based on session duration
- Streak bonuses for consecutive days
- Completion bonuses for finishing sessions
- Spend credits in the Component Shop

### 🛒 Component Shop
- 16 AWS-style infrastructure components
- Categories: Compute, Storage, Database, Serverless, Edge, Security, and more
- Upgrade paths with real AWS tier names
- Documentation links to learn about each service

### 🏗️ Infrastructure Canvas
- Visual 800x600 grid canvas
- Drag-and-drop component placement
- Connection mode for wiring components together
- Category-based connection validation with educational feedback
- Component upgrades with tier progression

### 👻 Kiro Mascot
- Animated ghost companion
- 5 emotion states: idle, encouraging, celebrating, concerned, teaching
- Typewriter message display
- Contextual reactions to user actions

### 🤖 AI Agents
- **Focus Coach**: Motivation and session feedback
- **Cloud Architect**: Component explanations and architecture guidance
- Goal-aware responses based on user's architecture objective

### ☁️ Cloud State Persistence
- Save/load state to AWS (DynamoDB + Lambda)
- JSON export/import for local backup
- Auto-save on significant actions

---

## Tech Stack

- **Frontend**: React 18.3, Vite 5.4, Tailwind CSS 3.4
- **Testing**: Vitest 2.1, fast-check (property-based testing)
- **AI**: OpenAI GPT-4o-mini for agent responses
- **Backend**: AWS Lambda, DynamoDB, API Gateway
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key (for AI agents)

### Installation

```bash
# Clone the repository
git clone https://github.com/talmoqbil/Kiro-Focus.git
cd Kiro-Focus/kiro-focus

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your OpenAI API key

# Start development server
npm run dev
```

### Environment Variables

```bash
# Required for AI agents
VITE_OPENAI_API_KEY=your-openai-api-key

# Optional: Cloud state persistence
VITE_API_BASE_URL=https://your-api-gateway-url
```

---

## Project Structure

```
kiro-focus/
├── src/
│   ├── App.jsx              # Root component
│   ├── components/          # React components
│   │   ├── FocusTimer.jsx
│   │   ├── ComponentShop.jsx
│   │   ├── InfrastructureCanvas.jsx
│   │   ├── KiroMascot.jsx
│   │   └── ...
│   ├── context/
│   │   └── AppContext.jsx   # Global state management
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Pure utility functions
│   ├── agents/              # AI agent integration
│   ├── data/                # Static data (components catalog)
│   └── __tests__/           # Test files
├── public/                  # Static assets
└── .kiro/                   # Kiro IDE configuration
    ├── specs/               # Spec-driven development
    ├── steering/            # Steering documents
    ├── hooks/               # Agent hooks
    ├── settings/            # MCP configuration
    └── docs/                # Development documentation
```

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
npm run test     # Run tests (vitest watch mode)
npm run lint     # ESLint check
```

---

## Backend Setup

See [backend/README.md](backend/README.md) for AWS Lambda and DynamoDB setup instructions.

---

## License

MIT

---

## Acknowledgments

Built with [Kiro IDE](https://kiro.dev) for the Kiroween Hackathon 🎃
