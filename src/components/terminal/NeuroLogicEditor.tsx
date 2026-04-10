import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Activity, 
  Layers, 
  Zap, 
  MousePointer2, 
  Plus, 
  Trash2, 
  Play,
  Save,
  ArrowRight
} from 'lucide-react';
import { Node, Connection, VisualGraph, NodeType } from '../../lib/NeuroLogic';

/**
 * NeuroLogicEditor.tsx
 * A custom visual node-based editor for designing trading strategies.
 * High-performance, glassmorphism-inspired UI built with Framer Motion.
 */

const NODE_TYPES: { type: NodeType; label: string; icon: any; color: string }[] = [
  { type: 'MARKET_DATA', label: 'Market Data', icon: Database, color: 'var(--accent-cyan)' },
  { type: 'INDICATOR', label: 'Indicator', icon: Activity, color: 'var(--accent-violet)' },
  { type: 'CONDITION', label: 'Condition', icon: Layers, color: 'var(--accent-amber)' },
  { type: 'LOGIC_GATE', label: 'Logic Gate', icon: Zap, color: 'var(--accent-blue)' },
  { type: 'SIGNAL', label: 'Signal', icon: ArrowRight, color: 'var(--accent-green)' },
];

export const NeuroLogicEditor: React.FC = () => {
  const [graph, setGraph] = useState<VisualGraph>({
    nodes: [
      { id: '1', type: 'MARKET_DATA', position: { x: 50, y: 50 }, data: { field: 'close' } },
      { id: '2', type: 'INDICATOR', position: { x: 250, y: 50 }, data: { indicator: 'SMA', period: 20 } },
      { id: '3', type: 'SIGNAL', position: { x: 500, y: 150 }, data: { action: 'BUY' } },
    ],
    connections: [
      { id: 'c1', sourceId: '1', targetId: '2' },
    ],
  });

  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<{ sourceId: string; startPos: { x: number; y: number } } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addNode = (type: NodeType) => {
    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      position: { x: 100, y: 100 },
      data: type === 'INDICATOR' ? { indicator: 'RSI', period: 14 } : type === 'CONDITION' ? { operator: '>' } : {},
    };
    setGraph({ ...graph, nodes: [...graph.nodes, newNode] });
  };

  const deleteNode = (id: string) => {
    setGraph({
      nodes: graph.nodes.filter(n => n.id !== id),
      connections: graph.connections.filter(c => c.sourceId !== id && c.targetId !== id),
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 50; // Center offset
      const y = e.clientY - rect.top - 25;
      
      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === draggingNode ? { ...n, position: { x, y } } : n)
      }));
    }
  };

  const startConnection = (id: string, e: React.MouseEvent) => {
    const node = graph.nodes.find(n => n.id === id);
    if (node) {
      setConnecting({ sourceId: id, startPos: { x: node.position.x + 100, y: node.position.y + 25 } });
    }
  };

  const endConnection = (id: string) => {
    if (connecting && connecting.sourceId !== id) {
      const newConn: Connection = {
        id: `c-${Date.now()}`,
        sourceId: connecting.sourceId,
        targetId: id,
      };
      setGraph({ ...graph, connections: [...graph.connections, newConn] });
    }
    setConnecting(null);
  };

  return (
    <div className="logic-editor-container" ref={containerRef} onMouseMove={handleMouseMove} onMouseUp={() => { setDraggingNode(null); setConnecting(null); }}>
      {/* Sidebar Controls */}
      <div className="editor-toolbox glass-card">
        <h3>Components</h3>
        <div className="toolbox-items">
          {NODE_TYPES.map(nodeType => (
            <button key={nodeType.type} className="toolbox-btn" onClick={() => addNode(nodeType.type)}>
              <nodeType.icon size={16} color={nodeType.color} />
              <span>{nodeType.label}</span>
              <Plus size={12} className="plus-icon" />
            </button>
          ))}
        </div>
        <div className="editor-actions">
          <button className="action-btn primary"><Save size={16} /> Save Strategy</button>
          <button className="action-btn secondary"><Play size={16} /> Test Logic</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="editor-canvas">
        <svg className="connections-layer">
          {graph.connections.map(conn => {
            const source = graph.nodes.find(n => n.id === conn.sourceId);
            const target = graph.nodes.find(n => n.id === conn.targetId);
            if (!source || !target) return null;

            const x1 = source.position.x + 150;
            const y1 = source.position.y + 40;
            const x2 = target.position.x;
            const y2 = target.position.y + 40;

            const cp1x = x1 + (x2 - x1) / 2;
            const cp2x = x1 + (x2 - x1) / 2;

            return (
              <path
                key={conn.id}
                d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="var(--accent-cyan)"
                strokeWidth="2"
                strokeOpacity="0.4"
                className="connector-path"
              />
            );
          })}
        </svg>

        {graph.nodes.map(node => (
          <NodeComponent
            key={node.id}
            node={node}
            onDragStart={() => setDraggingNode(node.id)}
            onConnectStart={(e) => startConnection(node.id, e)}
            onConnectEnd={() => endConnection(node.id)}
            onDelete={() => deleteNode(node.id)}
          />
        ))}
      </div>
    </div>
  );
};

const NodeComponent: React.FC<{
  node: Node;
  onDragStart: () => void;
  onConnectStart: (e: React.MouseEvent) => void;
  onConnectEnd: () => void;
  onDelete: () => void;
}> = ({ node, onDragStart, onConnectStart, onConnectEnd, onDelete }) => {
  const nodeType = NODE_TYPES.find(t => t.type === node.type);
  const Icon = nodeType?.icon || Database;

  return (
    <motion.div
      className={`canvas-node glass-card ${node.type.toLowerCase()}`}
      style={{ left: node.position.x, top: node.position.y }}
      drag
      dragMomentum={false}
      onDragStart={onDragStart}
    >
      <div className="node-header" style={{ borderLeft: `3px solid ${nodeType?.color}` }}>
        <Icon size={14} color={nodeType?.color} />
        <span>{nodeType?.label}</span>
        <button className="node-delete" onClick={onDelete}><Trash2 size={12} /></button>
      </div>
      <div className="node-content">
        {node.type === 'INDICATOR' && (
          <select value={node.data.indicator}>
            <option>SMA</option>
            <option>RSI</option>
            <option>MACD</option>
          </select>
        )}
        {node.type === 'SIGNAL' && (
          <span className={`signal-badge ${node.data.action.toLowerCase()}`}>{node.data.action}</span>
        )}
        {node.type === 'MARKET_DATA' && (
          <span className="data-field">{node.data.field}</span>
        )}
      </div>
      
      {/* Handles */}
      <div className="handle input" onMouseUp={onConnectEnd} />
      <div className="handle output" onMouseDown={onConnectStart} />
    </motion.div>
  );
};

export default NeuroLogicEditor;
