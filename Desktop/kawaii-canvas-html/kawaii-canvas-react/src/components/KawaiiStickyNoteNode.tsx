import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Handle, NodeProps, Position } from '@xyflow/react';

export interface KawaiiStickyNoteData {
  color: string;
  text: string;
  onChange: (text: string) => void;
  onDelete: () => void;
  autoFocus?: boolean;
}

const KawaiiStickyNoteNode: React.FC<NodeProps> = ({ data, selected }) => {
  // Cast data to our custom type (safe for React Flow v12)
  const noteData = data as unknown as KawaiiStickyNoteData;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for dragging
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Auto-focus on mount if requested
  useEffect(() => {
    if (noteData.autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      setIsEditing(true);
    }
  }, [noteData.autoFocus]);

  // Auto-resize and font scaling logic
  const adjustSize = useCallback(() => {
    if (!textareaRef.current || !containerRef.current) return;

    const textarea = textareaRef.current;
    const container = containerRef.current;
    const content = textarea.value || '';
    const lines = content.split('\n');
    const longestLine = lines.reduce((max, line) => line.length > max.length ? line : max, '');

    // Fixed values for consistent sizing
    const maxCharsPerLine = 18; // 148px width / 8px per char (180px - 32px padding)
    const maxHeight = 300;

    // Font size adjustment based on longest line
    let fontSize = 14;
    if (longestLine.length > maxCharsPerLine) {
      fontSize = Math.max(10, 14 * (maxCharsPerLine / longestLine.length));
    }
    textarea.style.fontSize = `${fontSize}px`;

    // Calculate line metrics
    const lineHeight = fontSize * 1.6; // From CSS line-height: 1.6

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

    // Minimum 1 line for compact notes
    totalLines = Math.max(1, totalLines);

    // Calculate heights
    const textHeight = Math.ceil(totalLines * lineHeight);
    const containerHeight = textHeight + 32; // 16px padding top + bottom

    // Apply constraints
    if (containerHeight <= maxHeight) {
      container.style.height = `${containerHeight}px`;
      textarea.style.height = `${textHeight}px`;
      textarea.style.overflowY = 'hidden';
    } else {
      container.style.height = `${maxHeight}px`;
      textarea.style.height = `${maxHeight - 32}px`;
      textarea.style.overflowY = 'auto';
    }
  }, []);

  // Adjust size when text changes
  useEffect(() => {
    adjustSize();
  }, [noteData.text, adjustSize]);

  // Handle text input
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    noteData.onChange(e.target.value);
  };

  // Handle keyboard events for deletion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Delete note when Backspace is pressed and textarea is empty
    if (e.key === 'Backspace' && noteData.text.trim() === '') {
      noteData.onDelete();
      e.preventDefault();
    }
    // Or delete with Ctrl/Cmd + D
    else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      noteData.onDelete();
      e.preventDefault();
    }
  };

  // Handle focus/blur
  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  // Dragging functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking on textarea
    if (e.target === textareaRef.current) {
      return;
    }

    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    e.preventDefault();
  };

  // Global mouse move handler for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;

      // Keep within viewport bounds
      const maxX = window.innerWidth - container.offsetWidth;
      const maxY = window.innerHeight - container.offsetHeight;

      container.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
      container.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Double-click to delete (not on textarea)
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.target !== textareaRef.current) {
      noteData.onDelete();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`sticky-note-element${selected ? ' focused' : ''}`}
      style={{
        backgroundColor: noteData.color,
        minWidth: 180,
        maxWidth: 180,
        minHeight: 54,
        maxHeight: 300,
        padding: 16,
        borderRadius: 8,
        boxShadow: selected
          ? '0 4px 16px rgba(99, 102, 241, 0.2)'
          : '0 2px 4px rgba(0, 0, 0, 0.1)',
        border: selected ? '2px solid #6366F1' : 'none',
        zIndex: selected ? 1000 : 10,
        overflow: 'hidden',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : isEditing ? 'text' : 'move',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isDragging ? 'scale(1.02)' : 'translateY(0)',
        fontFamily: 'DM Sans, sans-serif',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => {
        if (!selected && !isEditing) {
          containerRef.current!.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          containerRef.current!.style.transform = 'translateY(-2px) rotate(0.5deg)';
        }
      }}
      onMouseLeave={() => {
        if (!selected && !isEditing) {
          containerRef.current!.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          containerRef.current!.style.transform = 'translateY(0)';
        }
      }}
    >
      <textarea
        ref={textareaRef}
        className="sticky-note-textarea"
        value={noteData.text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Type your note here..."
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 14,
          lineHeight: 1.6,
          color: '#333',
          overflowY: 'hidden',
          overflowX: 'hidden',
          wordWrap: 'break-word',
          transition: 'font-size 0.2s ease',
          userSelect: 'text',
          cursor: 'text',
          padding: 0,
          margin: 0,
        }}
        rows={1}
        autoFocus={noteData.autoFocus}
      />
      
      {/* Handles for future mind map connections */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};

export default KawaiiStickyNoteNode; 