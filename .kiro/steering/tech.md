# Tech Stack & Build System

## Core Technologies

- React 18.3 with JSX (functional components, hooks)
- Vite 5.4 for build tooling and dev server
- Tailwind CSS 3.4 for styling
- Vitest 2.1 for testing
- fast-check for property-based testing

## Key Libraries

- lucide-react: Icon library
- PostCSS + Autoprefixer: CSS processing

## State Management

- React Context API with useReducer pattern
- Centralized state in `AppContext.jsx`

## Common Commands

```bash
# Development
npm run dev      # Start dev server

# Build
npm run build    # Production build
npm run preview  # Preview production build

# Testing
npm run test     # Run tests (vitest watch mode)
npx vitest --run # Single test run

# Linting
npm run lint     # ESLint check
```

## Code Style

- ES Modules (`"type": "module"`)
- Functional React components with hooks
- JSX file extension for React components
- Tailwind utility classes for styling (no separate CSS modules)
- Custom Tailwind theme colors prefixed with `kiro-` (e.g., `bg-kiro-bg`, `text-kiro-purple`)

## Testing Conventions

- Test files in `src/__tests__/` directory
- Property-based tests annotated with: `// **Feature: nimbus, Property {number}: {description}**`
- Use fast-check for property-based testing
- Vitest globals enabled (`globals: true`)
