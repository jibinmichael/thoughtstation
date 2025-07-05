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
import QuestionStickyNote from './QuestionStickyNote';
import SessionTitle from './SessionTitle';

// Kawaii Canvas Props
interface KawaiiCanvasProps {
  className?: string;
  onZoomChange?: (zoom: number) => void;
}

// Canvas controls interface for parent components
export interface KawaiiCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (level: number) => void;
  fitView: () => void;
  getZoom: () => number;
  addStickyNote: (clientX: number, clientY: number, color: string) => void;
  createQuestionSession: (userInput: string, questions: string[]) => void;
  addFollowUpQuestion: (originalQuestionId: string, question: string, answer: string, position: 'top' | 'right' | 'bottom' | 'left') => void;
}

// Initial empty state - ready for mind mapping
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Main Canvas Component
const KawaiiCanvasInternal = forwardRef<KawaiiCanvasHandle, KawaiiCanvasProps>(
  ({ className = '', onZoomChange }, ref) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    
    // Ref for follow-up function to avoid circular dependency
    const addFollowUpRef = useRef<((originalQuestionId: string, question: string, answer: string, position: 'top' | 'right' | 'bottom' | 'left') => void) | null>(null);

    // Handle connection creation (for mind mapping)
    const onConnect = useCallback(
      (params: Connection) => setEdges((eds) => addEdge(params, eds)),
      [setEdges],
    );

    // Initialize React Flow instance
    const onInit = useCallback((instance: ReactFlowInstance) => {
      reactFlowInstance.current = instance;
      // Zoom out initially for better overview
      setTimeout(() => {
        instance.zoomTo(0.7);
        onZoomChange?.(0.7);
      }, 100);
    }, [onZoomChange]);

    // Handle zoom changes
    const onMove = useCallback(() => {
      if (reactFlowInstance.current && onZoomChange) {
        const zoom = reactFlowInstance.current.getZoom();
        onZoomChange(zoom);
      }
    }, [onZoomChange]);

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

    // Create question session with sticky notes arranged in loose rows/columns
    const createQuestionSession = useCallback((userInput: string, questions: string[]) => {
      if (!reactFlowInstance.current) return;

      // Colors for randomization
      const colors = ['#FFE4E1', '#E6E6FA', '#FFEAA7', '#A8E6CF', '#B8C5FF', '#F8BBD9'];
      
      // Remove any existing AI-generated nodes but keep manually added ones
      setNodes((prevNodes) => prevNodes.filter(node => 
        node.type !== 'sessionTitle' && node.type !== 'questionStickyNote'
      ));
      setEdges([]);

      // Helper function to check if position overlaps with existing nodes
      const isPositionOccupied = (candidatePos: { x: number; y: number }, width: number, height: number) => {
        const padding = 30; // Minimum space between nodes
        return nodes.some(node => {
          // Skip AI-generated nodes since they'll be removed
          if (node.type === 'sessionTitle' || node.type === 'questionStickyNote') return false;
          
          const distanceX = Math.abs(node.position.x - candidatePos.x);
          const distanceY = Math.abs(node.position.y - candidatePos.y);
          
          // Use approximate dimensions for existing nodes
          const existingWidth = node.type === 'kawaiiStickyNote' ? 180 : 200;
          const existingHeight = node.type === 'kawaiiStickyNote' ? 150 : 150;
          
          return distanceX < (width + existingWidth) / 2 + padding && 
                 distanceY < (height + existingHeight) / 2 + padding;
        });
      };

      // Find non-overlapping position for title
      const findTitlePosition = () => {
        const titleWidth = 200;
        const titleHeight = 40;
        let attempts = 0;
        const maxAttempts = 50;
        
        // Try preferred position first
        let candidatePos = { x: 50, y: 20 };
        if (!isPositionOccupied(candidatePos, titleWidth, titleHeight)) {
          return candidatePos;
        }
        
        // If preferred position is occupied, try other positions
        while (attempts < maxAttempts) {
          candidatePos = {
            x: 50 + (attempts * 100) % 600, // Spread horizontally
            y: 20 + Math.floor(attempts / 6) * 80, // Move down after 6 attempts
          };
          
          if (!isPositionOccupied(candidatePos, titleWidth, titleHeight)) {
            return candidatePos;
          }
          attempts++;
        }
        
        // Fallback to far right if all positions occupied
        return { x: 800, y: 20 };
      };

      // Create session title node with collision detection
      const titleNode = {
        id: 'session-title',
        type: 'sessionTitle',
        position: findTitlePosition(),
        data: {
          title: userInput,
        },
        draggable: true,
        selectable: true,
      };

      // Arrange question notes in loose rows/columns with collision detection
      const notesPerRow = 3;
      const baseX = 300; // Start after title space
      const baseY = 120; // Start below title
      const xSpacing = 220; // Base spacing between columns
      const ySpacing = 180; // Base spacing between rows
      const randomOffset = 30; // Random offset for natural arrangement

      // Create question nodes with proper collision detection against each other
      const questionNodes: Node[] = [];
      const allPositions: { x: number; y: number; width: number; height: number }[] = [
        // Include title position
        { x: titleNode.position.x, y: titleNode.position.y, width: 200, height: 40 }
      ];

      questions.forEach((question, index) => {
        const row = Math.floor(index / notesPerRow);
        const col = index % notesPerRow;
        
        // Calculate initial position
        const initialX = baseX + (col * xSpacing);
        const initialY = baseY + (row * ySpacing);
        
        // Enhanced collision detection that includes already-placed question nodes
        const isPositionOccupiedEnhanced = (candidatePos: { x: number; y: number }, width: number, height: number) => {
          const padding = 30; // Minimum space between nodes
          
          // Check against existing nodes (manual sticky notes)
          const overlapsExisting = nodes.some(node => {
            if (node.type === 'sessionTitle' || node.type === 'questionStickyNote') return false;
            
            const distanceX = Math.abs(node.position.x - candidatePos.x);
            const distanceY = Math.abs(node.position.y - candidatePos.y);
            
            const existingWidth = node.type === 'kawaiiStickyNote' ? 180 : 200;
            const existingHeight = node.type === 'kawaiiStickyNote' ? 150 : 150;
            
            return distanceX < (width + existingWidth) / 2 + padding && 
                   distanceY < (height + existingHeight) / 2 + padding;
          });
          
          // Check against already-placed question nodes and title in this batch
          const overlapsNewNodes = allPositions.some(pos => {
            const distanceX = Math.abs(pos.x - candidatePos.x);
            const distanceY = Math.abs(pos.y - candidatePos.y);
            
            return distanceX < (width + pos.width) / 2 + padding && 
                   distanceY < (height + pos.height) / 2 + padding;
          });
          
          return overlapsExisting || overlapsNewNodes;
        };
        
        // Find non-overlapping position
        const findQuestionPosition = () => {
          const questionWidth = 200;
          const questionHeight = 150;
          let attempts = 0;
          const maxAttempts = 50;
          
          while (attempts < maxAttempts) {
            const randomX = (Math.random() - 0.5) * randomOffset;
            const randomY = (Math.random() - 0.5) * randomOffset;
            
            const candidatePos = {
              x: initialX + randomX + (attempts * 50), // Spread out on conflicts
              y: initialY + randomY + (Math.floor(attempts / 10) * 100), // Move down periodically
            };
            
            if (!isPositionOccupiedEnhanced(candidatePos, questionWidth, questionHeight)) {
              return candidatePos;
            }
            attempts++;
          }
          
          // Fallback to far right if all positions occupied
          return {
            x: initialX + 400 + (index * 50),
            y: initialY + (index * 30),
          };
        };
        
        const position = findQuestionPosition();
        
        // Add this position to our tracking array
        allPositions.push({ x: position.x, y: position.y, width: 200, height: 150 });
        
        const questionNodeId = `question-${index}`;
        const questionNode: Node = {
          id: questionNodeId,
          type: 'questionStickyNote',
          position,
          data: {
            question: question,
            color: colors[Math.floor(Math.random() * colors.length)],
            answer: '',
            questionId: questionNodeId,
            onChange: (answer: string) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === questionNodeId
                    ? { ...node, data: { ...node.data, answer } }
                    : node
                )
              );
            },
            onDelete: () => {
              setNodes((nds) => nds.filter((node) => node.id !== questionNodeId));
              // Also remove any edges connected to this node
              setEdges((eds) => eds.filter((edge) => 
                edge.source !== questionNodeId && edge.target !== questionNodeId
              ));
            },
            onFollowUp: (originalQuestionId: string, question: string, answer: string, position: 'top' | 'right' | 'bottom' | 'left') => {
              if (addFollowUpRef.current) {
                addFollowUpRef.current(originalQuestionId, question, answer, position);
              }
            },
          },
          draggable: true,
          selectable: true,
        };
        
        questionNodes.push(questionNode);
      });

      // Add new nodes (title + questions) to existing nodes
      setNodes((prevNodes) => [...prevNodes, titleNode, ...questionNodes]);
    }, [setNodes, setEdges, nodes]);

    // Add follow-up question based on user's answer
    const addFollowUpQuestion = useCallback(async (originalQuestionId: string, question: string, answer: string, position: 'top' | 'right' | 'bottom' | 'left') => {
      try {
        // Find the original question node
        const originalNode = nodes.find(node => node.id === originalQuestionId);
        if (!originalNode) return;

        // Generate follow-up question using AI service
        // For now, use a simple follow-up - we'll enhance this with AI later
        const followUpQuestion = `What specifically about "${answer}" makes you feel that way?`;
        
        // Calculate position relative to original node
        const gap = 40;
        let followUpPosition = { x: 0, y: 0 };
        
        switch (position) {
          case 'top':
            followUpPosition = {
              x: originalNode.position.x,
              y: originalNode.position.y - 150 - gap
            };
            break;
          case 'right':
            followUpPosition = {
              x: originalNode.position.x + 200 + gap,
              y: originalNode.position.y
            };
            break;
          case 'bottom':
            followUpPosition = {
              x: originalNode.position.x,
              y: originalNode.position.y + 150 + gap
            };
            break;
          case 'left':
            followUpPosition = {
              x: originalNode.position.x - 200 - gap,
              y: originalNode.position.y
            };
            break;
        }

        // Create similar color (slightly darker)
        const originalColor = originalNode.data.color as string;
        const followUpColor = adjustColorBrightness(originalColor, -0.1);

        // Create follow-up node
        const followUpNodeId = `followup-${originalQuestionId}-${Date.now()}`;
        const followUpNode: Node = {
          id: followUpNodeId,
          type: 'questionStickyNote',
          position: followUpPosition,
          data: {
            question: followUpQuestion,
            color: followUpColor,
            answer: '',
            questionId: followUpNodeId,
            onChange: (answer: string) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === followUpNodeId
                    ? { ...node, data: { ...node.data, answer } }
                    : node
                )
              );
            },
            onDelete: () => {
              setNodes((nds) => nds.filter((node) => node.id !== followUpNodeId));
              // Also remove any edges connected to this node
              setEdges((eds) => eds.filter((edge) => 
                edge.source !== followUpNodeId && edge.target !== followUpNodeId
              ));
            },
            onFollowUp: (originalQuestionId: string, question: string, answer: string, position: 'top' | 'right' | 'bottom' | 'left') => {
              if (addFollowUpRef.current) {
                addFollowUpRef.current(originalQuestionId, question, answer, position);
              }
            },
          },
          draggable: true,
          selectable: true,
        };

        // Add the follow-up node
        setNodes((prevNodes) => [...prevNodes, followUpNode]);

        // Create clean bezier connection between original and follow-up
        const connectionEdge: Edge = {
          id: `edge-${originalQuestionId}-${followUpNodeId}`,
          source: originalQuestionId,
          target: followUpNodeId,
          type: 'bezier',
          style: {
            stroke: '#6366F1',
            strokeWidth: 1.5,
            strokeDasharray: '8 4',
            opacity: 0.6,
          },
          animated: false,
          selectable: false,
        };

        setEdges((prevEdges) => [...prevEdges, connectionEdge]);
        
      } catch (error) {
        console.error('Error creating follow-up question:', error);
      }
    }, [nodes, setNodes, setEdges]);

    // Set the ref value
    addFollowUpRef.current = addFollowUpQuestion;

    // Helper function to adjust color brightness
    const adjustColorBrightness = (color: string, amount: number) => {
      // Simple color adjustment - convert hex to rgb, adjust, convert back
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      const newR = Math.max(0, Math.min(255, r + (amount * 255)));
      const newG = Math.max(0, Math.min(255, g + (amount * 255)));
      const newB = Math.max(0, Math.min(255, b + (amount * 255)));
      
      return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
    };

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
      createQuestionSession,
      addFollowUpQuestion,
    }), [addStickyNote, createQuestionSession, addFollowUpQuestion]);

    // Custom node types
    const nodeTypes = {
      kawaiiStickyNote: KawaiiStickyNoteNode,
      questionStickyNote: QuestionStickyNote,
      sessionTitle: SessionTitle,
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
          onMove={onMove}
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
            backgroundColor: '#F1F1F1',
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
              backgroundColor: '#F1F1F1',
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