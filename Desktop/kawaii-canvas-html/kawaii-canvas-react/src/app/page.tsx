'use client';

import React, { useRef, useState } from "react";
import Image from "next/image";
import KawaiiCanvas, { KawaiiCanvasHandle } from "../components/KawaiiCanvas";
import TopColorPickerBar from "../components/TopColorPickerBar";
import PomodoroWidget from "../components/PomodoroWidget";

export default function Home() {
  // Reference to the canvas for zoom controls
  const canvasRef = useRef<KawaiiCanvasHandle>(null);

  // State for color picker bar
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  
  // State for Pomodoro widget
  const [pomodoroVisible, setPomodoroVisible] = useState(false);

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
    setPomodoroVisible(false); // Close timer if open
  };

  // Pomodoro timer icon click handler
  const handlePomodoroClick = () => {
    setPomodoroVisible(!pomodoroVisible);
    setColorPickerVisible(false); // Close color picker if open
  };

  // Color selection handler - automatically create sticky note
  const handleColorSelect = (color: string) => {
    // Create sticky note at center of viewport
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    canvasRef.current?.addStickyNote(centerX, centerY, color);
    
    // Close color picker
    setColorPickerVisible(false);
  };

  // Handler for all toolbar columns except sticky note and pomodoro
  const handleToolbarColumnClick = () => {
    setColorPickerVisible(false);
    setPomodoroVisible(false);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* React Flow Canvas - The Foundation */}
      <div className="absolute inset-0">
        <KawaiiCanvas 
          ref={canvasRef}
        />
      </div>

      {/* Top Color Picker Bar - Animated */}
      <TopColorPickerBar
        visible={colorPickerVisible}
        onSelect={handleColorSelect}
      />

      {/* Pomodoro Widget */}
      {pomodoroVisible && (
        <PomodoroWidget onClose={() => setPomodoroVisible(false)} />
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
        <div className="column marker" onClick={handleToolbarColumnClick} style={{ cursor: 'pointer' }}>
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

        <div className="column washi-tape" onClick={handlePomodoroClick} style={{ cursor: 'pointer' }}>
          <Image 
            src="/icons/washi-tape-icon.svg" 
            alt="Washi Tape" 
            width={72} 
            height={72}
            className="washi-tape-icon"
          />
          <div className="tooltip">Focus Timer</div>
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

        <div className="column image" onClick={handleToolbarColumnClick} style={{ cursor: 'pointer' }}>
          <Image 
            src="/icons/image-icon.svg" 
            alt="Add Image" 
            width={72} 
            height={72}
            className="image-icon"
          />
          <div className="tooltip">Photo wall</div>
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
