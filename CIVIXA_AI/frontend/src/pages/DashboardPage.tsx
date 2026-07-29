import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Activity, CheckCircle, Clock, AlertTriangle, RefreshCw, Brain, Search, Route, UserCheck, Shield, Zap } from 'lucide-react'
import axios from 'axios'
import { SharedContainer } from '../components/SharedContainer'
import { Spacer } from '../components/Spacer'

const API = 'http://localhost:5000'

const AGENT_LIST = [
  { key: 'understand', label: 'Complaint Understanding', icon: Brain, port: 8001, color: '#00D4FF' },
  { key: 'duplicate', label: 'Duplicate Detection', icon: Search, port: 8002, color: '#FF8C32' },
  { key: 'route', label: 'Department Routing', icon: Route, port: 8003, color: '#00C853' },
  { key: 'priority', label: 'Priority Assessment', icon: AlertTriangle, port: 8004, color: '#FFC857' },
  { key: 'assign', label: 'Officer Assignment', icon: UserCheck, port: 8005, color: '#A78BFA' },
  { key: 'verify', label: 'Resolution Verification', icon: Shield, port: 8006, color: '#00C853' },
]

type AgentHealth = Record<string, { status: string; agent?: string }>
type Stats = {
  total: number
  by_status: { status: string; count: string }[]
  by_department: { department: string; count: string }[]
  by_priority: { priority: string; count: string }[]
}

const MOCK_STATS: Stats = {
  total: 142,
  by_status: [
    { status: 'Resolved', count: '89' },
    { status: 'Assigned', count: '31' },
    { status: 'Pending', count: '14' },
    { status: 'Reopened', count: '8' },
  ],
  by_department: [
    { department: 'Roads', count: '38' },
    { department: 'Water Supply', count: '27' },
    { department: 'Electricity', count: '24' },
    { department: 'Sanitation', count: '19' },
    { department: 'Waste Management', count: '15' },
    { department: 'Street Lighting', count: '12' },
    { department: 'Drainage', count: '7' },
  ],
  by_priority: [
    { priority: 'Critical', count: '12' },
    { priority: 'High', count: '34' },
    { priority: 'Medium', count: '61' },
    { priority: 'Low', count: '35' },
  ]
}

const STATUS_COLORS: Record<string, string> = {
  Resolved: '#00C853', Assigned: '#00D4FF', Pending: '#FFC857', Reopened: '#ff4444', 'In Progress': '#FF8C32'
}
const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#ff4444', High: '#FF8C32', Medium: '#FFC857', Low: '#00C853'
}

export default function DashboardPage() {
  const [agentHealth, setAgentHealth] = useState<AgentHealth>({})
  const [stats, setStats] = useState<Stats>(MOCK_STATS)
  const [loadingHealth, setLoadingHealth] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchHealth = async () => {
    setLoadingHealth(true)
    try {
      const res = await axios.get(`${API}/api/agents/health`, { timeout: 5000 })
      const raw = res.data as Record<string, { status: string; name?: string }>
      const mapped: AgentHealth = {}
      const keyMap: Record<string, string> = { '1': 'understand', '2': 'duplicate', '3': 'route', '4': 'priority', '5': 'assign', '6': 'verify' }
      Object.entries(raw).forEach(([id, val]) => { mapped[keyMap[id] || id] = val })
      setAgentHealth(mapped)
    } catch {
      const offline: AgentHealth = {}
      AGENT_LIST.forEach(a => { offline[a.key] = { status: 'offline' } })
      setAgentHealth(offline)
    } finally {
      setLoadingHealth(false)
      setLastRefresh(new Date())
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/api/agents/stats`, { timeout: 5000 })
      if (res.data.total > 0) setStats(res.data)
    } catch {
      // use mock
    }
  }

  useEffect(() => {
    fetchHealth()
    fetchStats()
  }, [])

  const onlineCount = Object.values(agentHealth).filter(a => a.status === 'online').length
  const totalComplaints = stats.total
  const resolved = stats.by_status.find(s => s.status === 'Resolved')?.count || '0'
  const pending = stats.by_status.find(s => s.status === 'Pending')?.count || '0'

  return (
    <div className="relative z-10 w-full flex flex-col items-center pt-[96px] pb-[64px] overflow-hidden">
      <SharedContainer className="flex flex-col">
        
        {/* Header */}
        <motion.div className="w-full flex items-center justify-between flex-wrap gap-[16px]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col items-start gap-[8px]">
            <div className="badge badge-cyan inline-flex gap-2"><Activity size={12} /> Live Dashboard</div>
            <h1 className="text-4xl font-bold leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
              <span className="text-gradient-saffron">Analytics</span>{' '}
              <span style={{ color: '#F8FAFC' }}>Dashboard</span>
            </h1>
            <p className="text-sm" style={{ color: 'rgba(248,250,252,0.4)' }}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button
            className="btn-cyan px-[24px] py-[12px] text-[15px] flex items-center gap-[8px] rounded-lg"
            onClick={() => { fetchHealth(); fetchStats() }}
            disabled={loadingHealth}
          >
            <RefreshCw size={16} className={loadingHealth ? 'animate-spin' : ''} />
            Refresh
          </button>
        </motion.div>

        <Spacer h={32} />

        {/* KPI Cards */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-[24px]">
          {[
            { label: 'Total Complaints', value: totalComplaints, icon: BarChart3, color: '#00D4FF' },
            { label: 'Resolved', value: resolved, icon: CheckCircle, color: '#00C853' },
            { label: 'Pending', value: pending, icon: Clock, color: '#FFC857' },
            { label: 'Agents Online', value: `${onlineCount}/6`, icon: Zap, color: onlineCount >= 4 ? '#00C853' : '#FF8C32' },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              className="glass-card p-[24px] flex flex-col gap-[12px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center shrink-0" style={{ background: `${kpi.color}20` }}>
                  <kpi.icon size={24} style={{ color: kpi.color }} />
                </div>
                <span className="status-dot status-online w-2 h-2 rounded-full" style={{ background: kpi.color, boxShadow: `0 0 10px ${kpi.color}` }} />
              </div>
              <div className="flex flex-col gap-[4px] mt-auto">
                <div className="text-3xl font-bold leading-none" style={{ color: kpi.color, fontFamily: 'Space Grotesk' }}>
                  {kpi.value}
                </div>
                <div className="text-[13px] font-medium tracking-wide" style={{ color: 'rgba(248,250,252,0.5)' }}>{kpi.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <Spacer h={24} />

        {/* 3-Column Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
          
          {/* Agent Health */}
          <motion.div className="glass-card p-[32px] flex flex-col gap-[20px]" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="font-bold text-[20px] leading-tight" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>
              Agent Health Monitor
            </h2>
            <div className="flex flex-col gap-[12px]">
              {AGENT_LIST.map((agent, i) => {
                const health = agentHealth[agent.key]
                const isOnline = health?.status === 'online'
                return (
                  <motion.div key={agent.key} className="flex items-center gap-[12px] p-[12px] rounded-[14px]" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.08)' }}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                    <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: `${agent.color}15` }}>
                      <agent.icon size={18} style={{ color: agent.color }} />
                    </div>
                    <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                      <div className="text-[14px] font-medium truncate" style={{ color: '#F8FAFC' }}>{agent.label}</div>
                      <div className="text-[12px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Port: {agent.port}</div>
                    </div>
                    <div className="flex items-center gap-[6px] shrink-0">
                      <span className={`status-dot w-2 h-2 rounded-full ${isOnline ? 'status-online' : loadingHealth ? 'status-busy' : 'status-offline'}`} />
                      <span className="text-[12px] font-semibold" style={{ color: isOnline ? '#00C853' : loadingHealth ? '#FFC857' : '#ff4444' }}>
                        {loadingHealth ? 'Checking' : isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Complaints by Status */}
          <motion.div className="glass-card p-[32px] flex flex-col gap-[20px]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="font-bold text-[20px] leading-tight" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>
              Complaints by Status
            </h2>
            <div className="flex flex-col gap-[16px]">
              {stats.by_status.map((item, i) => {
                const color = STATUS_COLORS[item.status] || '#00D4FF'
                const pct = totalComplaints > 0 ? Math.round((Number(item.count) / totalComplaints) * 100) : 0
                return (
                  <div key={i} className="flex flex-col gap-[6px]">
                    <div className="flex justify-between text-[14px] font-medium">
                      <span style={{ color: '#F8FAFC' }}>{item.status}</span>
                      <span style={{ color }}>{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-[6px] rounded-full w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div className="h-[6px] rounded-full" style={{ background: color, width: 0 }}
                        animate={{ width: `${pct}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Priority Breakdown */}
          <motion.div className="glass-card p-[32px] flex flex-col gap-[20px]" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <h2 className="font-bold text-[20px] leading-tight" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>
              Priority Breakdown
            </h2>
            <div className="flex flex-col gap-[16px]">
              {stats.by_priority.map((item, i) => {
                const color = PRIORITY_COLORS[item.priority] || '#00D4FF'
                const pct = totalComplaints > 0 ? Math.round((Number(item.count) / totalComplaints) * 100) : 0
                return (
                  <div key={i} className="flex flex-col gap-[6px]">
                    <div className="flex justify-between text-[14px] font-medium">
                      <span style={{ color: '#F8FAFC' }}>{item.priority}</span>
                      <span style={{ color }}>{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-[6px] rounded-full w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div className="h-[6px] rounded-full" style={{ background: color, width: 0 }}
                        animate={{ width: `${pct}%` }} transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: 'easeOut' }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <Spacer h={16} />

            <div className="w-full grid grid-cols-2 gap-[8px] mt-auto">
              {stats.by_priority.map((item, i) => {
                const color = PRIORITY_COLORS[item.priority] || '#00D4FF'
                return (
                  <div key={i} className="p-[16px] rounded-xl text-center flex flex-col gap-[4px]" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
                    <div className="text-[20px] font-bold leading-none" style={{ color }}>{item.count}</div>
                    <div className="text-[12px] font-semibold tracking-wide" style={{ color: 'rgba(248,250,252,0.5)' }}>{item.priority}</div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        <Spacer h={24} />

        {/* Department Stats */}
        <motion.div className="glass-card p-[32px] flex flex-col gap-[20px] w-full" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-bold text-[20px] leading-tight" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>
            Complaints by Department
          </h2>
          <div className="flex flex-col gap-[16px]">
            {stats.by_department.map((item, i) => {
              const maxCount = Math.max(...stats.by_department.map(d => Number(d.count)))
              const pct = Math.round((Number(item.count) / maxCount) * 100)
              const colors = ['#00D4FF', '#FF8C32', '#00C853', '#FFC857', '#A78BFA', '#ff6b6b', '#00D4FF']
              const color = colors[i % colors.length]
              return (
                <div key={i} className="flex items-center gap-[16px] w-full">
                  <div className="w-[160px] text-[14px] shrink-0 font-medium" style={{ color: '#F8FAFC' }}>{item.department}</div>
                  <div className="flex-1 h-[8px] rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div className="h-[8px] rounded-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)`, width: 0 }}
                      animate={{ width: `${pct}%` }} transition={{ delay: 0.3 + i * 0.08, duration: 0.8, ease: 'easeOut' }} />
                  </div>
                  <div className="w-[40px] text-[14px] text-right shrink-0 font-bold" style={{ color }}>{item.count}</div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <Spacer h={24} />

        {/* System Info */}
        <motion.div className="glass-card p-[32px] flex flex-col gap-[24px] w-full" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-bold text-[20px] leading-tight" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>
            System Architecture
          </h2>
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-[24px]">
            {[
              { title: 'Frontend', items: ['React + Vite + TypeScript', 'Tailwind CSS', 'Framer Motion', 'tsParticles'], color: '#00D4FF' },
              { title: 'Backend', items: ['Express.js + Node.js', 'PostgreSQL Database', 'REST API Gateway', 'Agent Orchestration'], color: '#FF8C32' },
              { title: 'AI Agents', items: ['FastAPI + Python', 'Google Gemini 1.5 Flash', 'Sentence Transformers', '6 Independent Agents'], color: '#00C853' },
            ].map((col, i) => (
              <div key={i} className="p-[20px] rounded-[16px] flex flex-col gap-[12px]" style={{ background: `${col.color}08`, border: `1px solid ${col.color}20` }}>
                <div className="font-bold text-[16px] leading-none" style={{ color: col.color, fontFamily: 'Space Grotesk' }}>{col.title}</div>
                <ul className="flex flex-col gap-[8px]">
                  {col.items.map((item, j) => (
                    <li key={j} className="text-[14px] flex items-center gap-[8px]" style={{ color: 'rgba(248,250,252,0.7)' }}>
                      <span className="text-[10px]" style={{ color: col.color }}>▸</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
        
      </SharedContainer>
    </div>
  )
}
