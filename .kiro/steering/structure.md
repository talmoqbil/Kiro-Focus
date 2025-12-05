# Project Structure

```
nimbus/
├── src/
│   ├── App.jsx              # Root component with layout and navigation
│   ├── main.jsx             # React entry point
│   ├── index.css            # Global styles and Tailwind imports
│   ├── components/          # Reusable UI components
│   ├── context/
│   │   └── AppContext.jsx   # Global state management (useReducer)
│   ├── hooks/               # Custom React hooks
│   ├── utils/
│   │   └── creditCalculator.js  # Credit calculation logic
│   ├── data/                # Static data (component catalog, dialogues)
│   ├── agents/              # AI agent integration (Focus Coach, Architect)
│   └── __tests__/           # Test files
├── public/                  # Static assets
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind theme (custom colors, animations)
└── package.json
```

## Architecture Patterns

- Single-page application with view switching (timer, shop, canvas, history)
- Centralized state via React Context (`AppProvider` wraps app)
- Access state and actions via `useApp()` hook
- Pure utility functions in `utils/` for testable business logic
- Fixed-position Kiro mascot component overlays all views

## State Structure

- `userProgress`: credits, streak, session history, owned components
- `timerState`: active, paused, timeRemaining, pauseCount
- `architecture`: placed components and connections on canvas
- `uiState`: active view, Kiro messages, modals
