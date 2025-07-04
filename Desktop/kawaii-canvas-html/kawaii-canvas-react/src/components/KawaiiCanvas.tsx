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
import { MouseEvent } from 'react';
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

    // Handle connection creation (for mind mapping)
    const onConnect = useCallback(
      (params: Connection) => setEdges((eds) => addEdge(params, eds)),
      [setEdges],
    );

    // Initialize React Flow instance
    const onInit = useCallback((instance: ReactFlowInstance) => {
      reactFlowInstance.current = instance;
    }, []);

    // Enhanced drag handlers for better cursor and interaction control
    const onNodeDragStart = useCallback((event: MouseEvent, node: Node) => {
      // Ensure node dragging takes precedence over canvas panning
      if (reactFlowInstance.current) {
        reactFlowInstance.current.setNodes((nds) =>
          nds.map((n) => ({ ...n, selected: n.id === node.id }))
        );
      }
    }, []);

    const onNodeDragStop = useCallback((event: MouseEvent, node: Node) => {
      // Node drag completed, ensure proper state
      console.log('Node drag stopped:', node.id);
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
      const centerPosition = reactFlowInstance.current.screenToFlowPosition({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });

      // Intelligent random placement with collision detection
      const findNonOverlappingPosition = () => {
        const stickyNoteWidth = 200; // Approximate width of sticky note
        const stickyNoteHeight = 150; // Approximate height of sticky note
        const padding = 20; // Minimum space between notes
        const maxAttempts = 50;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          // Generate random offset within a reasonable range
          const randomAngle = Math.random() * 2 * Math.PI;
          const randomDistance = 50 + Math.random() * 100; // 50-150px from center
          
          const offsetX = Math.cos(randomAngle) * randomDistance;
          const offsetY = Math.sin(randomAngle) * randomDistance;
          
          const candidatePosition = {
            x: centerPosition.x + offsetX,
            y: centerPosition.y + offsetY,
          };
          
          // Check if this position overlaps with existing notes
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
        
        // If no non-overlapping position found, use a fallback with larger offset
        const fallbackOffset = 200 + Math.random() * 100;
        return {
          x: centerPosition.x + (Math.random() - 0.5) * fallbackOffset,
          y: centerPosition.y + (Math.random() - 0.5) * fallbackOffset,
        };
      };

      const finalPosition = findNonOverlappingPosition();
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
    }, [setNodes, nodes]);

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
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
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
          // Selection Settings - Optimized for smooth dragging
          selectNodesOnDrag={false}
          selectionOnDrag={false}
          multiSelectionKeyCode="Shift"
          deleteKeyCode="Delete"
          // Performance Settings for Smooth Dragging
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
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