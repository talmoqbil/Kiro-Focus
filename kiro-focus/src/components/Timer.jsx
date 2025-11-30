import { useEffect, useRef, useCallback, useState } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  PRESET_DURATIONS,
  tickTimer,
  correctDrift,
  calculateProgress,
  isFinalMinute,
  isSessionComplete,
  formatTime,
  getElapsedTime
} from '../utils/timerLogic';
import { calculateTotalCredits, calculatePartialCredits } from '../utils/creditCalculator';
import { useFocusCoach } from '../hooks/useAgents';
import { useCloudState } from '../App';

// Min and max duration in seconds
const MIN_DURATION = 5 * 60; // 5 minutes
const MAX_DURATION = 120 * 60; // 120 minutes

/**
 * Timer Component
 * 
 * Implements the focus timer with:
 * - Interactive circular slider for custom duration
 * - Duration preset buttons (15, 25, 45, 60, 90 min)
 * - Countdown display in MM:SS format
 * - Circular progress ring SVG
 * - Start/pause/resume/stop controls
 * - Final minute styling (orange, pulse)
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 12.4**
 */
export default function Timer() {
  const { state, actions } = useApp();
  const { timerState, userProgress } = state;
  const { isActive, isPaused, timeRemaining, totalDuration } = timerState;
  
  const intervalRef = useRef(null);
  const localStateRef = useRef(timerState);
  const svgRef = useRef(null);
  
  // State for custom duration selection via circular slider
  const [selectedDuration, setSelectedDuration] = useState(25 * 60); // Default 25 min
  const [isDragging, setIsDragging] = useState(false);
  
  // Focus Coach agent for session events
  const { onSessionStart, onSessionComplete: notifyCoachComplete, onSessionAbandon } = useFocusCoach();
  
  // Cloud state for auto-save
  const { saveCloudState } = useCloudState();
  
  // Keep local ref in sync with state
  useEffect(() => {
    localStateRef.current = timerState;
  }, [timerState]);

  
  // Handle session completion
  const handleSessionComplete = useCallback(() => {
    const session = {
      id: crypto.randomUUID(),
      startTime: timerState.startTime,
      endTime: Date.now(),
      duration: totalDuration,
      completed: true,
      pauseCount: timerState.pauseCount,
      creditsEarned: 0,
      bonuses: { completion: 0, streak: 0, longSession: 0 }
    };
    
    // Calculate credits
    const creditResult = calculateTotalCredits(
      { duration: totalDuration, completed: true, pauseCount: timerState.pauseCount },
      userProgress.currentStreak
    );
    
    session.creditsEarned = creditResult.total;
    session.bonuses = {
      completion: creditResult.completion,
      streak: creditResult.streak,
      longSession: creditResult.longSession
    };
    
    // Update state
    actions.addSession(session);
    actions.addCredits(creditResult.total);
    actions.resetTimer();
    
    // Notify Focus Coach agent (will set emotion to celebrating)
    notifyCoachComplete(session);
    
    // Auto-save to cloud after session completion (Requirements 13.6)
    // Use setTimeout to ensure state is updated before saving
    setTimeout(() => {
      saveCloudState();
    }, 100);
  }, [timerState, totalDuration, userProgress.currentStreak, actions, notifyCoachComplete, saveCloudState]);
  
  // Handle session abandonment
  const handleAbandon = useCallback(() => {
    const elapsedTime = getElapsedTime(localStateRef.current);
    const partialCredits = calculatePartialCredits(elapsedTime);
    
    const session = {
      id: crypto.randomUUID(),
      startTime: localStateRef.current.startTime,
      endTime: Date.now(),
      duration: elapsedTime,
      completed: false,
      pauseCount: localStateRef.current.pauseCount,
      creditsEarned: partialCredits,
      bonuses: { completion: 0, streak: 0, longSession: 0 }
    };
    
    actions.addSession(session);
    if (partialCredits > 0) {
      actions.addCredits(partialCredits);
    }
    actions.resetTimer();
    
    // Notify Focus Coach agent (will set emotion to concerned)
    onSessionAbandon(session);
    
    // Auto-save to cloud after session abandonment (Requirements 13.6)
    // Use setTimeout to ensure state is updated before saving
    setTimeout(() => {
      saveCloudState();
    }, 100);
  }, [actions, onSessionAbandon, saveCloudState]);
  
  // Timer tick effect
  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    intervalRef.current = setInterval(() => {
      const currentState = localStateRef.current;
      
      // Check for completion first
      if (isSessionComplete(currentState)) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        handleSessionComplete();
        return;
      }
      
      // Apply tick with drift correction
      let newState = tickTimer(currentState);
      newState = correctDrift(newState);
      
      // Update time remaining in context
      actions.tickTimer(newState.timeRemaining);
      
      // Check if just completed
      if (newState.timeRemaining <= 0) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        handleSessionComplete();
      }
    }, 1000);
    
    // Cleanup on unmount (Requirements 12.4)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, actions, handleSessionComplete]);
  
  // Start timer with selected duration
  const handleStart = (duration) => {
    actions.startTimer(duration);
    // Notify Focus Coach agent (will set emotion to encouraging)
    onSessionStart(duration);
  };
  
  // Pause timer
  const handlePause = () => {
    actions.pauseTimer();
  };
  
  // Resume timer
  const handleResume = () => {
    actions.resumeTimer();
  };
  
  // Stop/abandon timer
  const handleStop = () => {
    if (isActive) {
      handleAbandon();
    }
  };
  
  // Calculate progress for ring
  const progress = calculateProgress(timerState);
  const finalMinute = isFinalMinute(timerState);
  
  // SVG progress ring calculations
  const size = 280;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // For active timer: show remaining time as progress
  // For inactive: show selected duration as full ring
  const displayProgress = isActive 
    ? progress 
    : (selectedDuration / MAX_DURATION) * 100;
  const strokeDashoffset = isActive
    ? circumference - (progress / 100) * circumference
    : circumference - (displayProgress / 100) * circumference;
  
  // Calculate angle from duration for the handle position
  // The progress ring shows duration as percentage of MAX_DURATION
  // Handle should be at the end of the filled arc
  const durationToAngle = (duration) => {
    const percentage = duration / MAX_DURATION;
    return percentage * 360;
  };
  
  // Calculate duration from angle
  const angleToDuration = (angle) => {
    // Normalize angle to 0-360
    let normalizedAngle = angle % 360;
    if (normalizedAngle < 0) normalizedAngle += 360;
    
    const percentage = normalizedAngle / 360;
    const duration = percentage * MAX_DURATION;
    
    // Round to nearest minute, with minimum of MIN_DURATION
    const rounded = Math.round(duration / 60) * 60;
    return Math.max(MIN_DURATION, Math.min(MAX_DURATION, rounded));
  };
  
  // Get handle position on the circle
  // SVG is rotated -90deg, so we need to calculate position in the rotated coordinate system
  const getHandlePosition = () => {
    const angle = durationToAngle(selectedDuration);
    // The SVG is rotated -90deg (counter-clockwise), so 0 degrees is at the top
    // In the rotated SVG coordinate system, we calculate from the right (3 o'clock)
    // which appears at the top after rotation
    const radians = (angle * Math.PI) / 180;
    const x = size / 2 + radius * Math.cos(radians);
    const y = size / 2 + radius * Math.sin(radians);
    return { x, y };
  };
  
  // Handle mouse/touch interaction for circular slider
  const handlePointerDown = (e) => {
    if (isActive) return; // Don't allow dragging when timer is active
    setIsDragging(true);
    updateDurationFromPointer(e);
  };
  
  const handlePointerMove = useCallback((e) => {
    if (!isDragging || isActive) return;
    updateDurationFromPointer(e);
  }, [isDragging, isActive]);
  
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const updateDurationFromPointer = (e) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Get pointer position
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Calculate angle from center
    // The visual SVG is rotated -90deg, so top of circle = 0 degrees visually
    // But in screen coordinates, we need to account for this
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // atan2 gives angle from positive X axis (right = 0)
    // SVG is rotated -90deg, so visually: top=0, right=90, bottom=180, left=270
    // We need to add 90 to convert screen angle to SVG angle
    angle = angle + 90;
    if (angle < 0) angle += 360;
    
    const newDuration = angleToDuration(angle);
    setSelectedDuration(newDuration);
  };
  
  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);
  
  const handlePosition = getHandlePosition();
  
  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-4">
      {/* Duration presets (only show when not active) */}
      {!isActive && (
        <div className="mb-4">
          <h2 className="text-lg text-kiro-purple mb-3 text-center">
            {isDragging ? 'Drag to set time' : 'Select or drag to set duration'}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESET_DURATIONS.map(({ label, minutes, seconds }) => (
              <button
                key={seconds}
                onClick={() => setSelectedDuration(seconds)}
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  selectedDuration === seconds
                    ? 'bg-kiro-purple text-kiro-bg border border-kiro-purple'
                    : 'bg-kiro-bg border border-kiro-purple/30 text-kiro-purple hover:border-kiro-purple hover:bg-kiro-purple/10'
                }`}
              >
                <div className="text-base font-bold">{minutes} min</div>
                <div className="text-xs opacity-70">{label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Timer display with interactive circular slider */}
      <div className="relative">
        {/* Progress ring SVG */}
        <svg 
          ref={svgRef}
          width={size} 
          height={size} 
          className={`transform -rotate-90 ${!isActive ? 'cursor-pointer' : ''}`}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(183, 148, 246, 0.2)"
            strokeWidth={strokeWidth}
          />
          {/* Progress/Selection circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={finalMinute ? '#ed8936' : '#b794f6'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${isActive ? 'transition-all duration-1000' : ''} ${finalMinute ? 'animate-pulse-slow' : ''}`}
          />
          {/* Draggable handle (only when not active) */}
          {!isActive && (
            <circle
              cx={handlePosition.x}
              cy={handlePosition.y}
              r={isDragging ? 14 : 10}
              fill="#b794f6"
              stroke="#0a0e27"
              strokeWidth={3}
              className="cursor-grab active:cursor-grabbing"
              style={{ filter: 'drop-shadow(0 0 8px rgba(183, 148, 246, 0.6))' }}
            />
          )}
        </svg>
        
        {/* Time display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span 
            className={`text-5xl font-mono font-bold ${
              finalMinute ? 'text-kiro-warning animate-pulse-slow' : 'text-white'
            }`}
          >
            {isActive ? formatTime(timeRemaining) : formatTime(selectedDuration)}
          </span>
          {isActive && (
            <span className="text-sm text-kiro-purple/70 mt-2">
              {isPaused ? 'Paused' : 'Focus time'}
            </span>
          )}
          {!isActive && (
            <span className="text-sm text-kiro-purple/70 mt-2">
              Drag ring or select preset
            </span>
          )}
        </div>
      </div>

      
      {/* Controls */}
      <div className="flex gap-4 mt-6">
        {!isActive ? (
          // Start button when not active
          <button
            onClick={() => handleStart(selectedDuration)}
            className="flex items-center gap-2 px-8 py-3 bg-kiro-success text-white rounded-lg
                     hover:bg-kiro-success/80 transition-all duration-200 font-medium"
          >
            <Play size={20} />
            Start Focus Session
          </button>
        ) : isPaused ? (
          // Paused state: Resume and Stop buttons
          <>
            <button
              onClick={handleResume}
              className="flex items-center gap-2 px-6 py-3 bg-kiro-success text-white rounded-lg
                       hover:bg-kiro-success/80 transition-all duration-200"
            >
              <Play size={20} />
              Resume
            </button>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-6 py-3 bg-kiro-bg border border-kiro-warning/50
                       text-kiro-warning rounded-lg hover:border-kiro-warning transition-all duration-200"
            >
              <Square size={20} />
              Stop
            </button>
          </>
        ) : (
          // Active state: Pause and Stop buttons
          <>
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 bg-kiro-purple text-kiro-bg rounded-lg
                       hover:bg-kiro-purple/80 transition-all duration-200"
            >
              <Pause size={20} />
              Pause
            </button>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-6 py-3 bg-kiro-bg border border-kiro-warning/50
                       text-kiro-warning rounded-lg hover:border-kiro-warning transition-all duration-200"
            >
              <Square size={20} />
              Stop
            </button>
          </>
        )}
      </div>
      
      {/* Session info */}
      {isActive && (
        <div className="mt-6 text-center">
          <p className="text-kiro-purple/70 text-sm">
            Pauses: {timerState.pauseCount}
            {timerState.pauseCount === 0 && (
              <span className="text-kiro-success ml-2">+20% bonus!</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
