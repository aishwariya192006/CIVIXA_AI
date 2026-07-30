import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Brain, Search, Route, AlertTriangle, UserCheck, CheckCircle, BarChart3, Activity, RefreshCw, Zap, Clock } from 'lucide-react'
import { agentAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const AGENTS = [
  { id: 1, label: 'Complaint Understanding', icon: Brain, color: '#00D4FF', port: 8001 },
  { id: 2, label: 'Duplicate Detection', icon: Search, color: '#FF8C32', port: 8002 },
  { id: 3, label: 'Dept Routing', icon: Route, color: '#00C853', port: 8003 },
  { id: 4, label: 'Priority Assessment', icon: AlertTriangle, color: '#FFC857', port: 8004 },
  { id: 5, label: 'Officer Assignment', icon: UserCheck, color: '#A78BFA', port: 8005 },
  { id: 6, label: 'Resolution Verify', icon: CheckCircle, color: '#00C853', port: 8006 },
]

type HealthData = Record<string, { status: string; name?: string }>
type StatsData = { total: number; byAgent: { _id: number; count: number; name: string }[]; recent: { agentName: string; executionTime: number; createdAt: string }[] }

export default function DashboardHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [health, setHealth] = useState<HealthData>({})
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [hRes, sRes] = await Promise.allSettled([agentAPI.health(), agentAPI.stats()])
      if (hRes.status === 'fulfilled') setHealth(hRes.value.data)
      if (sRes.status === 'fulfilled') setStats(sRes.value.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const onlineCount = Object.values(health).filter(a => a.status === 'online').length

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div className="mb-8 flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <div className="badge badge-cyan mb-2 inline-flex"><Activity size={12} /> Live Dashboard</div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>
            Welcome back, <span className="text-gradient-saffron">{user?.name || 'User'}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(248,250,252,0.4)' }}>
            {onlineCount}/6 agents online
          </p>
        </div>
        <button className="btn-cyan px-4 py-2.5 text-sm flex items-center gap-2" onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Runs', value: stats?.total ?? '—', icon: BarChart3, color: '#00D4FF' },
          { label: 'Agents Online', value: `${onlineCount}/6`, icon: Zap, color: onlineCount >= 4 ? '#00C853' : '#FF8C32' },
          { label: 'Avg Response', value: stats?.recent?.length ? `${Math.round(stats.recent.reduce((a, r) => a + r.executionTime, 0) / stats.recent.length)}ms` : '—', icon: Clock, color: '#FFC857' },
          { label: 'Active Agents', value: onlineCount, icon: Activity, color: '#A78BFA' },
        ].map((kpi, i) => (
          <motion.div key={i} className="glass-card flex flex-col"
            style={{ padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}20` }}>
                <kpi.icon size={20} style={{ color: kpi.color }} />
              </div>
              <span className="status-dot status-online" />
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: kpi.color, fontFamily: 'Space Grotesk' }}>{kpi.value}</div>
            <div className="text-xs" style={{ color: 'rgba(248,250,252,0.5)' }}>{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Agent Health Grid */}
      <motion.div className="glass-card mb-8"
        style={{ padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="font-bold text-lg mb-6" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>
          Agent Health Monitor
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AGENTS.map((agent, i) => {
            const h = health[String(agent.id)]
            const isOnline = h?.status === 'online'
            return (
              <motion.div key={agent.id}
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.08)' }}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: `${agent.color}50`, scale: 1.02 }}
                onClick={() => navigate(`/dashboard/agent/${agent.id}`)}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${agent.color}15` }}>
                  <agent.icon size={20} style={{ color: agent.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: '#F8FAFC' }}>{agent.label}</div>
                  <div className="text-xs" style={{ color: 'rgba(248,250,252,0.4)' }}>:{agent.port}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`status-dot ${isOnline ? 'status-online' : loading ? 'status-busy' : 'status-offline'}`} />
                  <span className="text-xs font-medium" style={{ color: isOnline ? '#00C853' : loading ? '#FFC857' : '#ff4444' }}>
                    {loading ? 'Checking' : isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Activity */}
      {stats?.recent && stats.recent.length > 0 && (
        <motion.div className="glass-card mb-8"
          style={{ padding: '24px', paddingBottom: '32px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="font-bold text-lg mb-6" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>
            Recent Activity
          </h2>
          <div className="flex flex-col">
            {stats.recent.map((r, i) => (
              <div key={i} className={`flex items-center gap-4 py-4 ${i !== stats.recent.length - 1 ? 'border-b border-[rgba(255,255,255,0.05)]' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-[#00C853]/10 flex items-center justify-center shrink-0">
                  <CheckCircle size={16} style={{ color: '#00C853' }} />
                </div>
                <div className="flex-1 text-[15px] font-medium" style={{ color: '#F8FAFC' }}>{r.agentName}</div>
                <div className="flex flex-col items-end shrink-0 gap-1">
                  <div className="text-[13px] font-semibold" style={{ color: '#00D4FF' }}>{r.executionTime}ms</div>
                  <div className="text-[11px] font-medium" style={{ color: 'rgba(248,250,252,0.4)' }}>
                    {new Date(r.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        {[
          { label: 'Test Agent 1', desc: 'Understand a complaint', color: '#00D4FF', path: '/dashboard/agent/1' },
          { label: 'View History', desc: 'See all agent runs', color: '#FF8C32', path: '/dashboard/history' },
          { label: 'Test All Agents', desc: 'Run the full pipeline', color: '#00C853', path: '/dashboard/agent/1' },
        ].map((action, i) => (
          <button key={i} className="glass-card flex flex-col items-start transition-all hover:-translate-y-1 hover:shadow-lg hover:border-white/20"
            style={{ cursor: 'pointer', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            onClick={() => navigate(action.path)}>
            <div className="font-bold text-[15px] mb-1.5" style={{ color: action.color, fontFamily: 'Space Grotesk' }}>{action.label}</div>
            <div className="text-[13px] font-medium" style={{ color: 'rgba(248,250,252,0.5)' }}>{action.desc}</div>
          </button>
        ))}
      </motion.div>
    </div>
  )
}
