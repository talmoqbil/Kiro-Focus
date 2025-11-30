import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Modal Component
 * 
 * Generic reusable modal wrapper with overlay and close functionality.
 * Features:
 * - Overlay backdrop with click-to-close
 * - Close button (X)
 * - Escape key to close
 * - Centralized z-index management
 * - Content slot for flexible usage
 * 
 * **Validates: Requirements 4.6, 5.5**
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md' // 'sm' | 'md' | 'lg'
}) {
  // Handle escape key press
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Add/remove escape key listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscapeKey]);

  // Don't render if not open
  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal content */}
      <div 
        className={`relative ${sizeClasses[size]} w-full mx-4 bg-kiro-bg-light border border-kiro-purple/30 
                   rounded-xl shadow-2xl shadow-kiro-purple/20 animate-modal-enter`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-kiro-purple/20">
          <h2 id="modal-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-kiro-purple/70 hover:text-kiro-purple hover:bg-kiro-purple/10 
                     rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
