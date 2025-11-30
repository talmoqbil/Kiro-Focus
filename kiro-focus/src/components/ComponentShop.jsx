import { useState } from 'react';
import { Server, Database, HardDrive, GitBranch, Globe, Zap, Lock, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COMPONENTS_CATALOG, getComponentById } from '../data/components';
import { canPurchase, processPurchase } from '../utils/shopLogic';
import ComponentCard from './ComponentCard';
import Modal from './Modal';
import { useArchitect } from '../hooks/useAgents';
import { useCloudState } from '../App';

/**
 * ComponentShop Component
 * 
 * Main shop interface for browsing and purchasing infrastructure components.
 * Features:
 * - Grid display of all components
 * - "More Info" modal with full description and real-world example
 * - Purchase flow with credit deduction
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**
 */

// Icon mapping for modal display
const ICON_MAP = {
  Server: Server,
  Database: Database,
  HardDrive: HardDrive,
  GitBranch: GitBranch,
  Globe: Globe
};

export default function ComponentShop() {
  const { state, actions } = useApp();
  const { userProgress } = state;
  const { credits, ownedComponents } = userProgress;
  
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Architect agent for purchase explanations
  const { onPurchase: notifyArchitect } = useArchitect();
  
  // Cloud state for auto-save
  const { triggerCloudSave } = useCloudState();

  // Handle purchase
  const handlePurchase = (component) => {
    const result = processPurchase(component, credits, ownedComponents);
    
    if (result.success) {
      actions.spendCredits(component.cost);
      actions.addOwnedComponent(component.id);
      
      // Trigger Architect Agent to explain the component
      notifyArchitect(component.id);
      
      // Auto-save to cloud after purchase (Requirements 13.7)
      // Use setTimeout to ensure state is updated before saving
      setTimeout(() => {
        triggerCloudSave();
      }, 100);
    }
  };

  // Handle more info click
  const handleMoreInfo = (component) => {
    setSelectedComponent(component);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedComponent(null);
  };

  // Get prerequisite info for modal
  const getPrerequisiteInfo = (component) => {
    if (!component.prerequisites || component.prerequisites.length === 0) {
      return null;
    }
    
    return component.prerequisites.map(prereqId => {
      const prereq = getComponentById(prereqId);
      const owned = ownedComponents.includes(prereqId);
      return { ...prereq, owned };
    });
  };

  const IconComponent = selectedComponent ? ICON_MAP[selectedComponent.icon] : Server;

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Component Shop</h1>
        <p className="text-gray-400">
          Purchase AWS-style infrastructure components to build your architecture
        </p>
        <div className="flex items-center gap-2 mt-3 text-kiro-warning">
          <Zap size={20} />
          <span className="font-bold text-lg">{credits}</span>
          <span className="text-gray-400">credits available</span>
        </div>
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPONENTS_CATALOG.map(component => (
          <ComponentCard
            key={component.id}
            component={component}
            credits={credits}
            ownedComponents={ownedComponents}
            onPurchase={handlePurchase}
            onMoreInfo={handleMoreInfo}
          />
        ))}
      </div>

      {/* More Info Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedComponent?.name || 'Component Details'}
        size="lg"
      >
        {selectedComponent && (
          <div className="space-y-4">
            {/* Component header */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-kiro-purple/20 text-kiro-purple">
                <IconComponent size={32} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-kiro-purple/20 text-kiro-purple px-2 py-1 rounded">
                    {selectedComponent.category}
                  </span>
                  <span className="text-xs bg-kiro-bg text-gray-400 px-2 py-1 rounded">
                    Tier {selectedComponent.tier}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-kiro-warning" />
                  <span className="font-bold text-white text-lg">{selectedComponent.cost}</span>
                  <span className="text-gray-500">credits</span>
                </div>
              </div>
            </div>

            {/* Full description */}
            <div>
              <h4 className="text-sm font-semibold text-kiro-purple mb-2">Description</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {selectedComponent.fullDescription}
              </p>
            </div>

            {/* Real-world example */}
            <div className="bg-kiro-bg rounded-lg p-3">
              <h4 className="text-sm font-semibold text-kiro-success mb-2 flex items-center gap-2">
                <ExternalLink size={14} />
                Real-World Example
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                {selectedComponent.realWorldExample}
              </p>
            </div>

            {/* Prerequisites */}
            {selectedComponent.prerequisites && selectedComponent.prerequisites.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-kiro-warning mb-2 flex items-center gap-2">
                  <Lock size={14} />
                  Prerequisites
                </h4>
                <div className="flex flex-wrap gap-2">
                  {getPrerequisiteInfo(selectedComponent)?.map(prereq => (
                    <span 
                      key={prereq.id}
                      className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                        prereq.owned 
                          ? 'bg-kiro-success/20 text-kiro-success' 
                          : 'bg-kiro-warning/20 text-kiro-warning'
                      }`}
                    >
                      {prereq.owned ? '✓' : '○'} {prereq.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Upgrade path preview */}
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Upgrade Path (Phase 2)</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedComponent.upgradeTree.map((tier, index) => (
                  <div 
                    key={tier.tier}
                    className={`flex-shrink-0 p-2 rounded-lg border text-xs ${
                      index === 0 
                        ? 'border-kiro-purple/50 bg-kiro-purple/10' 
                        : 'border-gray-600/30 bg-kiro-bg opacity-50'
                    }`}
                  >
                    <div className="font-semibold text-white">{tier.name}</div>
                    <div className="text-gray-500">{tier.cost} credits</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase button in modal */}
            {!ownedComponents.includes(selectedComponent.id) && (
              <div className="pt-2 border-t border-gray-700">
                {(() => {
                  const purchaseCheck = canPurchase(selectedComponent, credits, ownedComponents);
                  return purchaseCheck.canPurchase ? (
                    <button
                      onClick={() => {
                        handlePurchase(selectedComponent);
                        handleCloseModal();
                      }}
                      className="w-full py-3 bg-kiro-success hover:bg-kiro-success/80 
                               text-white font-medium rounded-lg transition-colors"
                    >
                      Purchase for {selectedComponent.cost} credits
                    </button>
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-2">
                      {purchaseCheck.message}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Already owned message */}
            {ownedComponents.includes(selectedComponent.id) && (
              <div className="pt-2 border-t border-gray-700">
                <div className="text-center text-kiro-success text-sm py-2 flex items-center justify-center gap-2">
                  <span>✓</span> You own this component
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
