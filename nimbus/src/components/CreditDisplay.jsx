/**
 * CreditDisplay Component - Shows current credits with animations
 * Requirements: 2.6
 * 
 * Features:
 * - Lightning bolt icon
 * - Animated counter (eased, not instant)
 * - Scale-up animation on change
 * - Green flash for gains, red flash for spending
 * - Low credits warning state (< 50 credits)
 */

import { useState, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';

/**
 * Animate credits change with easing
 * @param {number} startValue - Starting credit value
 * @param {number} endValue - Target credit value
 * @param {function} setDisplayedCredits - State setter
 * @param {function} onComplete - Callback when animation completes
 */
function animateCreditsChange(startValue, endValue, setDisplayedCredits, onComplete) {
  const duration = 1000; // 1 second
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic for smooth deceleration
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(startValue + (endValue - startValue) * eased);
    setDisplayedCredits(current);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };
  
  requestAnimationFrame(animate);
}

export default function CreditDisplay({ credits, previousCredits = null }) {
  const [displayedCredits, setDisplayedCredits] = useState(credits);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flashType, setFlashType] = useState(null); // 'gain' | 'spend' | null
  const prevCreditsRef = useRef(credits);
  
  // Determine if this is a gain or spend
  useEffect(() => {
    const prevValue = previousCredits !== null ? previousCredits : prevCreditsRef.current;
    
    if (credits !== prevValue) {
      // Determine flash type
      if (credits > prevValue) {
        setFlashType('gain');
      } else if (credits < prevValue) {
        setFlashType('spend');
      }
      
      // Start animation
      setIsAnimating(true);
      animateCreditsChange(
        prevValue,
        credits,
        setDisplayedCredits,
        () => {
          setIsAnimating(false);
          // Clear flash after animation
          setTimeout(() => setFlashType(null), 300);
        }
      );
    }
    
    prevCreditsRef.current = credits;
  }, [credits, previousCredits]);
  
  // Low credits warning (< 50)
  const isLowCredits = credits < 50;
  
  // Dynamic classes based on state
  const containerClasses = [
    'flex items-center gap-2 px-4 py-2 rounded-lg',
    'bg-kiro-bg-light border border-kiro-purple/30',
    'transition-all duration-300',
    isAnimating ? 'scale-110' : 'scale-100',
    flashType === 'gain' ? 'ring-2 ring-kiro-success ring-opacity-75' : '',
    flashType === 'spend' ? 'ring-2 ring-red-500 ring-opacity-75' : '',
    isLowCredits ? 'border-kiro-warning/50' : ''
  ].filter(Boolean).join(' ');
  
  const iconClasses = [
    'w-5 h-5',
    flashType === 'gain' ? 'text-kiro-success' : '',
    flashType === 'spend' ? 'text-red-500' : '',
    !flashType && isLowCredits ? 'text-kiro-warning animate-pulse' : '',
    !flashType && !isLowCredits ? 'text-kiro-purple' : ''
  ].filter(Boolean).join(' ');
  
  const textClasses = [
    'font-bold text-lg tabular-nums',
    flashType === 'gain' ? 'text-kiro-success' : '',
    flashType === 'spend' ? 'text-red-500' : '',
    !flashType && isLowCredits ? 'text-kiro-warning' : '',
    !flashType && !isLowCredits ? 'text-white' : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div className={containerClasses}>
      <Zap className={iconClasses} />
      <span className={textClasses}>
        {displayedCredits.toLocaleString()}
      </span>
      <span className="text-sm text-gray-400">credits</span>
      
      {isLowCredits && !flashType && (
        <span className="text-xs text-kiro-warning ml-1">Low!</span>
      )}
    </div>
  );
}
