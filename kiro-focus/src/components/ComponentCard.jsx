import { 
  Server, Database, HardDrive, GitBranch, Globe, Lock, Check, Zap,
  MessageSquare, Bell, Workflow, Users, Shield, Activity
} from 'lucide-react';
import { getPurchaseState, isComponentOwned } from '../utils/shopLogic';
import { CATEGORY_DISPLAY_NAMES } from '../utils/connectionRules';

/**
 * ComponentCard Component
 * 
 * Displays a single infrastructure component in the shop.
 * Shows AWS icon, name, description, cost, and purchase state.
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 16.1**
 */

// Fallback icon mapping for component types (if AWS icon fails)
const ICON_MAP = {
  Server: Server,
  Database: Database,
  HardDrive: HardDrive,
  GitBranch: GitBranch,
  Globe: Globe,
  Zap: Zap,
  MessageSquare: MessageSquare,
  Bell: Bell,
  Workflow: Workflow,
  Users: Users,
  Shield: Shield,
  Activity: Activity
};

// AWS Icon component with fallback
function AwsIcon({ component, size = 32, className = '' }) {
  const FallbackIcon = ICON_MAP[component.icon] || Server;
  
  if (component.awsIcon) {
    return (
      <img 
        src={component.awsIcon} 
        alt={component.name}
        className={`${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
    );
  }
  
  return <FallbackIcon size={size} className={className} />;
}

export default function ComponentCard({ 
  component, 
  credits, 
  ownedComponents,
  onPurchase,
  onMoreInfo
}) {
  const purchaseState = getPurchaseState(component, credits, ownedComponents);
  const isOwned = isComponentOwned(component.id, ownedComponents);
  const IconComponent = ICON_MAP[component.icon] || Server;

  // Style configurations based on purchase state
  const stateStyles = {
    owned: {
      border: 'border-kiro-success/50',
      bg: 'bg-kiro-success/10',
      icon: 'text-kiro-success',
      button: null // No button for owned
    },
    available: {
      border: 'border-kiro-purple/30 hover:border-kiro-purple',
      bg: 'bg-kiro-bg-light hover:bg-kiro-purple/5',
      icon: 'text-kiro-purple',
      button: 'bg-kiro-success hover:bg-kiro-success/80 text-white'
    },
    insufficient: {
      border: 'border-kiro-warning/30',
      bg: 'bg-kiro-bg-light',
      icon: 'text-kiro-warning/70',
      button: 'bg-gray-600 cursor-not-allowed text-gray-400'
    },
    locked: {
      border: 'border-gray-600/30',
      bg: 'bg-kiro-bg-light opacity-60',
      icon: 'text-gray-500',
      button: null // No button for locked
    }
  };

  const styles = stateStyles[purchaseState];

  return (
    <div 
      className={`relative rounded-xl border p-4 transition-all duration-200 ${styles.border} ${styles.bg}`}
    >
      {/* Owned badge */}
      {purchaseState === 'owned' && (
        <div className="absolute -top-2 -right-2 bg-kiro-success rounded-full p-1">
          <Check size={14} className="text-white" />
        </div>
      )}

      {/* Locked overlay */}
      {purchaseState === 'locked' && (
        <div className="absolute inset-0 flex items-center justify-center bg-kiro-bg/50 rounded-xl">
          <div className="text-center">
            <Lock size={24} className="mx-auto text-gray-500 mb-1" />
            <p className="text-xs text-gray-500">Locked</p>
          </div>
        </div>
      )}

      {/* Header with AWS icon and category */}
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-kiro-bg ${styles.icon}`}>
          <AwsIcon component={component} size={32} />
        </div>
        <span className="text-xs text-kiro-purple/60 bg-kiro-purple/10 px-2 py-1 rounded">
          {CATEGORY_DISPLAY_NAMES[component.category] || component.category}
        </span>
      </div>

      {/* Name and description */}
      <h3 className="text-white font-semibold mb-1">{component.name}</h3>
      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{component.description}</p>

      {/* Cost display */}
      <div className="flex items-center gap-1 mb-3">
        <Zap size={16} className="text-kiro-warning" />
        <span className={`font-bold ${
          purchaseState === 'insufficient' ? 'text-kiro-warning' : 'text-white'
        }`}>
          {component.cost}
        </span>
        <span className="text-gray-500 text-sm">credits</span>
        {purchaseState === 'insufficient' && (
          <span className="text-xs text-kiro-warning ml-1">
            (need {component.cost - credits} more)
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {purchaseState === 'owned' ? (
          <button
            onClick={() => onMoreInfo(component)}
            className="flex-1 py-2 px-3 text-sm rounded-lg border border-kiro-purple/30 
                     text-kiro-purple hover:bg-kiro-purple/10 transition-colors"
          >
            View Details
          </button>
        ) : purchaseState === 'locked' ? (
          <button
            onClick={() => onMoreInfo(component)}
            className="flex-1 py-2 px-3 text-sm rounded-lg border border-gray-600/30 
                     text-gray-500 hover:bg-gray-600/10 transition-colors"
          >
            View Requirements
          </button>
        ) : (
          <>
            <button
              onClick={() => onPurchase(component)}
              disabled={purchaseState === 'insufficient'}
              className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${styles.button}`}
            >
              {purchaseState === 'insufficient' ? 'Not Enough' : 'Purchase'}
            </button>
            <button
              onClick={() => onMoreInfo(component)}
              className="py-2 px-3 text-sm rounded-lg border border-kiro-purple/30 
                       text-kiro-purple hover:bg-kiro-purple/10 transition-colors"
            >
              Info
            </button>
          </>
        )}
      </div>
    </div>
  );
}
