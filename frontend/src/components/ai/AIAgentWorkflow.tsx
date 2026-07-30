import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Layers, Route, AlertTriangle, UserCheck, Clock, ArrowUpCircle, CheckSquare, Bell, BarChart2 } from 'lucide-react';

const AGENTS = [
  { id: 'understand', name: 'Complaint Understanding', icon: Brain },
  { id: 'duplicate', name: 'Duplicate Detection', icon: Layers },
  { id: 'route', name: 'Department Routing', icon: Route },
  { id: 'priority', name: 'Priority Assessment', icon: AlertTriangle },
  { id: 'assign', name: 'Officer Assignment', icon: UserCheck },
  { id: 'reminder', name: 'Smart Reminder', icon: Clock },
  { id: 'escalate', name: 'Auto Escalation', icon: ArrowUpCircle },
  { id: 'verify', name: 'Resolution Verification', icon: CheckSquare },
  { id: 'notify', name: 'Citizen Notification', icon: Bell },
  { id: 'analytics', name: 'Predictive Analytics', icon: BarChart2 },
];

export const AIAgentWorkflow = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % AGENTS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-panel p-8 w-full">
      <div className="flex items-center gap-3 mb-8">
        <Brain className="w-6 h-6 text-futuristic-cyan" />
        <h2 className="text-2xl font-black text-white tracking-tight">AI AGENT <span className="text-futuristic-cyan">PIPELINE</span></h2>
      </div>

      <div className="relative">
        {/* Connection Line Background */}
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-white/10 -translate-y-1/2 rounded-full hidden lg:block" />
        
        {/* Animated Progress Line */}
        <div 
          className="absolute top-1/2 left-4 h-1 bg-gradient-to-r from-futuristic-cyan via-blue-500 to-purple-500 -translate-y-1/2 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.6)] hidden lg:block transition-all duration-1000 ease-in-out"
          style={{ width: `calc(${Math.max(0, (activeStep / (AGENTS.length - 1)) * 100)}% - 2rem)` }}
        />

        <div className="flex flex-col lg:flex-row justify-between relative z-10 gap-6 lg:gap-0">
          {AGENTS.map((agent, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const AgentIcon = agent.icon;

            return (
              <div key={agent.id} className="flex flex-row lg:flex-col items-center gap-4 lg:gap-3 group relative">
                
                {/* Node */}
                <motion.div
                  className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 relative ${
                    isActive 
                      ? 'bg-futuristic-cyan text-futuristic-deep shadow-[0_0_30px_rgba(0,240,255,0.8)] scale-110 z-20 border border-white/50' 
                      : isCompleted 
                        ? 'bg-futuristic-cyan/20 text-futuristic-cyan border border-futuristic-cyan/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                        : 'bg-white/5 text-gray-500 border border-white/10'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      className="absolute inset-0 rounded-2xl border-2 border-futuristic-cyan"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <AgentIcon className={`w-6 h-6 lg:w-8 lg:h-8 ${isActive ? 'animate-pulse' : ''}`} />
                </motion.div>

                {/* Vertical Line for Mobile */}
                {index < AGENTS.length - 1 && (
                  <div className={`w-1 h-8 lg:hidden ${isCompleted ? 'bg-futuristic-cyan shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'bg-white/10'}`} />
                )}

                {/* Label & Stats */}
                <div className={`flex flex-col text-left lg:text-center ${isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'} transition-opacity`}>
                  <p className={`text-sm font-bold tracking-tight w-32 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {agent.name}
                  </p>
                  
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1"
                      >
                        <p className="text-[10px] font-mono text-india-greenGlow font-bold">CONF: 99.8%</p>
                        <p className="text-[10px] font-mono text-gray-400">{(Math.random() * 0.5 + 0.1).toFixed(2)}ms</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
