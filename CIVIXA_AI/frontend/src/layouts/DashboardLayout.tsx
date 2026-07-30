import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Search, GitBranch, TriangleAlert, UserCheck, 
  BadgeCheck, LayoutDashboard, BarChart3, History, Settings, 
  LogOut, Zap, Activity, ChevronRight 
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ParticleBackground from '../components/ParticleBackground'

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, color: '#00D4FF', end: true },
  { to: '/dashboard/agent/1', label: 'AI Understanding', icon: Brain, color: '#FF8C32' },
  { to: '/dashboard/agent/2', label: 'Duplicate Analysis', icon: Search, color: '#00C853' },
  { to: '/dashboard/agent/3', label: 'Department Routing', icon: GitBranch, color: '#FFC857' },
  { to: '/dashboard/agent/4', label: 'Priority Intelligence', icon: TriangleAlert, color: '#A78BFA' },
  { to: '/dashboard/agent/5', label: 'Officer Allocation', icon: UserCheck, color: '#ff6b6b' },
  { to: '/dashboard/agent/6', label: 'Resolution Verification', icon: BadgeCheck, color: '#00D4FF' },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, color: '#FF8C32' },
  { to: '/dashboard/history', label: 'Complaint History', icon: History, color: '#00C853' },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, color: '#FFC857' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(true)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="app-layout aurora-bg relative z-10 overflow-hidden">
      <ParticleBackground />

      {/* Sidebar */}
      <aside
        className={`app-sidebar relative z-50 transition-all duration-300 ease-in-out flex flex-col shrink-0 ${isExpanded ? 'w-[260px]' : 'w-[72px]'}`}
        style={{ 
          background: 'rgba(6,19,31,0.95)', 
          borderRight: '1px solid rgba(0,212,255,0.15)', 
          backdropFilter: 'blur(20px)' 
        }}
      >
        {/* Logo */}
        <div className={`border-b border-[rgba(0,212,255,0.1)] flex items-center shrink-0 transition-all duration-300 ${isExpanded ? 'p-5' : 'py-5 flex-col justify-center'}`}>
          <div className={`orb shrink-0 ${isExpanded ? '' : 'mb-0'}`} style={{ width: 36, height: 36 }} />
          
          <div 
            className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isExpanded ? 'ml-3 opacity-100 w-auto' : 'opacity-0 w-0'}`}
          >
            <div className="text-gradient-saffron font-bold text-lg leading-none" style={{ fontFamily: 'Space Grotesk' }}>Civixa AI</div>
            <div style={{ fontSize: 9, color: 'rgba(0,212,255,0.6)', letterSpacing: '0.5px' }}>MULTI-AGENT PLATFORM</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 py-4 flex flex-col gap-2 relative">
          
          <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isExpanded ? 'opacity-100 h-auto mb-2 px-5' : 'opacity-0 h-0 mb-0 px-0'}`}>
            <span className="text-xs font-semibold" style={{ color: 'rgba(248,250,252,0.3)', letterSpacing: '1px' }}>NAVIGATION</span>
          </div>

          <div className={`flex flex-col gap-1 ${isExpanded ? 'px-3' : 'px-2 items-center'}`}>
            {NAV.map((item, idx) => (
              <div key={item.to} className="relative group w-full flex justify-center">
                <NavLink to={item.to} end={item.end}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl font-medium transition-all duration-200 group-hover:scale-[1.02] ${isActive ? 'active-nav' : 'hover:bg-[rgba(255,255,255,0.02)]'} ${isExpanded ? 'w-full gap-3 px-3 py-2.5' : 'w-12 h-12 justify-center p-0'}`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? `${item.color}15` : 'transparent',
                    color: isActive ? item.color : 'rgba(248,250,252,0.6)',
                    border: isActive ? `1px solid ${item.color}40` : '1px solid transparent',
                    boxShadow: isActive ? `0 0 16px ${item.color}15` : 'none'
                  })}
                >
                  <item.icon size={20} className="shrink-0 transition-transform group-hover:scale-110" />
                  
                  <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100 w-auto block text-sm' : 'opacity-0 w-0 hidden'}`}>
                    {item.label}
                  </span>
                </NavLink>

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-[56px] top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 whitespace-nowrap shadow-xl"
                    style={{ 
                      background: 'rgba(9,28,47,0.95)', 
                      backdropFilter: 'blur(12px)', 
                      border: `1px solid ${item.color}30`, 
                      color: '#F8FAFC',
                      fontSize: '13px',
                      fontWeight: 500
                    }}>
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom User & Logout */}
        <div className="border-t border-[rgba(0,212,255,0.1)] shrink-0 flex flex-col transition-all duration-300">
          
          <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap flex items-center px-4 py-3 border-b border-[rgba(0,212,255,0.05)] ${isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 p-0 border-transparent'}`}>
             {user && (
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                   style={{ background: 'linear-gradient(135deg,#FF8C32,#00D4FF)', color: '#fff' }}>
                   {user.name[0].toUpperCase()}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[13px] font-medium leading-none" style={{ color: '#F8FAFC' }}>{user.name}</span>
                   <span className="text-[11px] capitalize mt-1 leading-none" style={{ color: 'rgba(0,212,255,0.6)' }}>{user.role}</span>
                 </div>
               </div>
             )}
          </div>

          <div className={`flex flex-col gap-1 py-3 ${isExpanded ? 'px-3' : 'px-2 items-center'}`}>
            <div className="relative group w-full flex justify-center">
              <button onClick={handleLogout}
                className={`flex items-center rounded-xl transition-all duration-200 hover:bg-[rgba(255,107,107,0.1)] hover:text-[#ff6b6b] hover:border-[#ff6b6b]/30 ${isExpanded ? 'w-full gap-3 px-3 py-2.5' : 'w-12 h-12 justify-center p-0'}`}
                style={{ color: 'rgba(248,250,252,0.5)', border: '1px solid transparent' }}
              >
                <LogOut size={20} className="shrink-0 transition-transform group-hover:scale-110" />
                <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden text-sm font-medium ${isExpanded ? 'opacity-100 w-auto block' : 'opacity-0 w-0 hidden'}`}>
                  Logout
                </span>
              </button>
            </div>
          </div>

          {/* Toggle Button */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full flex items-center p-4 border-t border-[rgba(0,212,255,0.1)] hover:bg-[rgba(255,255,255,0.02)] transition-colors ${isExpanded ? 'justify-end' : 'justify-center'}`}
            style={{ color: 'rgba(248,250,252,0.5)' }}
          >
            <ChevronRight size={18} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="app-main-content relative z-10 flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 px-8 py-5 flex items-center justify-between shrink-0 transition-all duration-300"
          style={{ background: 'rgba(6,19,31,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <Zap size={20} style={{ color: '#FF8C32' }} />
            <span className="text-[16px] font-bold tracking-wide font-['Outfit']" style={{ color: 'rgba(248,250,252,0.9)' }}>Civixa AI Dashboard</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.2)' }}>
            <span className="status-dot status-online w-2 h-2" />
            <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: '#00C853' }}>System Online</span>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="flex-1 w-full px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
