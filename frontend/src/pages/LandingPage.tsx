import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import Typewriter from 'typewriter-effect';
import { ChevronRight, Shield, Activity, Globe, BrainCircuit } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [showOrb, setShowOrb] = useState(false);

  useEffect(() => {
    // Delay orb entrance for dramatic effect
    const timer = setTimeout(() => setShowOrb(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="relative min-h-screen bg-futuristic-deep overflow-hidden flex flex-col items-center justify-center selection:bg-futuristic-cyan selection:text-futuristic-deep">
      
      {/* Dynamic Aurora & Grid Background */}
      <div className="absolute inset-0 z-0 aurora-bg opacity-70"></div>
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
      
      {/* High-Tech Particles (Neural Network) */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            fullScreen: { enable: false, zIndex: 0 },
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: { enable: true, mode: "grab" },
                onClick: { enable: true, mode: "push" },
                resize: true,
              },
              modes: {
                grab: { distance: 140, links: { opacity: 0.8, color: "#00f0ff" } },
                push: { quantity: 4 },
              },
            },
            particles: {
              color: { value: ["#FF9933", "#FFFFFF", "#138808", "#00f0ff"] },
              links: {
                color: "#4f46e5",
                distance: 150,
                enable: true,
                opacity: 0.3,
                width: 1,
              },
              collisions: { enable: true },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "bounce" },
                random: true,
                speed: 1.5,
                straight: false,
              },
              number: { density: { enable: true, width: 800, height: 800 }, value: 100 },
              opacity: { value: 0.6, animation: { enable: true, speed: 1, minimumValue: 0.1 } },
              shape: { type: "circle" },
              size: { value: { min: 1, max: 4 }, animation: { enable: true, speed: 2, minimumValue: 0.5 } },
            },
            detectRetina: true,
          }}
          className="w-full h-full absolute inset-0"
        />
      </div>

      {/* Floating UI Elements */}
      <motion.div 
        animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
        className="absolute w-[800px] h-[800px] rounded-full border border-gray-800/50 opacity-20 z-0"
      />
      <motion.div 
        animate={{ rotate: -360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="absolute w-[1200px] h-[1200px] rounded-full border border-gray-800/30 opacity-10 z-0"
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-5xl mx-auto mt-20">
        
        {/* Floating AI Orb */}
        <AnimatePresence>
          {showOrb && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: [0, -15, 0] }}
              transition={{ duration: 1, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
              className="relative w-32 h-32 mb-8 group cursor-pointer"
            >
              {/* Outer Rings */}
              <div className="absolute inset-0 rounded-full border border-futuristic-cyan/30 animate-[spin_4s_linear_infinite]" />
              <div className="absolute inset-2 rounded-full border border-india-saffron/40 animate-[spin_3s_linear_infinite_reverse]" />
              <div className="absolute inset-4 rounded-full border border-india-green/40 animate-[spin_5s_linear_infinite]" />
              
              {/* Core Orb */}
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-futuristic-cyan via-blue-600 to-purple-600 shadow-[0_0_40px_rgba(0,240,255,0.6)] group-hover:shadow-[0_0_60px_rgba(0,240,255,0.9)] transition-all duration-500 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                <BrainCircuit className="w-8 h-8 text-white relative z-10 animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-center gap-3 text-sm font-bold tracking-[0.2em] text-futuristic-cyan uppercase mb-4 opacity-80">
            <Shield className="w-4 h-4" /> 
            GovTech Initiative
            <Shield className="w-4 h-4" />
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] leading-tight tracking-tight min-h-[80px] md:min-h-[100px] flex items-center justify-center">
            <Typewriter
              options={{
                strings: ['CIVIXA <span style="color:#00f0ff">AI</span>', 'AI COMMAND <span style="color:#FF9933">CENTER</span>', 'SMART <span style="color:#4ADE80">GOVERNANCE</span>'],
                autoStart: true,
                loop: true,
                delay: 80,
                deleteSpeed: 40,
                cursorClassName: 'typewriter-cursor text-futuristic-cyan font-light',
              }}
            />
          </h1>

          <h2 className="text-xl md:text-2xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed h-[60px]">
            AI Powered Public Grievance Resolution Platform
          </h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="text-sm md:text-base text-gray-400 font-medium max-w-2xl mx-auto"
          >
            Empowering Smarter Governance Through Autonomous AI Agents
          </motion.p>
        </motion.div>

        {/* Live Counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          <div className="glass-panel px-4 py-2 flex items-center gap-2 text-sm font-semibold text-futuristic-cyan">
            <span className="w-2 h-2 rounded-full bg-futuristic-cyan animate-ping" />
            10 AI Agents Online
          </div>
          <div className="glass-panel px-4 py-2 flex items-center gap-2 text-sm font-semibold text-india-saffronGlow">
            <Activity className="w-4 h-4 animate-pulse" />
            2,450 Live Grievances
          </div>
          <div className="glass-panel px-4 py-2 flex items-center gap-2 text-sm font-semibold text-india-greenGlow">
            <Globe className="w-4 h-4 animate-spin-slow" />
            450 Cities Connected
          </div>
        </motion.div>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="flex flex-col sm:flex-row gap-6 mt-12"
        >
          <button 
            onClick={() => navigate('/login')}
            className="group relative px-8 py-4 bg-futuristic-deep/50 border border-futuristic-cyan/50 rounded-2xl overflow-hidden hover:border-futuristic-cyan hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300"
          >
            <div className="absolute inset-0 bg-futuristic-cyan/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-3 text-futuristic-cyan font-bold tracking-wider uppercase text-sm">
              Initialize Portal <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="group relative px-8 py-4 bg-gradient-to-r from-india-saffron/90 to-orange-600/90 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(255,153,51,0.3)] hover:shadow-[0_0_40px_rgba(255,153,51,0.6)] hover:scale-105 transition-all duration-300"
          >
            <span className="relative flex items-center gap-3 text-white font-bold tracking-wider uppercase text-sm">
              Explore Dashboard <Globe className="w-5 h-5 group-hover:animate-spin" />
            </span>
          </button>
        </motion.div>

      </div>

      {/* Futuristic Footer Stats */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-futuristic-deep to-transparent z-10 pointer-events-none" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3 }}
        className="relative z-20 flex gap-6 md:gap-12 text-center mt-20 pb-8"
      >
        <div>
          <p className="text-futuristic-cyan font-mono font-bold text-xl md:text-2xl">99.9%</p>
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 font-bold mt-1">AI Accuracy</p>
        </div>
        <div className="w-px h-10 bg-gray-800" />
        <div>
          <p className="text-india-greenGlow font-mono font-bold text-xl md:text-2xl">&lt;2ms</p>
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 font-bold mt-1">Latency</p>
        </div>
        <div className="w-px h-10 bg-gray-800" />
        <div>
          <p className="text-india-saffron font-mono font-bold text-xl md:text-2xl">AES-256</p>
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500 font-bold mt-1">Encryption</p>
        </div>
      </motion.div>
    </div>
  );
};
