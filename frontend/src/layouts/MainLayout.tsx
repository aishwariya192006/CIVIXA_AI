import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FileText, Users, Settings, LogOut, 
  Bell, Activity, Globe, Mic, Moon, Sun, AlertTriangle 
} from 'lucide-react';
import api from '../services/api';
import { AiChatWidget } from '../components/AiChatWidget';
import { getSocket } from '../services/socket';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationCenter } from '../components/notifications/NotificationCenter';

export const MainLayout = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { user, logout } = useAuth();
  const { currentLang, setCurrentLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleVoiceClick = () => {
    if (isListening) return;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onstart = () => setIsListening(true);
      
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        alert(`Voice Command: "${transcript}"\n(AI Agent processing...)`);
      };
      
      recognition.start();
    } else {
      setIsListening(true);
      setTimeout(() => setIsListening(false), 3000);
      alert('Voice commands simulated (browser not supported).');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) setScrolled(isScrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  useEffect(() => {
    if (user) {
      const socket = getSocket();
      socket.emit('join_user', user.id);
    }
  }, [user]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/app' },
    { name: 'Complaints', icon: FileText, path: '/app/complaints' },
  ];

  if (user?.role === 'OFFICIAL' || user?.role === 'ADMIN') {
    navItems.push({ name: 'AI Analytics', icon: Activity, path: '/app/analytics' });
  }

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Users', icon: Users, path: '/app/users' });
    navItems.push({ name: 'AIOps', icon: Activity, path: '/app/aiops' });
    navItems.push({ name: 'Notifications', icon: Bell, path: '/app/notifications/admin' });
  }

  return (
    <div className="min-h-screen bg-futuristic-deep text-white font-sans overflow-hidden selection:bg-futuristic-cyan selection:text-futuristic-deep relative">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 aurora-bg opacity-50 pointer-events-none"></div>

      {/* Floating Glass Navbar */}
      <motion.header 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out ${
          scrolled 
            ? 'py-2 bg-futuristic-deep/80 backdrop-blur-xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
            : 'py-6 bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo (Animates on scroll) */}
          <motion.div 
            layout 
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className={`flex items-center justify-center rounded-xl bg-gradient-to-tr from-india-saffron to-orange-500 shadow-[0_0_15px_rgba(255,153,51,0.5)] font-black text-white transition-all duration-500 ${scrolled ? 'w-10 h-10 text-xl' : 'w-12 h-12 text-2xl'}`}>
              C
            </div>
            <div className={`font-bold tracking-tight transition-all duration-500 ${scrolled ? 'text-xl' : 'text-2xl'}`}>
              CIVIXA <span className="text-futuristic-cyan">AI</span>
            </div>
          </motion.div>

          {/* Center Navigation (Slides on scroll) */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-1 backdrop-blur-md">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/app'}
                className={({ isActive }) => 
                  `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm ${
                    isActive 
                      ? 'bg-futuristic-cyan/20 text-futuristic-cyan shadow-[inset_0_0_10px_rgba(0,240,255,0.2)] border border-futuristic-cyan/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {t(item.name)}
              </NavLink>
            ))}
          </nav>

          {/* Right Tools (Language, Voice, Theme, Profile, Emergency) */}
          <div className="flex items-center gap-3">
            
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full border bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowLanguage(!showLanguage)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                  showLanguage ? 'bg-futuristic-cyan/20 border-futuristic-cyan text-futuristic-cyan shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                }`}
                title="Language"
              >
                <Globe className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {showLanguage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-48 glass-premium border border-white/10 shadow-2xl z-50 overflow-hidden rounded-xl"
                  >
                    <div className="p-3 border-b border-white/10 bg-white/5">
                      <h3 className="font-semibold text-white text-sm">{t('Select Region')}</h3>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      {['English (US)', 'Hindi (हिन्दी)', 'Tamil (தமிழ்)', 'Telugu (తెలుగు)'].map(lang => (
                        <button 
                          key={lang} 
                          onClick={() => { setCurrentLang(lang as any); setShowLanguage(false); }} 
                          className={`text-left px-3 py-2 text-sm rounded-lg transition-colors ${currentLang === lang ? 'bg-futuristic-cyan/20 text-futuristic-cyan' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Notifications */}
            <NotificationCenter />

            {/* Profile Dropdown Simulation */}
            <div className="h-8 w-px bg-white/20 mx-2" />
            <div className="relative">
              <button 
                onClick={() => setShowProfile(!showProfile)} 
                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors group"
              >
                 <div className="w-10 h-10 rounded-full border border-futuristic-cyan/50 bg-futuristic-deep flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all">
                   <span className="font-bold text-futuristic-cyan">{user?.fullName.charAt(0).toUpperCase()}</span>
                 </div>
              </button>
              
              <AnimatePresence>
                {showProfile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-48 glass-premium border border-white/10 shadow-2xl z-50 overflow-hidden rounded-xl"
                  >
                    <div className="p-3 border-b border-white/10 bg-white/5">
                      <p className="font-semibold text-white text-sm truncate">{user?.fullName}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <button 
                        onClick={() => { setShowProfile(false); logout(); }} 
                        className="flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg transition-colors text-red-400 hover:text-red-300 hover:bg-white/10"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Dynamic Content */}
      <main className="relative z-10 pt-32 pb-10 px-6 max-w-7xl mx-auto min-h-screen">
         <Outlet />
      </main>

      <AiChatWidget />
    </div>
  );
};
