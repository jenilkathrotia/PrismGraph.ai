'use client';

import { useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeMouseHandler,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GraphData, GraphNodeData, NODE_COLORS } from '@/lib/types';
import GraphNode from './GraphNode';

interface GraphCanvasProps {
  graphData: GraphData;
  onNodeClick: (node: GraphNodeData) => void;
  selectedNode: GraphNodeData | null;
}

const nodeTypes = { custom: GraphNode };

function layoutNodes(graphData: GraphData): { nodes: Node[]; edges: Edge[] } {
  const nodeCount = graphData.nodes.length;
  if (nodeCount === 0) return { nodes: [], edges: [] };

  // Force-directed-like circular layout with type grouping
  const typeGroups: Record<string, GraphNodeData[]> = {};
  graphData.nodes.forEach(n => {
    if (!typeGroups[n.type]) typeGroups[n.type] = [];
    typeGroups[n.type].push(n);
  });

  const types = Object.keys(typeGroups);
  const rfNodes: Node[] = [];
  const centerX = 600;
  const centerY = 400;

  types.forEach((type, typeIdx) => {
    const group = typeGroups[type];
    const anglePerType = (2 * Math.PI) / types.length;
    const baseAngle = typeIdx * anglePerType;
    const groupRadius = 250 + (typeIdx % 2) * 100;

    group.forEach((node, nodeIdx) => {
      const spread = Math.min(0.8, (group.length * 0.15));
      const angle = baseAngle + (nodeIdx - group.length / 2) * spread * 0.3;
      const r = groupRadius + (nodeIdx % 3) * 60 + Math.random() * 30;

      rfNodes.push({
        id: node.id,
        type: 'custom',
        position: {
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle),
        },
        data: {
          ...node,
          color: NODE_COLORS[node.type] || '#6366f1',
        },
      });
    });
  });

  const rfEdges: Edge[] = graphData.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'default',
    animated: edge.type === 'CITES' || edge.type === 'SUPPORTS' || edge.type === 'CONTRADICTS',
    style: {
      stroke: edge.type === 'CONTRADICTS' ? '#ff5252' :
              edge.type === 'SUPPORTS' ? '#00e676' :
              edge.type === 'CITES' ? '#00e5ff' :
              'rgba(99, 102, 241, 0.35)',
      strokeWidth: edge.type === 'CONTRADICTS' || edge.type === 'SUPPORTS' ? 2 : 1,
    },
    label: edge.type === 'CONTRADICTS' ? '⚡' : edge.type === 'SUPPORTS' ? '✓' : undefined,
    labelStyle: { fontSize: 10 },
  }));

  return { nodes: rfNodes, edges: rfEdges };
}

export default function GraphCanvas({ graphData, onNodeClick, selectedNode }: GraphCanvasProps) {
  const layout = useMemo(() => layoutNodes(graphData), [graphData]);
  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, , onEdgesChange] = useEdgesState(layout.edges);

  // Update nodes when graphData changes
  useMemo(() => {
    setNodes(layout.nodes);
  }, [layout.nodes, setNodes]);

  const handleNodeClick: NodeMouseHandler = useCallback((_, node) => {
    const graphNode = graphData.nodes.find(n => n.id === node.id);
    if (graphNode) onNodeClick(graphNode);
  }, [graphData.nodes, onNodeClick]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes.map(n => ({
          ...n,
          data: { ...n.data, isSelected: selectedNode?.id === n.id },
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={3}
        defaultEdgeOptions={{ type: 'default' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(99, 102, 241, 0.08)" gap={30} size={1} />
        <Controls position="bottom-left" />
        <MiniMap
          nodeColor={(node) => node.data?.color || '#6366f1'}
          maskColor="rgba(10, 11, 20, 0.85)"
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
}
