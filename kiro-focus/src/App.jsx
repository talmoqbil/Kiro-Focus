import { AppProvider, useApp } from './context/AppContext';
import { Zap, Clock, ShoppingBag, Layout, History } from 'lucide-react';

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

// Credit display in header
function CreditHeader() {
  const { state } = useApp();
  const { credits } = state.userProgress;
  
  return (
    <div className="flex items-center justify-end p-4">
      <div className="flex items-center gap-2 bg-kiro-bg border border-kiro-purple/30 rounded-lg px-4 py-2">
        <Zap className="text-kiro-warning" size={20} />
        <span className="text-xl font-bold text-white">{credits}</span>
        <span className="text-kiro-purple/70 text-sm">credits</span>
      </div>
    </div>
  );
}

// Placeholder components for each view
function TimerView() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-kiro-purple mb-4">Focus Timer</h2>
        <p className="text-white/70">Timer component will be implemented in Task 3</p>
      </div>
    </div>
  );
}

function ShopView() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-kiro-purple mb-4">Component Shop</h2>
        <p className="text-white/70">Shop component will be implemented in Task 6</p>
      </div>
    </div>
  );
}

function CanvasView() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-kiro-purple mb-4">Infrastructure Canvas</h2>
        <p className="text-white/70">Canvas component will be implemented in Task 7</p>
      </div>
    </div>
  );
}

function HistoryView() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-kiro-purple mb-4">Session History</h2>
        <p className="text-white/70">History component will be implemented in Task 8</p>
      </div>
    </div>
  );
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

// Kiro mascot placeholder (fixed position)
function KiroMascotPlaceholder() {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="w-24 h-28 bg-white/85 rounded-[50%_50%_45%_45%] shadow-kiro-glow animate-kiro-float relative">
        {/* Eyes */}
        <div className="absolute top-10 left-7 w-3 h-3 bg-black rounded-full" />
        <div className="absolute top-10 right-7 w-3 h-3 bg-black rounded-full" />
      </div>
      <p className="text-center text-xs text-kiro-purple/70 mt-2">Kiro</p>
    </div>
  );
}

// App layout component
function AppLayout() {
  return (
    <div className="min-h-screen bg-kiro-bg flex flex-col">
      {/* Header with credits */}
      <header className="border-b border-kiro-purple/20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-kiro-purple">Kiro Focus</h1>
          </div>
          <CreditHeader />
        </div>
      </header>
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main content area */}
      <main className="flex-1 max-w-6xl mx-auto w-full">
        <MainContent />
      </main>
      
      {/* Kiro mascot (fixed position) */}
      <KiroMascotPlaceholder />
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
