import { useEffect, useState, useCallback, createContext, useContext, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Clock, ShoppingBag, Layout, History, Loader2 } from 'lucide-react';
import Timer from './components/Timer';
import ComponentShop from './components/ComponentShop';
import InfrastructureCanvas from './components/InfrastructureCanvas';
import SessionHistory from './components/SessionHistory';
import KiroMascot from './components/KiroMascot';
import CreditDisplay from './components/CreditDisplay';
import { useFocusCoach } from './hooks/useAgents';
import { getOrCreateUserId } from './utils/userId';
import { loadStateFromCloud, saveStateToCloud } from './api/cloudState';
import { buildCloudState, applyCloudState, isValidCloudState } from './utils/cloudState';

// Cloud State Context for sharing save function across components
const CloudStateContext = createContext(null);

export function useCloudState() {
  const context = useContext(CloudStateContext);
  if (!context) {
    // Return a no-op if used outside provider (graceful degradation)
    return { triggerCloudSave: () => {}, isLoading: false };
  }
  return context;
}

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

// Cloud state loading hook
function useCloudStateLoader() {
  const { state, actions } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const stateRef = useRef(state);
  const userIdRef = useRef(null);
  
  // Keep refs in sync with current values
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Load cloud state on mount (only once)
  useEffect(() => {
    let mounted = true;
    
    const loadCloudState = async () => {
      try {
        const id = getOrCreateUserId();
        if (!mounted) return;
        setUserId(id);
        userIdRef.current = id;
        
        const cloudState = await loadStateFromCloud(id);
        
        if (!mounted) return;
        
        if (cloudState && isValidCloudState(cloudState)) {
          applyCloudState(cloudState, actions);
        }
      } catch (error) {
        console.warn('Cloud state load failed, using defaults:', error.message);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setHasLoaded(true);
        }
      }
    };

    loadCloudState();
    
    return () => { mounted = false; };
  }, []); // Empty deps - only run once on mount

  // Trigger a save using current state from ref
  const triggerCloudSave = useCallback(() => {
    if (!userIdRef.current || !hasLoaded) return;
    
    // Use setTimeout to ensure state has updated
    setTimeout(async () => {
      try {
        const cloudState = buildCloudState(stateRef.current);
        await saveStateToCloud(userIdRef.current, cloudState);
        console.log('Cloud state saved successfully');
      } catch (error) {
        console.warn('Cloud state save failed:', error.message);
      }
    }, 200);
  }, [hasLoaded]);

  return { isLoading, triggerCloudSave, userId };
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

// Loading indicator component
function LoadingIndicator() {
  return (
    <div className="h-screen bg-kiro-bg flex flex-col items-center justify-center">
      <Loader2 size={48} className="text-kiro-purple animate-spin mb-4" />
      <p className="text-kiro-purple/70 text-sm">Loading your progress...</p>
    </div>
  );
}

// App layout component with cloud state integration
function AppLayoutWithCloudState() {
  const { isLoading, triggerCloudSave } = useCloudStateLoader();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <CloudStateContext.Provider value={{ triggerCloudSave, isLoading }}>
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
    </CloudStateContext.Provider>
  );
}

// Root App component with provider
function App() {
  return (
    <AppProvider>
      <AppLayoutWithCloudState />
    </AppProvider>
  );
}

export default App;
