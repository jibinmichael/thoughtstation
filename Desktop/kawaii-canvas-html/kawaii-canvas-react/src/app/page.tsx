'use client';

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import KawaiiCanvas, { KawaiiCanvasHandle } from "../components/KawaiiCanvas";
import TopColorPickerBar from "../components/TopColorPickerBar";
import PomodoroWidget from "../components/PomodoroWidget";
import AIWidget from "../components/AIWidget";

export default function Home() {
  // Reference to the canvas for zoom controls
  const canvasRef = useRef<KawaiiCanvasHandle>(null);

  // State for color picker bar
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  
  // State for Pomodoro widget
  const [pomodoroVisible, setPomodoroVisible] = useState(false);
  
  // State for AI widget
  const [aiWidgetVisible, setAiWidgetVisible] = useState(false);
  
  // State to track if canvas has content
  const [hasCanvasContent, setHasCanvasContent] = useState(false);
  
  // State to track if timer is running (for single timer logic)
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // State for warning tooltip
  const [showWarningTooltip, setShowWarningTooltip] = useState(false);

  // State for zoom level
  const [zoomLevel, setZoomLevel] = useState(0.7);

  // Zoom button handlers
  const handleZoomIn = () => {
    canvasRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    canvasRef.current?.zoomOut();
  };

  // Sticky note icon click handler
  const handleStickyNoteClick = () => {
    setColorPickerVisible(true);
    // Removed setPomodoroVisible(false) to keep timer open when opening color picker
  };

  // AI widget (Think with me) icon click handler
  const handleAIWidgetClick = () => {
    setAiWidgetVisible(!aiWidgetVisible);
    setColorPickerVisible(false); // Close color picker if open
  };

  // Pomodoro timer icon click handler
  const handlePomodoroClick = () => {
    // Check if a timer is already running
    if (isTimerRunning) {
      // Show warning tooltip and prevent new timer
      setShowWarningTooltip(true);
      setTimeout(() => setShowWarningTooltip(false), 3000);
      return;
    }
    
    setPomodoroVisible(!pomodoroVisible);
    setColorPickerVisible(false); // Close color picker if open
  };



  // Color selection handler - automatically create sticky note
  const handleColorSelect = (color: string) => {
    // Create sticky note at center of viewport
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    canvasRef.current?.addStickyNote(centerX, centerY, color);
    
    // Mark canvas as having content and hide AI widget if it was shown by default
    setHasCanvasContent(true);
    if (!aiWidgetVisible) {
      // Only hide if user hasn't manually opened it
      setAiWidgetVisible(false);
    }
    
    // Close color picker but keep timer open
    setColorPickerVisible(false);
  };

  // Handler for all toolbar columns except sticky note, pomodoro, and AI widget
  const handleToolbarColumnClick = () => {
    setColorPickerVisible(false);
    // Removed setPomodoroVisible(false) to decouple Pomodoro widget visibility
  };

  // Handle timer state changes from PomodoroWidget
  const handleTimerStateChange = (running: boolean) => {
    setIsTimerRunning(running);
  };

  // Handle pomodoro widget close
  const handlePomodoroClose = () => {
    setPomodoroVisible(false);
    setIsTimerRunning(false); // Reset timer running state when widget closes
  };

  // Handle zoom changes
  const handleZoomChange = (zoom: number) => {
    setZoomLevel(zoom);
  };

  // Effect to manage AI widget visibility based on canvas content
  useEffect(() => {
    // If canvas becomes empty again, show AI widget by default
    if (!hasCanvasContent && !aiWidgetVisible) {
      setAiWidgetVisible(true);
    }
  }, [hasCanvasContent, aiWidgetVisible]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* React Flow Canvas - The Foundation */}
      <div className="absolute inset-0">
        <KawaiiCanvas 
          ref={canvasRef}
          onZoomChange={handleZoomChange}
        />
      </div>

      {/* Top Color Picker Bar - Animated */}
      <TopColorPickerBar
        visible={colorPickerVisible}
        onSelect={handleColorSelect}
      />

      {/* Pomodoro Widget */}
      {pomodoroVisible && (
        <PomodoroWidget onClose={handlePomodoroClose} onTimerStateChange={handleTimerStateChange} />
      )}

      {/* AI Widget */}
      {aiWidgetVisible && (
        <AIWidget
          onClose={() => setAiWidgetVisible(false)}
          onCreateQuestionSession={(userInput, questions) => {
            canvasRef.current?.createQuestionSession(userInput, questions);
            setHasCanvasContent(true); // Mark canvas as having content
            setAiWidgetVisible(false); // Hide AI widget after generating session
          }}
          zoomLevel={zoomLevel}
        />
      )}

      {/* Bottom Toolbar - Overlaying the canvas */}
      <div className="toolbar-bottom">
        {/* Zoom Controls - Connected to React Flow */}
        <div className="zoom-section">
          <button className="zoom-btn" onClick={handleZoomOut}>−</button>
          <button className="zoom-btn" onClick={handleZoomIn}>+</button>
        </div>

        {/* Circle Section */}
        <div className="circle-section">
          <div className="circle"></div>
          <div className="tooltip">Themes</div>
        </div>

        {/* Toolbar Columns */}
        <div className="column marker" onClick={handleAIWidgetClick} style={{ cursor: 'pointer' }}>
          <Image 
            src="/icons/marker-icon.svg" 
            alt="Marker" 
            width={72} 
            height={72}
            className="marker-icon"
          />
          <div className="tooltip">Think with me!</div>
        </div>

        <div className="column sticky-note" onClick={handleStickyNoteClick} style={{ cursor: 'pointer' }}>
          <Image 
            src="/icons/sticky-note-icon.svg" 
            alt="Sticky Note" 
            width={72} 
            height={72}
            className="sticky-note-icon"
          />
          <div className="tooltip">Sticky Notes</div>
        </div>

        <div className="column washi-tape" onClick={handlePomodoroClick} style={{ cursor: 'pointer', position: 'relative' }}>
          <Image 
            src="/icons/washi-tape-icon.svg" 
            alt="Washi Tape" 
            width={72} 
            height={72}
            className="washi-tape-icon"
          />
          <div className="tooltip" style={{ display: showWarningTooltip ? 'none' : 'block' }}>Focus Timer</div>
          {showWarningTooltip && (
            <div 
              className="tooltip timer-warning-tooltip"
              style={{
                opacity: 1,
                transform: 'translateX(-50%) translateY(-2px)',
                pointerEvents: 'none',
                zIndex: 1000,
                width: '200px',
                whiteSpace: 'normal',
                textAlign: 'center',
                display: 'block'
              }}
            >
              You have an active timer running, stop it to start a new timer.
            </div>
          )}
        </div>

        <div className="column todo" onClick={handleToolbarColumnClick} style={{ cursor: 'pointer' }}>
          <Image 
            src="/icons/todo-icon.svg" 
            alt="Todo List" 
            width={72} 
            height={72}
            className="todo-icon"
          />
          <div className="tooltip">Play games</div>
        </div>

        <div className="column sticker" onClick={handleToolbarColumnClick} style={{ cursor: 'pointer' }}>
          <Image 
            src="/icons/sticker-icon.svg" 
            alt="Stickers" 
            width={72} 
            height={72}
            className="sticker-icon"
          />
          <div className="tooltip">Stickers</div>
        </div>
      </div>

      {/* Top Toolbar - Hidden by default */}
      <div className="toolbar-top">
        <div className="circle-panel-content">
          <div className="color-circles">
            <button className="color-circle" style={{backgroundColor: '#ffffff'}}></button>
            <button className="color-circle" style={{backgroundColor: '#E6E6FA'}}></button>
            <button className="color-circle" style={{backgroundColor: '#FFE4E1'}}></button>
            <button className="color-circle" style={{backgroundColor: '#FFEAA7'}}></button>
            <button className="color-circle" style={{backgroundColor: '#FDCB6E'}}></button>
            <button className="color-circle" style={{backgroundColor: '#A8E6CF'}}></button>
            <button className="color-circle" style={{backgroundColor: '#B8C5FF'}}></button>
            <button className="color-circle" style={{backgroundColor: '#F8BBD9'}}></button>
          </div>
        </div>
      </div>
    </div>
  );
}
