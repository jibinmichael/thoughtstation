# Kawaii Canvas React - Complete Documentation

## Current Issues
1. **Color picker ring indicator not showing**
2. **Cursor not consistent during drag operations**
3. **Internal server errors on port 3000**

## Project Structure
```
kawaii-canvas-react/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── KawaiiCanvas.tsx
│   │   ├── KawaiiStickyNoteNode.tsx
│   │   ├── PomodoroWidget.tsx
│   │   └── TopColorPickerBar.tsx
│   └── styles/
│       └── kawaii.css
├── public/
│   ├── fonts/
│   │   └── digital-7.ttf
│   └── icons/
└── package.json
```

## Current Code Files

### 1. src/app/page.tsx
```tsx
'use client';

import React, { useRef, useState } from "react";
import Image from "next/image";
import KawaiiCanvas, { KawaiiCanvasHandle } from "../components/KawaiiCanvas";
import TopColorPickerBar from "../components/TopColorPickerBar";
import PomodoroWidget from "../components/PomodoroWidget";

export default function Home() {
  const canvasRef = useRef<KawaiiCanvasHandle>(null);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [pomodoroVisible, setPomodoroVisible] = useState(false);

  const handleZoomIn = () => {
    canvasRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    canvasRef.current?.zoomOut();
  };

  const handleStickyNoteClick = () => {
    setColorPickerVisible(true);
    setPomodoroVisible(false);
  };

  const handlePomodoroClick = () => {
    setPomodoroVisible(!pomodoroVisible);
    setColorPickerVisible(false);
  };

  const handleColorSelect = (color: string) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    canvasRef.current?.addStickyNote(centerX, centerY, color);
    setColorPickerVisible(false);
  };

  const handleToolbarColumnClick = () => {
    setColorPickerVisible(false);
    setPomodoroVisible(false);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <div className="absolute inset-0">
        <KawaiiCanvas ref={canvasRef} />
      </div>

      <TopColorPickerBar
        visible={colorPickerVisible}
        onSelect={handleColorSelect}
      />

      {pomodoroVisible && (
        <PomodoroWidget onClose={() => setPomodoroVisible(false)} />
      )}

      <div className="toolbar-bottom">
        <div className="zoom-section">
          <button className="zoom-btn" onClick={handleZoomOut}>−</button>
          <button className="zoom-btn" onClick={handleZoomIn}>+</button>
        </div>

        <div className="circle-section">
          <div className="circle"></div>
          <div className="tooltip">Themes</div>
        </div>

        <div className="column marker" onClick={handleToolbarColumnClick} style={{ cursor: 'pointer' }}>
          <Image src="/icons/marker-icon.svg" alt="Marker" width={72} height={72} className="marker-icon" />
          <div className="tooltip">Think with me!</div>
        </div>

        <div className="column sticky-note" onClick={handleStickyNoteClick} style={{ cursor: 'pointer' }}>
          <Image src="/icons/sticky-note-icon.svg" alt="Sticky Note" width={72} height={72} className="sticky-note-icon" />
          <div className="tooltip">Sticky Notes</div>
        </div>

        <div className="column washi-tape" onClick={handlePomodoroClick} style={{ cursor: 'pointer' }}>
          <Image src="/icons/washi-tape-icon.svg" alt="Washi Tape" width={72} height={72} className="washi-tape-icon" />
          <div className="tooltip">Focus Timer</div>
        </div>

        <div className="column todo" onClick={handleToolbarColumnClick} style={{ cursor: 'pointer' }}>
          <Image src="/icons/todo-icon.svg" alt="Todo List" width={72} height={72} className="todo-icon" />
          <div className="tooltip">Play games</div>
        </div>

        <div className="column sticker" onClick={handleToolbarColumnClick} style={{ cursor: 'pointer' }}>
          <Image src="/icons/sticker-icon.svg" alt="Stickers" width={72} height={72} className="sticker-icon" />
          <div className="tooltip">Stickers</div>
        </div>

        <div className="column image" onClick={handleToolbarColumnClick} style={{ cursor: 'pointer' }}>
          <Image src="/icons/image-icon.svg" alt="Add Image" width={72} height={72} className="image-icon" />
          <div className="tooltip">Photo wall</div>
        </div>
      </div>

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
```

### 2. src/components/TopColorPickerBar.tsx
```tsx
import React, { useState, useEffect } from 'react';

const COLORS = [
  '#ffffff', '#E6E6FA', '#FFE4E1', '#FFEAA7', '#FDCB6E',
  '#A8E6CF', '#B8C5FF', '#F8BBD9', '#B8C5FF', '#F8BBD9',
  '#B8C5FF', '#F8BBD9',
];

interface TopColorPickerBarProps {
  visible: boolean;
  onSelect: (color: string) => void;
}

const TopColorPickerBar: React.FC<TopColorPickerBarProps> = ({ visible, onSelect }) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSelectedColor(null);
    }
  }, [visible]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onSelect(color);
  };

  return (
    <div
      className={`toolbar-top fixed left-1/2 z-[101]`}
      style={{
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s',
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'translateX(calc(8px - 54.35%)) translateY(0)'
          : 'translateX(calc(8px - 54.35%)) translateY(100%)',
      }}
    >
      <div className="circle-panel-content">
        <div className="color-circles">
          {COLORS.map((color, idx) => (
            <button
              key={color + idx}
              className={`color-circle ${selectedColor === color ? 'selected' : ''} ${color === '#ffffff' ? 'border border-gray-200' : ''}`}
              style={{ 
                backgroundColor: color, 
                borderColor: color === '#ffffff' ? '#E5E7EB' : 'transparent',
                transition: 'all 0.2s ease-in-out',
              }}
              onClick={() => handleColorSelect(color)}
              aria-label={`Pick color ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopColorPickerBar;
```

### 3. src/components/KawaiiCanvas.tsx
```tsx
'use client';

import React, { useCallback, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  ReactFlowInstance,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import KawaiiStickyNoteNode from './KawaiiStickyNoteNode';

interface KawaiiCanvasProps {
  className?: string;
}

export interface KawaiiCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (level: number) => void;
  fitView: () => void;
  getZoom: () => number;
  addStickyNote: (clientX: number, clientY: number, color: string) => void;
}

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const KawaiiCanvasInternal = forwardRef<KawaiiCanvasHandle, KawaiiCanvasProps>(
  ({ className = '' }, ref) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    const onConnect = useCallback(
      (params: Connection) => setEdges((eds) => addEdge(params, eds)),
      [setEdges],
    );

    const onInit = useCallback((instance: ReactFlowInstance) => {
      reactFlowInstance.current = instance;
    }, []);

    const addStickyNote = useCallback((clientX: number, clientY: number, color: string) => {
      if (!reactFlowInstance.current || !reactFlowWrapper.current) return;

      if (reactFlowInstance.current) {
        reactFlowInstance.current.setNodes((nds) =>
          nds.map((node) => ({ ...node, selected: false }))
        );
      }

      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const centerPosition = reactFlowInstance.current.screenToFlowPosition({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });

      const findNonOverlappingPosition = () => {
        const stickyNoteWidth = 200;
        const stickyNoteHeight = 150;
        const padding = 20;
        const maxAttempts = 50;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const randomAngle = Math.random() * 2 * Math.PI;
          const randomDistance = 50 + Math.random() * 100;
          
          const offsetX = Math.cos(randomAngle) * randomDistance;
          const offsetY = Math.sin(randomAngle) * randomDistance;
          
          const candidatePosition = {
            x: centerPosition.x + offsetX,
            y: centerPosition.y + offsetY,
          };
          
          const overlaps = nodes.some(node => {
            if (node.type !== 'kawaiiStickyNote') return false;
            
            const distanceX = Math.abs(node.position.x - candidatePosition.x);
            const distanceY = Math.abs(node.position.y - candidatePosition.y);
            
            return distanceX < (stickyNoteWidth + padding) && 
                   distanceY < (stickyNoteHeight + padding);
          });
          
          if (!overlaps) {
            return candidatePosition;
          }
        }
        
        const fallbackOffset = 200 + Math.random() * 100;
        return {
          x: centerPosition.x + (Math.random() - 0.5) * fallbackOffset,
          y: centerPosition.y + (Math.random() - 0.5) * fallbackOffset,
        };
      };

      const finalPosition = findNonOverlappingPosition();
      const nodeId = `sticky-${Date.now()}`;

      const newNode: Node = {
        id: nodeId,
        type: 'kawaiiStickyNote',
        position: finalPosition,
        selected: false,
        data: {
          color,
          text: '',
          onChange: (text: string) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, text } }
                  : node
              )
            );
          },
          onDelete: () => {
            setNodes((nds) => nds.filter((node) => node.id !== nodeId));
          },
          autoFocus: true,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    }, [setNodes, nodes]);

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (reactFlowInstance.current) {
          reactFlowInstance.current.zoomIn();
        }
      },
      zoomOut: () => {
        if (reactFlowInstance.current) {
          reactFlowInstance.current.zoomOut();
        }
      },
      zoomTo: (level: number) => {
        if (reactFlowInstance.current) {
          reactFlowInstance.current.zoomTo(level);
        }
      },
      fitView: () => {
        if (reactFlowInstance.current) {
          reactFlowInstance.current.fitView();
        }
      },
      getZoom: () => {
        return reactFlowInstance.current?.getZoom() || 1;
      },
      addStickyNote,
    }), [addStickyNote]);

    const nodeTypes = {
      kawaiiStickyNote: KawaiiStickyNoteNode,
    };

    return (
      <div ref={reactFlowWrapper} className={`w-full h-full ${className}`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={onInit}
          nodeTypes={nodeTypes}
          fitView={false}
          snapToGrid={false}
          snapGrid={[15, 15]}
          minZoom={0.1}
          maxZoom={4}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          panOnScroll={true}
          panOnDrag={true}
          selectNodesOnDrag={false}
          selectionOnDrag={false}
          multiSelectionKeyCode="Shift"
          deleteKeyCode="Delete"
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          style={{ backgroundColor: '#ffffff' }}
          connectionLineStyle={{ stroke: '#6366F1', strokeWidth: 2 }}
          defaultEdgeOptions={{
            style: { stroke: '#6366F1', strokeWidth: 2 },
            type: 'smoothstep',
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={2}
            color="rgba(0, 0, 0, 0.15)"
            style={{ backgroundColor: '#ffffff' }}
          />
          <Controls style={{ display: 'none' }} />
          <MiniMap 
            style={{ display: 'none' }}
            nodeColor={() => '#6366F1'}
            nodeStrokeColor="#ffffff"
            nodeStrokeWidth={2}
            maskColor="rgba(99, 102, 241, 0.1)"
          />
        </ReactFlow>
      </div>
    );
  }
);

KawaiiCanvasInternal.displayName = 'KawaiiCanvasInternal';

const KawaiiCanvas = forwardRef<KawaiiCanvasHandle, KawaiiCanvasProps>(
  (props, ref) => {
    return (
      <ReactFlowProvider>
        <KawaiiCanvasInternal {...props} ref={ref} />
      </ReactFlowProvider>
    );
  }
);

KawaiiCanvas.displayName = 'KawaiiCanvas';

export default KawaiiCanvas;
```

### 4. src/app/globals.css
```css
@import "tailwindcss";

/* Digital-7 Font for Timer Display */
@font-face {
  font-family: 'Digital-7';
  src: url('/fonts/digital-7.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-dm-sans);
  --font-mono: var(--font-jetbrains-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-dm-sans), sans-serif;
}

@tailwind base;
@tailwind components;
@tailwind utilities;

#__next-dev-overlay-container {
  display: none !important;
}

.react-flow__renderer {
  z-index: 1;
}

.react-flow__background {
  z-index: 0;
}

.react-flow__background-pattern {
  opacity: 1 !important;
}

.react-flow__background svg circle {
  fill: rgba(0, 0, 0, 0.2) !important;
  opacity: 1 !important;
}

/* Consistent cursor for draggable elements */
.react-flow__node {
  cursor: grab !important;
}

.react-flow__node:active {
  cursor: grabbing !important;
}

/* ============================================
   POMODORO TIMER WIDGET STYLES
   ============================================ */

.pomodoro-widget {
  position: absolute;
  width: 264px;
  background: white;
  border: 1px solid #ececec;
  border-radius: 12px !important;
  box-shadow: 0px 2px 4px -2px rgba(27, 29, 28, 0.10), 0px 4px 6px -1px rgba(27, 29, 28, 0.10);
  font-family: 'DM Sans', sans-serif;
  z-index: 10;
  cursor: default;
  top: 20px;
  right: 20px;
}

.pomodoro-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #ececec;
}

.pomodoro-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  font-family: 'DM Sans', sans-serif;
}

.pomodoro-close-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 24px;
  font-weight: 300;
  transition: color 0.2s ease;
  border-radius: 50%;
  line-height: 1;
  padding: 0;
}

.pomodoro-close-btn:hover {
  color: #333;
}

.pomodoro-body {
  padding: 0 0 20px 0;
  background: white;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.pomodoro-body-content {
  padding: 0 12px;
}

.pomodoro-timer-container {
  padding: 36px 0 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  min-height: 80px;
}

.pomodoro-timer-display {
  font-family: 'Digital-7', monospace;
  font-size: 68px;
  font-weight: normal;
  line-height: 120%;
  color: #333;
  margin: 0;
  letter-spacing: 6px;
  position: relative;
  z-index: 2;
}

.pomodoro-timer-background {
  position: absolute;
  top: 0;
  left: 0;
  font-family: 'Digital-7', monospace;
  font-size: 68px;
  font-weight: normal;
  line-height: 120%;
  color: #e0e0e0;
  margin: 0;
  letter-spacing: 6px;
  z-index: 1;
  user-select: none;
}

.pomodoro-timer-controls-row {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0 0 0;
  width: 100%;
  box-sizing: border-box;
}

.pomodoro-add-5min-btn {
  padding: 3px 12px;
  border: 1px solid #ececec;
  border-radius: 4px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: #666;
  background: transparent;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  box-shadow: none;
}

.pomodoro-add-5min-btn:hover {
  background: #f5f5f6;
  box-shadow: none;
}

.pomodoro-add-5min-btn:active {
  box-shadow: none;
  transform: none;
}

.pomodoro-play-btn {
  width: 28px;
  height: 28px;
  background: #8D4BF6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  margin-left: auto;
}

.pomodoro-play-btn:hover {
  background: #7a3be0;
}

.pomodoro-play-btn svg {
  display: block;
}

.pomodoro-stop-btn {
  width: 28px;
  height: 28px;
  background: #B0B0B8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  transition: background 0.2s;
}

.pomodoro-stop-btn:hover {
  background: #8B8B94;
}

.pomodoro-stop-btn svg {
  display: block;
}

.pomodoro-vinyl-row {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
}

.vinyl-player {
  width: 112px;
  height: 112px;
  position: relative;
}

.album {
  position: relative;
  width: 112px;
  height: 112px;
  overflow: hidden;
  background-color: #111;
  border: 1px solid #111;
  border-radius: 50%;
  box-shadow:
    0 0.0625em 0.1875em rgba(0,0,0,0.5),
    0 0 0.125em 0.3125em #ddd,
    0 0.0625em 0 0.375em #bbb,
    0 0 0.375em 0.325em rgba(0,0,0,0.3),
    0 0 0.5em 0.375em rgba(0,0,0,0.3),
    0 0.25em 1em 0.5em rgba(0,0,0,0.15),
    inset 0 0 0 0.0625em rgba(0,0,0,0.5),
    inset 0 0 0 0.1875em rgba(255,255,255,1),
    inset 0 0 0 0.375em rgba(0,0,0,0.5),
    inset 0 0 0 0.4375em rgba(255,255,255,0.2),
    inset 0 0 0 0.5em rgba(0,0,0,0.5),
    inset 0 0 0 0.5625em rgba(255,255,255,0.3),
    inset 0 0 0 0.625em rgba(0,0,0,0.5),
    inset 0 0 0 0.6875em rgba(255,255,255,0.2),
    inset 0 0 0 0.75em rgba(0,0,0,0.5),
    inset 0 0 0 0.8125em rgba(255,255,255,0.3),
    inset 0 0 0 0.875em rgba(0,0,0,0.5),
    inset 0 0 0 0.9375em rgba(255,255,255,0.3),
    inset 0 0 0 1em rgba(0,0,0,0.5),
    inset 0 0 0 1.0625em rgba(255,255,255,0.2),
    inset 0 0 0 1.125em rgba(0,0,0,0.5),
    inset 0 0 0 1.1875em rgba(255,255,255,0.3),
    inset 0 0 0 1.25em rgba(0,0,0,0.5),
    inset 0 0 0 1.3125em rgba(255,255,255,0.2),
    inset 0 0 0 1.375em rgba(255,255,255,0.2),
    inset 0 0 0 1.4375em rgba(0,0,0,0.5),
    inset 0 0 0 1.5em rgba(255,255,255,0.3),
    inset 0 0 0 1.5625em rgba(0,0,0,0.5),
    inset 0 0 0 1.625em rgba(255,255,255,0.3),
    inset 0 0 0 1.6875em rgba(0,0,0,0.5),
    inset 0 0 0 1.75em rgba(255,255,255,0.2),
    inset 0 0 0 1.8125em rgba(0,0,0,0.5),
    inset 0 0 0 1.875em rgba(255,255,255,0.2),
    inset 0 0 0 1.9375em rgba(0,0,0,0.5),
    inset 0 0 0 2em rgba(255,255,255,0.3);
}

.album::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%,-50%);
  background-image:
    linear-gradient(
      -45deg,
      rgba(255,255,255,0) 30%,
      rgba(255,255,255,0.125),
      rgba(255,255,255,0) 70%
    ),
    linear-gradient(
      -48deg,
      rgba(255,255,255,0) 45%,
      rgba(255,255,255,0.075),
      rgba(255,255,255,0) 55%
    ),
    linear-gradient(
      -42deg,
      rgba(255,255,255,0) 45%,
      rgba(255,255,255,0.075),
      rgba(255,255,255,0) 55%
    ),
    radial-gradient(
      circle at top left,
      rgba(0,0,0,1) 20%,
      rgba(0,0,0,0) 80%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(0,0,0,1) 20%,
      rgba(0,0,0,0) 80%
    );
}

.album {
  animation: spin 4s linear infinite paused;
}

.playing .album {
  animation-play-state: running;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vinyl-tonearm {
  position: absolute;
  width: 56px;
  height: 4px;
  background: #d0d0d0;
  right: -14px;
  top: 28px;
  transform-origin: right center;
  transform: rotate(-20deg);
  border-radius: 2px;
  transition: transform 0.5s ease;
}

.vinyl-tonearm::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: #999;
  border-radius: 50%;
  left: -6px;
  top: -4px;
}

.playing .album ~ .vinyl-tonearm {
  transform: rotate(-10deg);
}

.pomodoro-music-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0 24px 0;
  gap: 8px;
}

.soundscape-circles {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.soundscape-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: #f5f5f6;
  position: relative;
}

.soundscape-circle .tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
  margin-bottom: 8px;
  font-family: 'DM Sans', sans-serif;
}

.soundscape-circle:hover .tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-2px);
}

.soundscape-circle .tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #333;
}

.soundscape-circle:hover {
  transform: scale(1.1);
  background: #ececec;
}

.soundscape-circle.selected {
  border-color: #8D4BF6;
  background: #f3ebff;
}

.soundscape-circle.selected::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 2px solid #8D4BF6;
  border-radius: 50%;
  opacity: 0.3;
}

.music-play-btn {
  width: 36px;
  height: 36px;
  background: #8D4BF6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.music-play-btn:hover {
  background: #7a3be0;
}

.music-play-btn svg {
  display: block;
  margin-left: 2px;
}

.focus-timer-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 12px 0 12px;
  gap: 8px;
  width: 100%;
  border-top: 1px solid #ececec;
}

.focus-start-btn,
.focus-pause-btn,
.focus-stop-btn {
  padding: 8px 20px;
  background: #8D4BF6;
  color: white;
  border: none;
  border-radius: 4px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  box-shadow: none;
}

.focus-start-btn {
  width: 100%;
}

.focus-pause-btn,
.focus-stop-btn {
  flex: 1;
}

.focus-start-btn:hover,
.focus-pause-btn:hover {
  background: #7a3be0;
  box-shadow: none;
  transform: none;
}

.focus-stop-btn {
  background: transparent;
  color: #666;
  border: 1px solid #ececec;
}

.focus-stop-btn:hover {
  background: #f5f5f5;
  border-color: #ededed;
  box-shadow: none;
  transform: none;
}

.focus-start-btn:active,
.focus-pause-btn:active,
.focus-stop-btn:active {
  box-shadow: none;
  transform: none;
}
```

### 5. src/styles/kawaii.css (Partial - Color Circle Styles)
```css
.color-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-circle.selected {
  border-color: #6366F1;
  border-width: 2px;
}

.color-circle:hover {
  transform: scale(1.05);
}

.color-circle[style*="background-color: rgb(255, 255, 255)"],
.color-circle[style*="background-color: #ffffff"] {
  border: 2px solid #E5E7EB;
}

.color-circle[style*="background-color: rgb(255, 255, 255)"].selected,
.color-circle[style*="background-color: #ffffff"].selected {
  border: 2px solid #6366F1;
}
```

## Issues Analysis

### 1. Color Ring Issue
**Problem**: The `.selected` class is not applying the purple border properly.
**Potential Causes**:
- CSS specificity issues
- Inline styles overriding CSS classes
- React state not updating correctly

**Solutions to Try**:
1. Increase CSS specificity: `.color-circle.selected { border: 2px solid #6366F1 !important; }`
2. Use inline styles instead of CSS classes
3. Check if the selectedColor state is updating correctly

### 2. Cursor Consistency Issue
**Problem**: Cursor not showing grab/grabbing consistently.
**Potential Causes**:
- React Flow overriding cursor styles
- CSS specificity issues
- Node interaction settings

**Solutions to Try**:
1. Add `!important` to cursor rules
2. Target specific React Flow node classes
3. Check React Flow node interaction settings

### 3. Internal Server Error
**Problem**: Server errors on port 3000.
**Potential Causes**:
- Port conflicts
- Build errors
- Memory issues

**Solutions to Try**:
1. Kill all processes and restart
2. Clear Next.js cache: `rm -rf .next`
3. Use different port: `npm run dev -- --port 3001`

## Testing Steps
1. Check browser console for errors
2. Verify CSS is loading correctly
3. Test color picker selection state
4. Test cursor behavior on sticky notes
5. Check React Flow node interaction settings

## Dependencies
```json
{
  "@xyflow/react": "^12.0.0",
  "next": "^15.3.5",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.7.2"
}