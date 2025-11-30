import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Clock, ShoppingBag, Layout, History } from 'lucide-react';
import Timer from './components/Timer';
import ComponentShop from './components/ComponentShop';
import InfrastructureCanvas from './components/InfrastructureCanvas';
import SessionHistory from './components/SessionHistory';
import KiroMascot from './components/KiroMascot';
import CreditDisplay from './components/CreditDisplay';
import { useFocusCoach } from './hooks/useAgents';

// Navigation component
function Navigation() {
  const { state, actions } = useApp();
  const { activeView } = state.uiState;
  
  const navItems = [
    { id: 'timer', label: 'Timer', icon: Clock },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'canvas', label: 'Canvas', icon: Layout },
    { id: 'history', label: 'History', icon: History },
  ];
  
  return (
    <nav className="flex justify-center gap-2 p-4">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => actions.setActiveView(id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth ${
            activeView === id
              ? 'bg-kiro-purple text-kiro-bg'
              : 'bg-kiro-bg border border-kiro-purple/30 text-kiro-purple hover:border-kiro-purple'
          }`}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

// Credit display in header with animated counter
function CreditHeader() {
  const { state } = useApp();
  const { credits } = state.userProgress;
  
  return (
    <div className="flex items-center justify-end p-4">
      <CreditDisplay credits={credits} />
    </div>
  );
}

// Re-engagement check on app load
function ReEngagementChecker() {
  const { checkReEngagement } = useFocusCoach();
  
  useEffect(() => {
    // Check for re-engagement on mount (after a short delay)
    const timer = setTimeout(() => {
      checkReEngagement();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [checkReEngagement]);
  
  return null;
}

// View components
function TimerView() {
  return <Timer />;
}

function ShopView() {
  return <ComponentShop />;
}

function CanvasView() {
  return <InfrastructureCanvas />;
}

function HistoryView() {
  return <SessionHistory />;
}

// Main content area that switches between views
function MainContent() {
  const { state } = useApp();
  const { activeView } = state.uiState;
  
  const views = {
    timer: TimerView,
    shop: ShopView,
    canvas: CanvasView,
    history: HistoryView,
  };
  
  const ViewComponent = views[activeView] || TimerView;
  
  return <ViewComponent />;
}

// Kiro mascot wrapper
function KiroMascotWrapper() {
  const { state } = useApp();
  const { kiroEmotion, kiroMessage } = state.uiState;
  
  return (
    <KiroMascot 
      emotion={kiroEmotion} 
      message={kiroMessage}
    />
  );
}

// App layout component
function AppLayout() {
  return (
    <div className="h-screen bg-kiro-bg flex flex-col overflow-hidden">
      {/* Re-engagement checker (invisible) */}
      <ReEngagementChecker />
      
      {/* Header with credits */}
      <header className="border-b border-kiro-purple/20 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <div className="py-3">
            <h1 className="text-xl font-bold text-kiro-purple">Kiro Focus</h1>
          </div>
          <CreditHeader />
        </div>
      </header>
      
      {/* Navigation */}
      <div className="flex-shrink-0">
        <Navigation />
      </div>
      
      {/* Main content area - fills remaining space */}
      <main className="flex-1 max-w-6xl mx-auto w-full overflow-auto">
        <MainContent />
      </main>
      
      {/* Kiro mascot (fixed position) */}
      <KiroMascotWrapper />
    </div>
  );
}

// Root App component with provider
function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}

export default App;
