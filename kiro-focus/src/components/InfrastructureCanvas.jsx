import { useState, useRef } from 'react';
import { Server, Database, HardDrive, GitBranch, Globe, Trash2, Plus, ArrowUp, Zap, Link2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getComponentById } from '../data/components';
import { useArchitect } from '../hooks/useAgents';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRID_SIZE,
  snapToGrid,
  isValidPlacement,
  generateComponentId,
  findAvailablePosition,
  isCanvasEmpty
} from '../utils/canvasLogic';
import Modal from './Modal';
import { useCloudState } from '../App';

/**
 * InfrastructureCanvas Component
 * 
 * Visual grid canvas for placing and arranging infrastructure components.
 * Features:
 * - 800x600 canvas with 40x40 grid background
 * - Drag-and-drop with ghost preview
 * - Snap-to-grid placement
 * - Component hover highlighting and tooltips
 * - Component click for info modal (remove option)
 * - Empty state message
 * 
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**
 */

// Icon mapping
const ICON_MAP = {
  Server: Server,
  Database: Database,
  HardDrive: HardDrive,
  GitBranch: GitBranch,
  Globe: Globe
};

export default function InfrastructureCanvas() {
  const { state, actions } = useApp();
  const { architecture, userProgress } = state;
  const { placedComponents } = architecture;
  const { ownedComponents, credits } = userProgress;
  
  const canvasRef = useRef(null);
  const [draggedComponent, setDraggedComponent] = useState(null);
  const [draggedPlacedComponent, setDraggedPlacedComponent] = useState(null); // For moving placed components
  const [ghostPosition, setGhostPosition] = useState(null);
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Connection mode state
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState(null); // First component selected for connection
  
  // Architect agent for upgrade explanations
  const { onPurchase: notifyArchitect } = useArchitect();
  
  // Cloud state for auto-save
  const { triggerCloudSave } = useCloudState();

  // Get unplaced owned components (available for placement)
  const getUnplacedComponents = () => {
    const placedIds = placedComponents.map(c => c.type.toLowerCase());
    return ownedComponents
      .filter(id => {
        // Count how many of this type are placed vs owned
        const placedCount = placedComponents.filter(
          p => p.type.toLowerCase() === id
        ).length;
        // For now, allow one of each type (can be extended for multiples)
        return placedCount === 0;
      })
      .map(id => getComponentById(id))
      .filter(Boolean);
  };

  const unplacedComponents = getUnplacedComponents();

  // Handle drag start from inventory
  const handleDragStart = (e, component) => {
    setDraggedComponent(component);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over canvas
  const handleDragOver = (e) => {
    e.preventDefault();
    if ((!draggedComponent && !draggedPlacedComponent) || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const snapped = snapToGrid({ x, y });
    setGhostPosition(snapped);
  };

  // Handle drop on canvas
  const handleDrop = (e) => {
    e.preventDefault();
    
    // Handle moving a placed component
    if (draggedPlacedComponent && ghostPosition) {
      // Filter out the component being moved for valid placement check
      const otherComponents = placedComponents.filter(c => c.id !== draggedPlacedComponent.id);
      if (isValidPlacement(ghostPosition, otherComponents)) {
        // Remove old position and add new
        actions.removeComponent(draggedPlacedComponent.id);
        actions.placeComponent({
          ...draggedPlacedComponent,
          position: ghostPosition
        });
        
        // Auto-save to cloud after component move (Requirements 13.8)
        setTimeout(() => {
          triggerCloudSave();
        }, 100);
      }
      setDraggedPlacedComponent(null);
      setGhostPosition(null);
      return;
    }
    
    // Handle placing a new component from inventory
    if (!draggedComponent || !ghostPosition) return;

    // Check if placement is valid
    if (isValidPlacement(ghostPosition, placedComponents)) {
      const newComponent = {
        id: generateComponentId(draggedComponent.type, placedComponents),
        type: draggedComponent.type,
        position: ghostPosition,
        tier: 1
      };
      
      actions.placeComponent(newComponent);
      
      // Auto-save to cloud after component placement (Requirements 13.8)
      setTimeout(() => {
        triggerCloudSave();
      }, 100);
    }

    // Reset drag state
    setDraggedComponent(null);
    setGhostPosition(null);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setGhostPosition(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedComponent(null);
    setDraggedPlacedComponent(null);
    setGhostPosition(null);
  };

  // Handle drag start for placed component (to move it)
  const handlePlacedComponentDragStart = (e, placed) => {
    e.stopPropagation();
    setDraggedPlacedComponent(placed);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Quick place component (auto-find position)
  const handleQuickPlace = (component) => {
    const position = findAvailablePosition(placedComponents);
    if (position) {
      const newComponent = {
        id: generateComponentId(component.type, placedComponents),
        type: component.type,
        position,
        tier: 1
      };
      actions.placeComponent(newComponent);
      
      // Auto-save to cloud after component placement (Requirements 13.8)
      setTimeout(() => {
        triggerCloudSave();
      }, 100);
    }
  };

  // Handle component click
  const handleComponentClick = (placed) => {
    const componentData = getComponentById(placed.type.toLowerCase());
    setSelectedComponent({ ...placed, data: componentData });
    setShowModal(true);
  };

  // Handle remove component
  const handleRemove = () => {
    if (selectedComponent) {
      actions.removeComponent(selectedComponent.id);
      setShowModal(false);
      setSelectedComponent(null);
      
      // Auto-save to cloud after component removal (Requirements 13.8)
      setTimeout(() => {
        triggerCloudSave();
      }, 100);
    }
  };

  // Handle upgrade component
  const handleUpgrade = () => {
    if (!selectedComponent || !selectedComponent.data) return;
    
    const currentTier = selectedComponent.tier;
    const upgradeTree = selectedComponent.data.upgradeTree;
    
    // Find next tier
    const nextTierIndex = upgradeTree.findIndex(t => t.tier === currentTier + 1);
    if (nextTierIndex === -1) return; // Already max tier
    
    const nextTier = upgradeTree[nextTierIndex];
    
    // Check if user has enough credits
    if (credits < nextTier.cost) return;
    
    // Deduct credits and upgrade
    actions.spendCredits(nextTier.cost);
    actions.upgradeComponent(selectedComponent.id, nextTier.tier);
    
    // Update selected component state
    setSelectedComponent(prev => ({
      ...prev,
      tier: nextTier.tier
    }));
    
    // Notify architect agent about the upgrade
    notifyArchitect(selectedComponent.data.id);
    
    // Auto-save to cloud after component upgrade (Requirements 13.8)
    setTimeout(() => {
      triggerCloudSave();
    }, 100);
  };

  // Get next upgrade tier info
  const getNextUpgrade = () => {
    if (!selectedComponent || !selectedComponent.data) return null;
    
    const currentTier = selectedComponent.tier;
    const upgradeTree = selectedComponent.data.upgradeTree;
    
    const nextTierIndex = upgradeTree.findIndex(t => t.tier === currentTier + 1);
    if (nextTierIndex === -1) return null;
    
    return upgradeTree[nextTierIndex];
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedComponent(null);
  };

  // Toggle connect mode
  const toggleConnectMode = () => {
    setConnectMode(!connectMode);
    setConnectFrom(null);
  };

  // Handle component click in connect mode
  const handleConnectClick = (placed) => {
    if (!connectMode) return;
    
    if (!connectFrom) {
      // First component selected
      setConnectFrom(placed);
    } else if (connectFrom.id !== placed.id) {
      // Second component selected - create connection
      const connectionExists = architecture.connections.some(
        conn => (conn.from === connectFrom.id && conn.to === placed.id) ||
                (conn.from === placed.id && conn.to === connectFrom.id)
      );
      
      if (!connectionExists) {
        actions.addConnection({
          from: connectFrom.id,
          to: placed.id,
          type: 'network'
        });
      }
      
      // Reset connection state
      setConnectFrom(null);
    }
  };

  // Remove a connection
  const handleRemoveConnection = (conn) => {
    // We need to add a removeConnection action - for now, we'll filter it out
    // This requires adding REMOVE_CONNECTION to AppContext
  };

  // Get center position of a placed component
  const getComponentCenter = (placed) => {
    return {
      x: placed.position.x + GRID_SIZE,
      y: placed.position.y + GRID_SIZE
    };
  };

  // Check if ghost position is valid (accounting for moving components)
  const getIsGhostValid = () => {
    if (!ghostPosition) return false;
    const componentsToCheck = draggedPlacedComponent 
      ? placedComponents.filter(c => c.id !== draggedPlacedComponent.id)
      : placedComponents;
    return isValidPlacement(ghostPosition, componentsToCheck);
  };
  const isGhostValid = getIsGhostValid();

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Infrastructure Canvas</h1>
          <p className="text-gray-400">
            {connectMode 
              ? 'Click two components to connect them' 
              : 'Drag components from your inventory to build your architecture'}
          </p>
        </div>
        <button
          onClick={toggleConnectMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            connectMode
              ? 'bg-kiro-purple text-kiro-bg'
              : 'bg-kiro-bg border border-kiro-purple/30 text-kiro-purple hover:border-kiro-purple'
          }`}
        >
          {connectMode ? <X size={18} /> : <Link2 size={18} />}
          {connectMode ? 'Cancel' : 'Connect Mode'}
        </button>
      </div>
      
      {/* Connection mode indicator */}
      {connectMode && connectFrom && (
        <div className="mb-4 p-2 bg-kiro-purple/20 border border-kiro-purple/30 rounded-lg text-sm text-kiro-purple">
          Selected: <span className="font-semibold">{connectFrom.type}</span> - Now click another component to connect
        </div>
      )}

      <div className="flex gap-6">
        {/* Component Inventory */}
        <div className="w-48 flex-shrink-0">
          <h3 className="text-sm font-semibold text-kiro-purple mb-3">Your Components</h3>
          
          {unplacedComponents.length === 0 ? (
            <p className="text-xs text-gray-500">
              {ownedComponents.length === 0 
                ? 'Complete focus sessions to earn credits and buy components!'
                : 'All components placed on canvas'}
            </p>
          ) : (
            <div className="space-y-2">
              {unplacedComponents.map(component => {
                const IconComponent = ICON_MAP[component.icon] || Server;
                return (
                  <div
                    key={component.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, component)}
                    onDragEnd={handleDragEnd}
                    className="flex items-center gap-2 p-2 bg-kiro-bg-light border border-kiro-purple/30 
                             rounded-lg cursor-grab hover:border-kiro-purple transition-colors group"
                  >
                    <div className="p-1.5 bg-kiro-purple/20 rounded text-kiro-purple">
                      <IconComponent size={16} />
                    </div>
                    <span className="text-sm text-white flex-1">{component.name}</span>
                    <button
                      onClick={() => handleQuickPlace(component)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-kiro-success 
                               hover:bg-kiro-success/20 rounded transition-all"
                      title="Quick place"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          className="relative border-2 border-kiro-purple/30 rounded-xl overflow-hidden"
          style={{ 
            width: CANVAS_WIDTH, 
            height: CANVAS_HEIGHT,
            background: `
              linear-gradient(to right, rgba(183, 148, 246, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(183, 148, 246, 0.1) 1px, transparent 1px),
              #0a0e27
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
          }}
        >
          {/* Connection lines SVG */}
          <svg 
            className="absolute inset-0 pointer-events-none" 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#b794f6" />
              </marker>
            </defs>
            {architecture.connections.map((conn, index) => {
              const fromComponent = placedComponents.find(c => c.id === conn.from);
              const toComponent = placedComponents.find(c => c.id === conn.to);
              
              if (!fromComponent || !toComponent) return null;
              
              const from = getComponentCenter(fromComponent);
              const to = getComponentCenter(toComponent);
              
              return (
                <g key={`${conn.from}-${conn.to}-${index}`}>
                  {/* Animated dashed line */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#b794f6"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    markerEnd="url(#arrowhead)"
                    className="animate-pulse"
                  />
                  {/* Data flow animation dots */}
                  <circle r="4" fill="#48bb78">
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path={`M${from.x},${from.y} L${to.x},${to.y}`}
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Empty state */}
          {isCanvasEmpty(placedComponents) && !draggedComponent && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-kiro-purple/10 
                              flex items-center justify-center">
                  <Server size={32} className="text-kiro-purple/50" />
                </div>
                <p className="text-gray-500 text-sm">
                  {ownedComponents.length === 0 
                    ? 'Complete focus sessions to earn credits and buy components!'
                    : 'Drag components here to build your architecture'}
                </p>
              </div>
            </div>
          )}

          {/* Placed components */}
          {placedComponents.map(placed => {
            const componentData = getComponentById(placed.type.toLowerCase());
            if (!componentData) return null;
            
            const IconComponent = ICON_MAP[componentData.icon] || Server;
            const isHovered = hoveredComponent === placed.id;
            const isBeingDragged = draggedPlacedComponent?.id === placed.id;
            const isConnectSource = connectFrom?.id === placed.id;
            
            return (
              <div
                key={placed.id}
                draggable={!connectMode}
                onDragStart={(e) => !connectMode && handlePlacedComponentDragStart(e, placed)}
                onDragEnd={handleDragEnd}
                className={`absolute transition-all duration-200 ${
                  connectMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                } ${isHovered ? 'z-10' : 'z-0'} ${isBeingDragged ? 'opacity-30' : ''}`}
                style={{
                  left: placed.position.x,
                  top: placed.position.y,
                  width: GRID_SIZE * 2,
                  height: GRID_SIZE * 2
                }}
                onMouseEnter={() => setHoveredComponent(placed.id)}
                onMouseLeave={() => setHoveredComponent(null)}
                onClick={() => {
                  if (connectMode) {
                    handleConnectClick(placed);
                  } else if (!isBeingDragged) {
                    handleComponentClick(placed);
                  }
                }}
              >
                <div className={`w-full h-full rounded-lg bg-kiro-bg-light border-2 
                              flex flex-col items-center justify-center transition-all
                              ${isConnectSource
                                ? 'border-kiro-success shadow-lg ring-2 ring-kiro-success/50 scale-110'
                                : isHovered 
                                  ? 'border-kiro-purple shadow-kiro-glow scale-105' 
                                  : 'border-kiro-purple/50'}`}
                >
                  <IconComponent size={24} className={isConnectSource ? 'text-kiro-success' : 'text-kiro-purple'} mb-1 />
                  <span className="text-xs text-white font-medium">{componentData.type}</span>
                  {placed.tier > 1 && (
                    <span className="text-xs text-kiro-purple/70">T{placed.tier}</span>
                  )}
                </div>
                
                {/* Tooltip on hover */}
                {isHovered && !isBeingDragged && !connectMode && (
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-kiro-bg-light 
                                border border-kiro-purple/30 rounded px-2 py-1 whitespace-nowrap z-20">
                    <p className="text-xs text-white">{componentData.name}</p>
                    <p className="text-xs text-gray-500">Tier {placed.tier} • Drag to move</p>
                  </div>
                )}
                {isHovered && connectMode && !isConnectSource && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-kiro-success/20 
                                border border-kiro-success/30 rounded px-2 py-1 whitespace-nowrap z-20">
                    <p className="text-xs text-kiro-success">Click to connect</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Ghost preview during drag (for new placement or moving) */}
          {(draggedComponent || draggedPlacedComponent) && ghostPosition && (() => {
            // For moving, exclude the component being moved from valid placement check
            const componentsToCheck = draggedPlacedComponent 
              ? placedComponents.filter(c => c.id !== draggedPlacedComponent.id)
              : placedComponents;
            const isValid = isValidPlacement(ghostPosition, componentsToCheck);
            
            // Get the icon for the ghost
            const componentForIcon = draggedComponent || 
              (draggedPlacedComponent && getComponentById(draggedPlacedComponent.type.toLowerCase()));
            const IconComponent = componentForIcon ? ICON_MAP[componentForIcon.icon] || Server : Server;
            
            return (
              <div
                className={`absolute pointer-events-none transition-opacity ${
                  isValid ? 'opacity-50' : 'opacity-25'
                }`}
                style={{
                  left: ghostPosition.x,
                  top: ghostPosition.y,
                  width: GRID_SIZE * 2,
                  height: GRID_SIZE * 2
                }}
              >
                <div className={`w-full h-full rounded-lg border-2 border-dashed 
                              flex items-center justify-center ${
                                isValid 
                                  ? 'border-kiro-success bg-kiro-success/10' 
                                  : 'border-red-500 bg-red-500/10'
                              }`}
                >
                  <IconComponent size={24} className={isValid ? 'text-kiro-success' : 'text-red-500'} />
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Component Info Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedComponent?.data?.name || 'Component Details'}
        size="md"
      >
        {selectedComponent && selectedComponent.data && (() => {
          const nextUpgrade = getNextUpgrade();
          const canAffordUpgrade = nextUpgrade && credits >= nextUpgrade.cost;
          const isMaxTier = !nextUpgrade;
          const IconComponent = ICON_MAP[selectedComponent.data.icon] || Server;
          
          return (
            <div className="space-y-4">
              {/* Component info */}
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-lg bg-kiro-purple/20 text-kiro-purple">
                  <IconComponent size={28} />
                </div>
                <div>
                  <p className="text-white font-medium">{selectedComponent.data.name}</p>
                  <p className="text-sm text-gray-400">Instance: {selectedComponent.id}</p>
                  <p className="text-sm text-kiro-purple">
                    Tier {selectedComponent.tier} - {selectedComponent.data.upgradeTree[selectedComponent.tier - 1]?.name}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-300">{selectedComponent.data.description}</p>

              {/* Upgrade section */}
              {!isMaxTier && (
                <div className="bg-kiro-bg rounded-lg p-3 border border-kiro-purple/20">
                  <h4 className="text-sm font-semibold text-kiro-purple mb-2 flex items-center gap-2">
                    <ArrowUp size={14} />
                    Next Upgrade: {nextUpgrade.name}
                  </h4>
                  <p className="text-xs text-gray-400 mb-2">{nextUpgrade.description}</p>
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-kiro-warning" />
                    <span className="text-sm font-bold text-white">{nextUpgrade.cost}</span>
                    <span className="text-xs text-gray-500">credits</span>
                    {!canAffordUpgrade && (
                      <span className="text-xs text-kiro-warning ml-2">
                        (need {nextUpgrade.cost - credits} more)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {isMaxTier && (
                <div className="bg-kiro-success/10 rounded-lg p-3 border border-kiro-success/30">
                  <p className="text-sm text-kiro-success flex items-center gap-2">
                    ✓ Maximum tier reached!
                  </p>
                </div>
              )}

              {/* Upgrade path preview */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 mb-2">Upgrade Path</h4>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {selectedComponent.data.upgradeTree.map((tier) => (
                    <div 
                      key={tier.tier}
                      className={`flex-shrink-0 px-2 py-1 rounded text-xs ${
                        tier.tier === selectedComponent.tier
                          ? 'bg-kiro-purple text-kiro-bg font-semibold'
                          : tier.tier < selectedComponent.tier
                          ? 'bg-kiro-success/20 text-kiro-success'
                          : 'bg-kiro-bg-light text-gray-500'
                      }`}
                    >
                      T{tier.tier}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-700">
                <button
                  onClick={handleRemove}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 
                           rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
                {!isMaxTier && (
                  <button
                    onClick={handleUpgrade}
                    disabled={!canAffordUpgrade}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      canAffordUpgrade
                        ? 'bg-kiro-purple text-white hover:bg-kiro-purple/80'
                        : 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUp size={16} />
                    Upgrade ({nextUpgrade?.cost} credits)
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
