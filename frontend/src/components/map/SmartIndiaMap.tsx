import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

const INDIA_NODES = [
  { id: 'del', x: 35, y: 25, name: 'New Delhi', type: 'hq', status: 'optimal' },
  { id: 'mum', x: 25, y: 65, name: 'Mumbai', type: 'hub', status: 'warning' },
  { id: 'blr', x: 38, y: 80, name: 'Bengaluru', type: 'hub', status: 'optimal' },
  { id: 'hyd', x: 42, y: 70, name: 'Hyderabad', type: 'hub', status: 'optimal' },
  { id: 'chn', x: 45, y: 85, name: 'Chennai', type: 'hub', status: 'optimal' },
  { id: 'kol', x: 75, y: 50, name: 'Kolkata', type: 'hub', status: 'optimal' },
  { id: 'ahm', x: 15, y: 50, name: 'Ahmedabad', type: 'node', status: 'optimal' },
  { id: 'pne', x: 28, y: 68, name: 'Pune', type: 'node', status: 'optimal' },
  { id: 'jpr', x: 25, y: 35, name: 'Jaipur', type: 'node', status: 'optimal' },
  { id: 'lko', x: 48, y: 38, name: 'Lucknow', type: 'node', status: 'warning' },
  { id: 'pat', x: 62, y: 42, name: 'Patna', type: 'node', status: 'optimal' },
  { id: 'bpl', x: 40, y: 52, name: 'Bhopal', type: 'node', status: 'optimal' },
  { id: 'ind', x: 32, y: 54, name: 'Indore', type: 'node', status: 'optimal' },
  { id: 'cnd', x: 33, y: 18, name: 'Chandigarh', type: 'node', status: 'optimal' },
  { id: 'sri', x: 25, y: 8, name: 'Srinagar', type: 'node', status: 'optimal' },
  { id: 'tvm', x: 38, y: 92, name: 'Trivandrum', type: 'node', status: 'optimal' },
  { id: 'gwh', x: 85, y: 40, name: 'Guwahati', type: 'node', status: 'optimal' },
  { id: 'bbs', x: 65, y: 60, name: 'Bhubaneswar', type: 'node', status: 'optimal' },
  { id: 'rnp', x: 55, y: 55, name: 'Raipur', type: 'node', status: 'optimal' },
  { id: 'rnc', x: 65, y: 50, name: 'Ranchi', type: 'node', status: 'optimal' },
];

const CONNECTIONS = [
  ['del', 'mum'], ['del', 'blr'], ['del', 'kol'], ['del', 'hyd'],
  ['mum', 'blr'], ['blr', 'chn'], ['hyd', 'chn'], ['kol', 'bbs'],
  ['mum', 'ahm'], ['mum', 'pne'], ['del', 'jpr'], ['del', 'lko'],
  ['lko', 'pat'], ['pat', 'kol'], ['del', 'bpl'], ['bpl', 'ind'],
  ['ind', 'mum'], ['del', 'cnd'], ['cnd', 'sri'], ['blr', 'tvm'],
  ['kol', 'gwh'], ['bbs', 'hyd'], ['bpl', 'rnp'], ['pat', 'rnc'],
  ['rnc', 'kol'], ['rnp', 'bbs']
];

export const SmartIndiaMap = () => {
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [activePulses, setActivePulses] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePulses(prev => {
        const next = [...prev];
        if (next.length > 5) next.shift();
        next.push(Math.floor(Math.random() * CONNECTIONS.length));
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[600px] bg-futuristic-deep rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      {/* Background Grids & Glow */}
      <div className="absolute inset-0 grid-bg opacity-20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-india-saffron/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-india-green/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="absolute inset-0 p-8">
        <div className="relative w-full h-full">
          {/* Map Outline Silhouette Simulation (Using soft radial glow to form the shape) */}
          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e4/India_outline_map.svg')] bg-contain bg-no-repeat bg-center opacity-10 blur-[2px]" style={{ filter: 'invert(1) sepia(1) saturate(5) hue-rotate(175deg)' }}></div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Base Connections */}
            {CONNECTIONS.map(([start, end], idx) => {
              const startNode = INDIA_NODES.find(n => n.id === start);
              const endNode = INDIA_NODES.find(n => n.id === end);
              if (!startNode || !endNode) return null;
              
              const isActive = activePulses.includes(idx);
              
              return (
                <g key={`${start}-${end}`}>
                  <line
                    x1={`${startNode.x}%`}
                    y1={`${startNode.y}%`}
                    x2={`${endNode.x}%`}
                    y2={`${endNode.y}%`}
                    stroke="rgba(0, 240, 255, 0.15)"
                    strokeWidth="1"
                  />
                  {isActive && (
                    <motion.circle
                      r="2"
                      fill="#00f0ff"
                      initial={{ offsetDistance: "0%" }}
                      animate={{ offsetDistance: "100%" }}
                      transition={{ duration: 1.5, ease: "linear" }}
                      style={{
                        offsetPath: `path("M ${startNode.x * 8} ${startNode.y * 6} L ${endNode.x * 8} ${endNode.y * 6}")`
                      }}
                      className="drop-shadow-[0_0_8px_rgba(0,240,255,1)]"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {INDIA_NODES.map((node) => (
            <motion.div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onHoverStart={() => setHoveredNode(node)}
              onHoverEnd={() => setHoveredNode(null)}
              whileHover={{ scale: 1.5 }}
            >
              <div className="relative flex items-center justify-center">
                {/* Node Core */}
                <div className={`w-3 h-3 rounded-full ${node.type === 'hq' ? 'bg-india-saffron' : node.status === 'warning' ? 'bg-red-500' : 'bg-futuristic-cyan'} shadow-[0_0_10px_currentColor] relative z-10`} />
                
                {/* Pulsing Outer Ring */}
                <div className={`absolute w-full h-full rounded-full ${node.type === 'hq' ? 'bg-india-saffron' : node.status === 'warning' ? 'bg-red-500' : 'bg-futuristic-cyan'} animate-ping opacity-50`} />
                
                {/* Extra Ring for HQ */}
                {node.type === 'hq' && (
                  <div className="absolute w-8 h-8 rounded-full border border-india-saffron/50 animate-[spin_3s_linear_infinite]" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hover Info Panel */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-8 right-8 glass-vision p-6 w-80 pointer-events-none z-20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white tracking-wide">{hoveredNode.name}</h3>
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${hoveredNode.status === 'warning' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-india-green/20 text-india-greenGlow border border-india-green/30'}`}>
                {hoveredNode.status === 'warning' ? 'High Load' : 'Optimal'}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-gray-400">Node Type</span>
                <span className="text-white font-medium uppercase tracking-wider">{hoveredNode.type === 'hq' ? 'Command Center' : hoveredNode.type === 'hub' ? 'Regional Hub' : 'Edge Node'}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-gray-400">Active AI Agents</span>
                <span className="text-futuristic-cyan font-mono font-bold">
                  {Math.floor(Math.random() * 50) + 10}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                <span className="text-gray-400">Live Grievances</span>
                <span className="text-india-saffronGlow font-mono font-bold">
                  {Math.floor(Math.random() * 500) + 100}
                </span>
              </div>
              
              {/* Simulated processing load bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Processing Load</span>
                  <span className="text-white font-mono">{hoveredNode.status === 'warning' ? '85%' : '32%'}</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: hoveredNode.status === 'warning' ? '85%' : '32%' }}
                    className={`h-full ${hoveredNode.status === 'warning' ? 'bg-red-500' : 'bg-india-greenGlow'} shadow-[0_0_10px_currentColor]`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Title */}
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-5 h-5 text-futuristic-cyan" />
          <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-lg">NATIONAL <span className="text-futuristic-cyan">GRID</span></h2>
        </div>
        <p className="text-gray-400 text-sm font-medium tracking-wide">Live AI Command Center Map</p>
      </div>
    </div>
  );
};
