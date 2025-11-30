import { useState, useEffect, useRef, useCallback } from 'react';
import { EMOTIONS, createMessageQueue, getEmotionForEvent, EVENTS } from '../utils/kiroLogic';

/**
 * KiroMascot Component
 * Animated ghost mascot that displays AI agent messages
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */

// Typewriter speed: 30ms per character (Requirement 3.6)
const TYPEWRITER_SPEED = 30;

export default function KiroMascot({ emotion = EMOTIONS.IDLE, message = null, onMessageComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const messageQueueRef = useRef(createMessageQueue());
  const typewriterRef = useRef(null);
  const dismissTimerRef = useRef(null);

  // Handle incoming messages - add to queue
  useEffect(() => {
    if (message && message.text) {
      messageQueueRef.current.enqueue(message);
    }
  }, [message]);

  // Process message queue
  const processNextMessage = useCallback(() => {
    if (messageQueueRef.current.isEmpty()) {
      setCurrentMessage(null);
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    const nextMessage = messageQueueRef.current.dequeue();
    setCurrentMessage(nextMessage);
    setDisplayedText('');
    setIsTyping(true);
  }, []);

  // Start processing if no current message and queue has items
  useEffect(() => {
    if (!currentMessage && !messageQueueRef.current.isEmpty()) {
      processNextMessage();
    }
  }, [currentMessage, message, processNextMessage]);


  // Typewriter effect (Requirement 3.6: 30ms per character)
  useEffect(() => {
    if (!currentMessage || !isTyping) return;

    const text = currentMessage.text;
    let charIndex = 0;

    // Clear any existing typewriter interval
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }

    typewriterRef.current = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typewriterRef.current);
        typewriterRef.current = null;
        setIsTyping(false);

        // Set auto-dismiss timer after typing completes
        const duration = currentMessage.duration || 5000;
        dismissTimerRef.current = setTimeout(() => {
          setCurrentMessage(null);
          setDisplayedText('');
          onMessageComplete?.();
          processNextMessage();
        }, duration);
      }
    }, TYPEWRITER_SPEED);

    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
      }
    };
  }, [currentMessage, isTyping, onMessageComplete, processNextMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  // Get CSS class for current emotion
  const getEmotionClass = () => {
    switch (emotion) {
      case EMOTIONS.ENCOURAGING:
        return 'kiro-encouraging';
      case EMOTIONS.CELEBRATING:
        return 'kiro-celebrating';
      case EMOTIONS.CONCERNED:
        return 'kiro-concerned';
      case EMOTIONS.TEACHING:
        return 'kiro-teaching';
      case EMOTIONS.IDLE:
      default:
        return 'kiro-idle';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Speech Bubble */}
      {(currentMessage || displayedText) && (
        <div className="mb-2 max-w-xs bg-kiro-bg-light border border-kiro-purple/30 rounded-lg p-3 shadow-lg relative">
          <p className="text-white text-sm leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-kiro-bg-light" />
        </div>
      )}

      {/* Kiro Ghost Mascot */}
      <div className={`kiro-ghost ${getEmotionClass()} relative`}>
        {/* 
          To use the actual Kiro mascot image:
          1. Add your Kiro image to public/kiro-mascot.png
          2. The image will be displayed automatically
          3. If no image exists, a CSS ghost fallback is shown
        */}
        <div className="relative w-32 h-36" style={{ transform: 'scaleX(-1)' }}>
          {/* Try to load Kiro image, fallback to CSS ghost */}
          <img 
            src="/kiro-mascot.png" 
            alt="Kiro"
            className="w-full h-full object-contain drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 0 20px rgba(183, 148, 246, 0.7))' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* CSS Ghost Fallback - larger size */}
          <div className="hidden absolute inset-0 items-center justify-center" style={{ transform: 'scaleX(-1)' }}>
            <div className="relative w-24 h-32">
              <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-100 to-gray-200 rounded-t-full opacity-90 shadow-kiro">
                <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-4">
                  <div className="w-3.5 h-3.5 bg-black rounded-full" />
                  <div className="w-3.5 h-3.5 bg-black rounded-full" />
                </div>
                <div className="absolute top-16 left-5 w-4 h-2 bg-pink-300/40 rounded-full" />
                <div className="absolute top-16 right-5 w-4 h-2 bg-pink-300/40 rounded-full" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-black rounded-full" />
              </div>
              <div className="absolute -bottom-2 left-0 right-0 flex justify-around">
                <div className="w-6 h-5 bg-gradient-to-b from-gray-200 to-transparent rounded-b-full opacity-90" />
                <div className="w-6 h-6 bg-gradient-to-b from-gray-200 to-transparent rounded-b-full opacity-90" />
                <div className="w-6 h-5 bg-gradient-to-b from-gray-200 to-transparent rounded-b-full opacity-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Sparkle particles for encouraging/celebrating states */}
        {(emotion === EMOTIONS.ENCOURAGING || emotion === EMOTIONS.CELEBRATING) && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="sparkle sparkle-1" />
            <div className="sparkle sparkle-2" />
            <div className="sparkle sparkle-3" />
          </div>
        )}

        {/* Confetti for celebrating state */}
        {emotion === EMOTIONS.CELEBRATING && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <div className="confetti confetti-1" />
            <div className="confetti confetti-2" />
            <div className="confetti confetti-3" />
            <div className="confetti confetti-4" />
          </div>
        )}
      </div>
    </div>
  );
}

// Export utilities for external use
export { EMOTIONS, EVENTS, getEmotionForEvent, createMessageQueue };
