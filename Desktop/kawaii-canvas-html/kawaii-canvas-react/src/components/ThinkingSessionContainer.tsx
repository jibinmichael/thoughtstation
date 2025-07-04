import React from 'react';
import { Handle, Position } from '@xyflow/react';
import AIWidget from './AIWidget';
import QuestionStickyNote from './QuestionStickyNote';

interface ThinkingSessionContainerProps {
  data: {
    userInput: string;
    questions: Array<{
      id: string;
      question: string;
      color: string;
      answer: string;
      position: { x: number; y: number };
    }>;
    onQuestionChange: (questionId: string, answer: string) => void;
    onQuestionDelete: (questionId: string) => void;
    onCreateQuestionSession: (userInput: string, questions: string[]) => void;
    onClose: () => void;
  };
}

const ThinkingSessionContainer: React.FC<ThinkingSessionContainerProps> = ({ data }) => {
  const { 
    questions, 
    onQuestionChange, 
    onQuestionDelete, 
    onCreateQuestionSession,
    onClose 
  } = data;

  // AI widget dimensions and positioning
  const aiWidgetWidth = 190;
  const aiWidgetHeight = 240;
  const padding = 20;
  const stickyNoteWidth = 200;
  const stickyNoteHeight = 150;
  
  // Calculate container bounds
  let containerWidth = aiWidgetWidth + padding * 2; // Minimum width for AI widget
  let containerHeight = aiWidgetHeight + padding * 2; // Minimum height for AI widget
  
  if (questions.length > 0) {
    // Find bounds of all sticky notes
    const minX = Math.min(...questions.map(q => q.position.x));
    const maxX = Math.max(...questions.map(q => q.position.x + stickyNoteWidth));
    const minY = Math.min(...questions.map(q => q.position.y));
    const maxY = Math.max(...questions.map(q => q.position.y + stickyNoteHeight));
    
    // Calculate total width and height needed
    const notesWidth = maxX - minX;
    const notesHeight = maxY - minY;
    
    // Container should fit both AI widget and all notes with padding
    containerWidth = Math.max(
      aiWidgetWidth + padding * 2, // AI widget space
      notesWidth + padding * 2 // Notes space
    );
    containerHeight = Math.max(
      aiWidgetHeight + padding * 2, // AI widget space
      notesHeight + padding * 2 // Notes space
    );
  }

  return (
    <div 
      className="thinking-session-container"
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        position: 'relative',
        minWidth: `${aiWidgetWidth + padding * 2}px`,
        minHeight: `${aiWidgetHeight + padding * 2}px`
      }}
    >
      {/* AI Widget positioned at top-left of container */}
      <div 
        style={{
          position: 'absolute',
          left: `${padding}px`,
          top: `${padding}px`,
          zIndex: 10
        }}
      >
        <AIWidget
          onClose={onClose}
          onCreateQuestionSession={onCreateQuestionSession}
          zoomLevel={1} // Container handles zoom, so AI widget uses 1x
          isInContainer={true}
        />
      </div>

      {/* Question Sticky Notes positioned relative to container */}
      {questions.map((question) => (
        <div
          key={question.id}
          className="question-note-wrapper"
          style={{
            position: 'absolute',
            left: `${question.position.x - (questions.length > 0 ? Math.min(...questions.map(q => q.position.x)) : 0) + padding}px`,
            top: `${question.position.y - (questions.length > 0 ? Math.min(...questions.map(q => q.position.y)) : 0) + padding}px`,
            zIndex: 5,
            cursor: 'grab'
          }}
          onMouseDown={(e) => {
            // Allow individual sticky note dragging within container
            e.stopPropagation();
          }}
        >
          <QuestionStickyNote
            data={{
              question: question.question,
              color: question.color,
              answer: question.answer,
              onChange: (answer: string) => onQuestionChange(question.id, answer),
              onDelete: () => onQuestionDelete(question.id)
            }}
            selected={false}
          />
        </div>
      ))}

      {/* React Flow Handles for container dragging */}
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
    </div>
  );
};

export default ThinkingSessionContainer; 