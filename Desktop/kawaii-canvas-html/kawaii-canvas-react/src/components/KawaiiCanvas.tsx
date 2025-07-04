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

// Kawaii Canvas Props
interface KawaiiCanvasProps {
  className?: string;
}

// Canvas controls interface for parent components
export interface KawaiiCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (level: number) => void;
  fitView: () => void;
  getZoom: () => number;
  addStickyNote: (clientX: number, clientY: number, color: string) => void;
}

// Initial empty state - ready for mind mapping
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Main Canvas Component
const KawaiiCanvasInternal = forwardRef<KawaiiCanvasHandle, KawaiiCanvasProps>(
  ({ className = '' }, ref) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const stickyNoteCounter = useRef(0); // Counter for sticky notes

    // Handle connection creation (for mind mapping)
    const onConnect = useCallback(
      (params: Connection) => setEdges((eds) => addEdge(params, eds)),
      [setEdges],
    );

    // Initialize React Flow instance
    const onInit = useCallback((instance: ReactFlowInstance) => {
      reactFlowInstance.current = instance;
    }, []);

    // Add sticky note at specified position
    const addStickyNote = useCallback((clientX: number, clientY: number, color: string) => {
      if (!reactFlowInstance.current || !reactFlowWrapper.current) return;

      // Clear any existing selection to prevent dragging multiple nodes
      if (reactFlowInstance.current) {
        reactFlowInstance.current.setNodes((nds) =>
          nds.map((node) => ({ ...node, selected: false }))
        );
      }

      // Convert screen coordinates to React Flow coordinates
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });

      // Add offset to prevent stacking - each new note gets a small offset
      const offsetX = (stickyNoteCounter.current % 3) * 30; // 0, 30, 60 pixels offset
      const offsetY = Math.floor(stickyNoteCounter.current / 3) * 30; // Every 3rd note moves down
      
      const finalPosition = {
        x: position.x + offsetX,
        y: position.y + offsetY,
      };

      const nodeId = `sticky-${Date.now()}`;

      // Create new sticky note node
      const newNode: Node = {
        id: nodeId,
        type: 'kawaiiStickyNote',
        position: finalPosition,
        selected: false, // Ensure new node is not selected initially
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
      stickyNoteCounter.current += 1; // Increment counter
    }, [setNodes]);

    // Expose zoom controls to parent (toolbar)
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

    // Custom node types
    const nodeTypes = {
      kawaiiStickyNote: KawaiiStickyNoteNode,
    };

    return (
      <div 
        ref={reactFlowWrapper}
        className={`w-full h-full ${className}`}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={onInit}
          nodeTypes={nodeTypes}
          // Infinite Canvas Settings
          fitView={false}
          snapToGrid={false}
          snapGrid={[15, 15]}
          // Zoom Settings
          minZoom={0.1}
          maxZoom={4}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          // Pan Settings  
          panOnScroll={true}
          panOnDrag={true}
          // Selection Settings - Ensure single node selection
          selectNodesOnDrag={false}
          selectionOnDrag={false}
          multiSelectionKeyCode="Shift"
          deleteKeyCode="Delete"
          // Styling
          style={{
            backgroundColor: '#ffffff',
          }}
          // Connection Settings for Mind Mapping
          connectionLineStyle={{
            stroke: '#6366F1',
            strokeWidth: 2,
          }}
          defaultEdgeOptions={{
            style: {
              stroke: '#6366F1',
              strokeWidth: 2,
            },
            type: 'smoothstep',
          }}
        >
          {/* Dotted Background - Debug Visible */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={2}
            color="rgba(0, 0, 0, 0.15)"
            style={{
              backgroundColor: '#ffffff',
            }}
          />

          {/* Hide default React Flow controls since we use toolbar */}
          <Controls 
            style={{ display: 'none' }} 
          />

          {/* Optional: Mini Map - hidden by default */}
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

// Main Export with Provider
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