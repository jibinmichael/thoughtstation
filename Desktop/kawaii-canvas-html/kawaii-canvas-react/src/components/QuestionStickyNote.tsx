import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

interface QuestionStickyNoteData {
  question: string;
  color: string;
  answer: string;
  onChange: (answer: string) => void;
  onDelete: () => void;
}

interface QuestionStickyNoteProps {
  data: QuestionStickyNoteData;
  selected: boolean;
}

const QuestionStickyNote: React.FC<QuestionStickyNoteProps> = ({ data, selected }) => {
  const { question, color, answer, onChange } = data;
  const [localAnswer, setLocalAnswer] = useState(answer);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localAnswer]);

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
    }
  };

  return (
    <div 
      className={`question-sticky-note ${selected ? 'selected' : ''}`}
      style={{ backgroundColor: color }}
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
          minHeight: '24px'
        }}
      >
        <textarea
          ref={textareaRef}
          className={`answer-textarea ${isEditing || localAnswer ? 'visible' : 'invisible'}`}
          placeholder="Your thoughts..."
          value={localAnswer}
          onChange={handleAnswerChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={1}
          style={{
            cursor: 'text'
          }}
        />
      </div>

      {/* React Flow Handles */}
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    </div>
  );
};

export default QuestionStickyNote; 