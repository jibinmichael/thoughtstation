import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

interface QuestionStickyNoteData {
  question: string;
  color: string;
  answer: string;
  onChange: (answer: string) => void;
  onDelete: () => void;
  onFollowUp?: (questionId: string, question: string, answer: string, position: 'top' | 'right' | 'bottom' | 'left') => void;
  questionId?: string;
}

interface QuestionStickyNoteProps {
  data: QuestionStickyNoteData;
  selected: boolean;
}

const QuestionStickyNote: React.FC<QuestionStickyNoteProps> = ({ data, selected }) => {
  const { question, color, answer, onChange, onFollowUp, questionId } = data;
  const [localAnswer, setLocalAnswer] = useState(answer);
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredPosition, setHoveredPosition] = useState<'top' | 'right' | 'bottom' | 'left' | null>(null);
  const [dimensions, setDimensions] = useState({ width: 200, height: 150 });
  const [isResizing, setIsResizing] = useState(false);
  const [showResizeHandle, setShowResizeHandle] = useState(false);
  const [isManuallyResized, setIsManuallyResized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localAnswer]);

  // Auto-resize and font scaling logic
  const adjustSize = useCallback(() => {
    if (!textareaRef.current || !containerRef.current) return;

    const textarea = textareaRef.current;
    const content = localAnswer || '';
    const lines = content.split('\n');
    const longestLine = lines.reduce((max, line) => line.length > max.length ? line : max, '');

    // Fixed values for consistent sizing (similar to manual sticky notes)
    const maxCharsPerLine = Math.floor((dimensions.width - 32) / 8); // Adjust based on current width
    const basePadding = 32; // 16px padding on each side

    // Font size adjustment based on longest line and container width
    let fontSize = 13;
    if (longestLine.length > maxCharsPerLine) {
      fontSize = Math.max(10, 13 * (maxCharsPerLine / longestLine.length));
    }
    textarea.style.fontSize = `${fontSize}px`;

    // Calculate line metrics
    const lineHeight = fontSize * 1.4; // From our line-height: 1.4

    // Count visual lines (physical lines + wrapped lines)
    let totalLines = 0;
    lines.forEach(line => {
      if (line.length === 0) {
        totalLines += 1; // Empty line counts as 1
      } else {
        // Calculate wrapped lines
        const wrappedLines = Math.ceil(line.length / maxCharsPerLine);
        totalLines += wrappedLines;
      }
    });

    // Minimum 1 line for compact notes, but allow growth
    totalLines = Math.max(1, totalLines);

    // Calculate heights
    const textHeight = Math.ceil(totalLines * lineHeight);
    const questionTextHeight = 40; // Approximate height for question text
    const calculatedHeight = Math.max(150, questionTextHeight + textHeight + basePadding + 24); // 24px for gap

    // Only auto-adjust height if not manually resized recently
    if (!isResizing && !isManuallyResized) {
      setDimensions(prev => ({
        ...prev,
        height: calculatedHeight
      }));
    }
    
    // Update textarea height smoothly
    const currentHeight = parseInt(textarea.style.height) || 32;
    const targetHeight = Math.max(32, textHeight);
    
    // Only update if there's a significant change (avoid micro-adjustments)
    if (Math.abs(currentHeight - targetHeight) > 2) {
      textarea.style.height = `${targetHeight}px`;
    }
    textarea.style.overflowY = 'hidden'; // Never show scrollbars
  }, [localAnswer, dimensions.width, isResizing]);

  // Adjust size when answer changes
  useEffect(() => {
    adjustSize();
  }, [localAnswer, adjustSize]);

  // Handle answer changes
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    setLocalAnswer(newAnswer);
    onChange(newAnswer);
    
    // Show textarea styling when user starts typing
    if (newAnswer.length > 0 && !isEditing) {
      setIsEditing(true);
    }
  };

  // Handle focus/blur
  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (localAnswer.trim().length === 0) {
      setIsEditing(false);
    }
  };

  // Handle clicking on textarea area to focus
  const handleTextareaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (textareaRef.current) {
      textareaRef.current.focus();
      setIsEditing(true); // Ensure editing state is set when clicked
    }
  };

  // Handle + icon click for follow-up generation
  const handleFollowUpClick = (position: 'top' | 'right' | 'bottom' | 'left') => {
    if (onFollowUp && questionId && localAnswer.trim()) {
      onFollowUp(questionId, question, localAnswer, position);
    }
  };

  // Only show + icons if user has written an answer
  const showPlusIcons = localAnswer.trim().length > 0;

  // Helper function to get shadow position based on hovered + icon
  const getShadowPosition = (position: 'top' | 'right' | 'bottom' | 'left') => {
    const gap = 40; // Gap between original and shadow
    switch (position) {
      case 'top':
        return { top: `-${150 + gap}px`, left: '0px' };
      case 'right':
        return { top: '0px', left: `${200 + gap}px` };
      case 'bottom':
        return { top: `${150 + gap}px`, left: '0px' };
      case 'left':
        return { top: '0px', left: `-${200 + gap}px` };
      default:
        return {};
    }
  };

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Prevent React Flow from starting drag
    const event = e.nativeEvent;
    event.stopImmediatePropagation();
    
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      height: dimensions.height
    };
  }, [dimensions]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeStartRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const deltaX = e.clientX - resizeStartRef.current.x;
    const deltaY = e.clientY - resizeStartRef.current.y;

    const newWidth = Math.max(150, resizeStartRef.current.width + deltaX);
    const newHeight = Math.max(100, resizeStartRef.current.height + deltaY);

    setDimensions({ width: newWidth, height: newHeight });
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setIsManuallyResized(true);
    resizeStartRef.current = null;
    
    // Allow auto-resize to work again after user stops interacting for a while
    setTimeout(() => {
      setIsManuallyResized(false);
    }, 5000); // 5 seconds delay before re-enabling auto-resize
  }, []);

  // Global resize event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  return (
    <div 
      ref={containerRef}
      className={`question-sticky-note ${selected ? 'selected' : ''}`}
      style={{ 
        backgroundColor: color,
        position: 'relative',
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        minHeight: '100px',
        maxHeight: 'none',
      }}
      onMouseDown={(e) => {
        // Allow text selection and input in textarea
        if ((e.target as HTMLElement).tagName === 'TEXTAREA' || 
            (e.target as HTMLElement).closest('.answer-container')) {
          e.stopPropagation();
          return;
        }
        
        // Don't start drag if clicking on resize handle
        if ((e.target as HTMLElement).closest('.resize-handle')) {
          e.stopPropagation();
          return;
        }
        
        // Don't start drag if clicking on + icons
        if ((e.target as HTMLElement).closest('.plus-icon')) {
          e.stopPropagation();
          return;
        }
        
        // Allow normal React Flow dragging for everything else
      }}
      onMouseEnter={() => setShowResizeHandle(true)}
      onMouseLeave={() => !isResizing && setShowResizeHandle(false)}
    >
      {/* Question Text (Non-editable) */}
      <div className="question-text">
        {question}
      </div>

      {/* Answer Textarea Container - Use nodrag class to prevent React Flow dragging */}
      <div 
        className="nodrag answer-container"
        onClick={handleTextareaClick}
        style={{ 
          cursor: 'text',
          padding: '4px 0',
          minHeight: '24px',
          zIndex: 20, // Ensure textarea area is above + icons
          position: 'relative',
        }}
      >
        <textarea
          ref={textareaRef}
          className={`answer-textarea nodrag ${isEditing || localAnswer ? 'visible' : 'invisible'}`}
          placeholder="What's your thoughts on this?"
          value={localAnswer}
          onChange={handleAnswerChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseDown={(e) => e.stopPropagation()} // Prevent React Flow drag
          onMouseUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          rows={1}
          style={{
            cursor: 'text',
            pointerEvents: 'auto', // Ensure textarea can receive events
            zIndex: 21,
            position: 'relative',
            color: '#2d3748', // Brighter, more readable color
            fontWeight: 400, // Regular font weight
            fontSize: '13px',
            lineHeight: '1.4',
            border: 'none', // Remove all borders
            background: 'transparent',
            resize: 'none',
            outline: 'none',
          }}
        />
      </div>

      {/* + Icons on all four sides (only show if user has written an answer) */}
      {showPlusIcons && (
        <>
          {/* Top + Icon */}
          <div
            className="plus-icon plus-icon-top"
            style={{
              position: 'absolute',
              top: '-25px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '16px',
              height: '16px',
              backgroundColor: '#6366F1',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#fff',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              zIndex: 10,
              transition: 'all 0.2s ease',
              opacity: 0.7,
            }}
            onMouseEnter={() => setHoveredPosition('top')}
            onMouseLeave={() => setHoveredPosition(null)}
            onClick={(e) => {
              e.stopPropagation();
              handleFollowUpClick('top');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {hoveredPosition === 'top' ? '+' : '•'}
          </div>

          {/* Right + Icon */}
          <div
            className="plus-icon plus-icon-right"
            style={{
              position: 'absolute',
              top: '50%',
              right: '-25px',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              backgroundColor: '#6366F1',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#fff',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              zIndex: 10,
              transition: 'all 0.2s ease',
              opacity: 0.7,
            }}
            onMouseEnter={() => setHoveredPosition('right')}
            onMouseLeave={() => setHoveredPosition(null)}
            onClick={(e) => {
              e.stopPropagation();
              handleFollowUpClick('right');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {hoveredPosition === 'right' ? '+' : '•'}
          </div>

          {/* Bottom + Icon */}
          <div
            className="plus-icon plus-icon-bottom"
            style={{
              position: 'absolute',
              bottom: '-25px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '16px',
              height: '16px',
              backgroundColor: '#6366F1',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#fff',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              zIndex: 10,
              transition: 'all 0.2s ease',
              opacity: 0.7,
            }}
            onMouseEnter={() => setHoveredPosition('bottom')}
            onMouseLeave={() => setHoveredPosition(null)}
            onClick={(e) => {
              e.stopPropagation();
              handleFollowUpClick('bottom');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {hoveredPosition === 'bottom' ? '+' : '•'}
          </div>

          {/* Left + Icon */}
          <div
            className="plus-icon plus-icon-left"
            style={{
              position: 'absolute',
              top: '50%',
              left: '-25px',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              backgroundColor: '#6366F1',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#fff',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              zIndex: 10,
              transition: 'all 0.2s ease',
              opacity: 0.7,
            }}
            onMouseEnter={() => setHoveredPosition('left')}
            onMouseLeave={() => setHoveredPosition(null)}
            onClick={(e) => {
              e.stopPropagation();
              handleFollowUpClick('left');
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {hoveredPosition === 'left' ? '+' : '•'}
          </div>
        </>
      )}

      {/* Shadow Preview on Hover */}
      {hoveredPosition && (
        <div
          className="shadow-preview"
          style={{
            position: 'absolute',
            width: '200px',
            height: '150px',
            backgroundColor: color,
            opacity: 0.1,
            borderRadius: '8px',
            border: '2px dashed #6366F1',
            pointerEvents: 'none',
            zIndex: 5,
            ...getShadowPosition(hoveredPosition),
          }}
        />
      )}

      {/* Resize Handle - Bottom Right Corner */}
      {(showResizeHandle || isResizing) && (
        <div
          className="resize-handle nodrag"
          style={{
            position: 'absolute',
            bottom: '0px',
            right: '0px',
            width: '16px',
            height: '16px',
            cursor: 'se-resize',
            background: 'linear-gradient(-45deg, transparent 40%, #6366F1 40%, #6366F1 60%, transparent 60%)',
            borderBottomRightRadius: '8px',
            opacity: isResizing ? 1 : 0.7,
            transition: 'opacity 0.2s ease',
            zIndex: 20,
          }}
          onMouseDown={handleResizeStart}
          onMouseEnter={(e) => e.stopPropagation()}
        />
      )}

      {/* React Flow Handles */}
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    </div>
  );
};

export default QuestionStickyNote; 