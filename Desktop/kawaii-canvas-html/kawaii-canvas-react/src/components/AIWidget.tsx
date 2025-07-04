import React, { useState, useRef, useEffect, useCallback } from 'react';

interface AIWidgetProps {
  onClose: () => void;
  onCreateQuestionSession: (userInput: string, questions: string[]) => void;
  zoomLevel: number;
  isInContainer?: boolean;
}

const AIWidget: React.FC<AIWidgetProps> = ({ onClose, onCreateQuestionSession, zoomLevel, isInContainer = false }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth / 2 - 95 : 400, // Center horizontally (190px width / 2)
    y: typeof window !== 'undefined' ? window.innerHeight / 2 - 120 : 300  // Center vertically (240px height / 2)
  });
  const [hasGeneratedSession, setHasGeneratedSession] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Move to top-left when session is generated
  useEffect(() => {
    if (hasGeneratedSession) {
      setPosition({
        x: 20, // Top-left positioning
        y: 20
      });
    }
  }, [hasGeneratedSession]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  // Generate strategic questions based on user input
  const generateQuestions = (input: string) => {
    const questions = [
      `What is the real problem you're trying to solve with "${input}"?`,
      "What assumptions are you making about this situation?",
      "How would you explain this challenge to a 5-year-old?",
      "What would happen if you ignored this completely?",
      "What factors led to this situation?",
      "Which of these causes can you actually control?",
      "What patterns do you notice in similar past situations?",
      "What would need to change for this problem to disappear?",
      "What would the ideal outcome look like?",
      "What's the smallest step you could take today?",
      "Who else has solved a similar problem successfully?",
      "What resources do you have that you haven't considered?"
    ];

    return questions;
  };

  const handleThinkWithMe = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const questions = generateQuestions(userInput);
      onCreateQuestionSession(userInput, questions);
      setHasGeneratedSession(true);
      setIsLoading(false);
      // Don't close the widget - keep it visible for re-generation
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleThinkWithMe();
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('ai-title')) {
      setIsDragging(true);
      const rect = widgetRef.current!.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  }, [isDragging, dragOffset.x, dragOffset.y]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={widgetRef}
      className="ai-widget"
      style={{
        left: isInContainer ? '0px' : `${position.x}px`,
        top: isInContainer ? '0px' : `${position.y}px`,
        position: isInContainer ? 'relative' : 'fixed',
        cursor: isDragging ? 'grabbing' : 'default',
        transition: hasGeneratedSession && !isDragging ? 'all 0.5s ease' : 'none',
        transform: isInContainer ? 'scale(1)' : `scale(${zoomLevel})`,
        transformOrigin: 'top left'
      }}
    >
      {/* Header */}
      <div 
        className="ai-header"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="ai-title">Think with me</div>
        <button className="ai-close-btn" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="4" y1="4" x2="12" y2="12" stroke="#666" strokeWidth="1" strokeLinecap="round"/>
            <line x1="12" y1="4" x2="4" y2="12" stroke="#666" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="ai-body">
        <div className="ai-input-container">
          <textarea
            ref={textareaRef}
            className="ai-textarea"
            placeholder="What would you like to think about today?"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={4}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="ai-footer">
        <button
          className="ai-think-btn"
          onClick={handleThinkWithMe}
          disabled={!userInput.trim() || isLoading}
        >
          {isLoading ? 'Thinking...' : hasGeneratedSession ? 'Think again' : 'Help me think better'}
        </button>
      </div>
    </div>
  );
};

export default AIWidget; 