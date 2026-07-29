import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { History, Trash2, RefreshCw, Brain, Search, Route, AlertTriangle, UserCheck, CheckCircle, Clock } from 'lucide-react'
import { agentAPI } from '../../services/api'
import toast from 'react-hot-toast'

const AGENT_ICONS: Record<number, React.ElementType> = {
  1: Brain, 2: Search, 3: Route, 4: AlertTriangle, 5: UserCheck, 6: CheckCircle
}
const AGENT_COLORS: Record<number, string> = {
  1: '#00D4FF', 2: '#FF8C32', 3: '#00C853', 4: '#FFC857', 5: '#A78BFA', 6: '#00C853'
}

interface HistoryItem {
  _id: string
  agentId: number
  agentName: string
  input: Record<string, unknown>
  output: Record<string, unknown>
  executionTime: number
  status: string
  createdAt: string
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filterAgent, setFilterAgent] = useState<number | undefined>()
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await agentAPI.history(filterAgent, 50)
      setItems(res.data)
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHistory() }, [filterAgent])

  const handleDelete = async (id: string) => {
    try {
      await agentAPI.deleteHistory(id)
      setItems(prev => prev.filter(i => i._id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div className="mb-6 flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History size={20} style={{ color: '#00D4FF' }} />
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>Agent History</h1>
          </div>
          <p className="text-sm" style={{ color: 'rgba(248,250,252,0.4)' }}>{items.length} records</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter */}
          <select className="px-3 py-2 text-sm" style={{ width: 160 }}
            value={filterAgent ?? ''} onChange={e => setFilterAgent(e.target.value ? Number(e.target.value) : undefined)}>
            <option value="">All Agents</option>
            {[1, 2, 3, 4, 5, 6].map(id => <option key={id} value={id}>Agent {id}</option>)}
          </select>
          <button className="btn-cyan px-4 py-2 text-sm flex items-center gap-2" onClick={fetchHistory} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </motion.div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="glass-card p-12 text-center">
          <History size={48} style={{ color: 'rgba(0,212,255,0.3)', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(248,250,252,0.4)' }}>No history yet. Run some agents to see results here.</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, i) => {
          const Icon = AGENT_ICONS[item.agentId] || Brain
          const color = AGENT_COLORS[item.agentId] || '#00D4FF'
          const isExpanded = expanded === item._id
          return (
            <motion.div key={item._id} className="glass-card p-4"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{item.agentName}</span>
                    <span className="badge badge-cyan text-xs">Agent {item.agentId}</span>
                    {item.output._mock && <span className="badge badge-gold text-xs">Demo</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(248,250,252,0.4)' }}>
                    <span className="flex items-center gap-1"><Clock size={10} /> {item.executionTime}ms</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)' }}
                    onClick={() => setExpanded(isExpanded ? null : item._id)}>
                    {isExpanded ? 'Hide' : 'View'}
                  </button>
                  <button className="p-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(255,68,68,0.1)', color: '#ff6b6b' }}
                    onClick={() => handleDelete(item._id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-xs font-medium mb-1" style={{ color: 'rgba(248,250,252,0.4)' }}>INPUT</div>
                      <div className="json-output text-xs">{JSON.stringify(item.input, null, 2)}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium mb-1" style={{ color: 'rgba(248,250,252,0.4)' }}>OUTPUT</div>
                      <div className="json-output text-xs">{JSON.stringify(item.output, null, 2)}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
