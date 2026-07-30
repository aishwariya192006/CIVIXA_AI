import { useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Clock, Copy, Download, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { agentAPI } from '../services/api'

interface Props {
  agentId: number
  title: string
  subtitle: string
  description: string
  color: string
  icon: React.ElementType
  children: (formData: Record<string, string>, setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>) => ReactNode
  buildPayload: (formData: Record<string, string>) => unknown
  defaultValues: Record<string, string>
  resultRenderer?: (result: Record<string, unknown>) => ReactNode
  buttonText?: string
}

const API_MAP: Record<number, (d: unknown) => Promise<{ data: unknown }>> = {
  1: agentAPI.understand, 2: agentAPI.duplicate, 3: agentAPI.route,
  4: agentAPI.priority, 5: agentAPI.assign, 6: agentAPI.verify,
}

export default function AgentPageWrapper({ agentId, title, subtitle, description, color, icon: Icon, children, buildPayload, defaultValues, resultRenderer, buttonText }: Props) {
  const [formData, setFormData] = useState<Record<string, string>>(defaultValues)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [execTime, setExecTime] = useState(0)
  const [history, setHistory] = useState<{ input: Record<string, string>; output: Record<string, unknown>; time: number }[]>([])

  const run = async () => {
    setLoading(true)
    setResult(null)
    const start = Date.now()
    try {
      const payload = buildPayload(formData)
      const res = await API_MAP[agentId](payload) as { data: { output: Record<string, unknown>; executionTime: number } }
      const output = res.data.output || res.data as unknown as Record<string, unknown>
      const t = res.data.executionTime || (Date.now() - start)
      setResult(output)
      setExecTime(t)
      setHistory(h => [{ input: { ...formData }, output, time: t }, ...h.slice(0, 4)])
      toast.success('Agent completed successfully!')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string }
      toast.error(e.response?.data?.error || e.message || 'Agent error')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setFormData(defaultValues); setResult(null) }

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
    toast.success('Copied to clipboard!')
  }

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `agent${agentId}_result.json`
    a.click()
    toast.success('Downloaded!')
  }

  const getPriorityColor = (v: string) => {
    const val = (v || '').toLowerCase()
    if (val === 'critical') return '#ff4444'
    if (val === 'high') return '#FF8C32'
    if (val === 'medium') return '#FFC857'
    return '#00C853'
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div className="mb-8 flex flex-col items-start gap-3 pb-8 border-b border-[rgba(255,255,255,0.05)]" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2">
          <span className="badge badge-cyan text-xs">Agent {agentId}</span>
        </div>
        <h1 className="text-[32px] font-bold leading-tight" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>{title}</h1>
        {description && <p className="text-[16px] leading-relaxed max-w-3xl mt-1" style={{ color: 'rgba(248,250,252,0.5)' }}>{description}</p>}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Input Panel */}
        <motion.div className="glass-card flex flex-col lg:col-span-6 h-full" style={{ padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-bold text-base mb-6 flex items-center gap-2" style={{ color: '#F8FAFC', fontFamily: 'Space Grotesk' }}>
            <span style={{ color }}>◆</span> Input Configuration
          </h2>
          <div className="space-y-6">
            {children(formData, setFormData)}
          </div>
          <div className="flex gap-4 mt-8 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <button
              onClick={run}
              disabled={loading}
              className="flex-1 h-[52px] rounded-[12px] font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all relative overflow-hidden group disabled:opacity-70"
              style={{
                background: loading ? 'rgba(0,212,255,0.1)' : `linear-gradient(135deg, ${color}, ${color}CC)`,
                color: loading ? 'rgba(248,250,252,0.4)' : '#071B2E',
                border: loading ? '1px solid rgba(0,212,255,0.2)' : 'none',
                boxShadow: loading ? 'none' : `0 4px 20px ${color}40`,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {!loading && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                     style={{ background: `linear-gradient(135deg, #fff2, transparent)` }} />
              )}
              {loading ? <><div className="loading-dots"><span /><span /><span /></div> Processing...</> : <><Zap size={18} /> {buttonText || 'Run AI Agent'}</>}
            </button>
            <button onClick={reset} className="px-8 w-[140px] h-[52px] rounded-[12px] text-[15px] font-bold transition-all hover:bg-white/5 hover:border-white/20"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(248,250,252,0.7)' }}>
              Reset
            </button>
          </div>
        </motion.div>

        {/* Output Panel */}
        <motion.div className="glass-card flex flex-col lg:col-span-6 h-full" style={{ padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-6 shrink-0 pb-4 border-b border-[rgba(255,255,255,0.05)]">
            <h2 className="font-bold text-base flex items-center gap-2" style={{ color: '#F8FAFC', fontFamily: 'Space Grotesk' }}>
              <span style={{ color: '#00C853' }}>◆</span> Agent Results
            </h2>
            {result && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(248,250,252,0.4)' }}>
                  <Clock size={12} /> {execTime}ms
                </div>
                <button onClick={copyJSON} className="p-1.5 rounded-lg transition-all" style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}>
                  <Copy size={14} />
                </button>
                <button onClick={downloadJSON} className="p-1.5 rounded-lg transition-all" style={{ background: 'rgba(0,200,83,0.1)', color: '#00C853' }}>
                  <Download size={14} />
                </button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="orb" style={{ width: 60, height: 60 }} />
                <div className="text-sm font-medium" style={{ color: '#00D4FF' }}>AI Agent Processing...</div>
                <div className="loading-dots"><span /><span /><span /></div>
              </motion.div>
            )}

            {!loading && !result && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 gap-4 flex-1">
                <div className="w-20 h-20 rounded-[20px] flex items-center justify-center relative group" style={{ background: `${color}05`, border: `1px dashed ${color}30` }}>
                  <Icon size={36} style={{ color: `${color}50` }} className="transition-transform group-hover:scale-110 duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071B2E] to-transparent opacity-50 rounded-[20px]" />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h3 className="font-semibold text-[15px]" style={{ color: '#F8FAFC' }}>Awaiting Input</h3>
                  <p className="text-[13px] max-w-[240px]" style={{ color: 'rgba(248,250,252,0.4)' }}>Configure the parameters on the left and run the agent to see AI analysis.</p>
                </div>
              </motion.div>
            )}

            {!loading && result && (
              <motion.div key="result" className="flex flex-col flex-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* Success badge */}
                <div className="flex items-center gap-2.5 mb-6 p-3 rounded-[10px]" style={{ background: 'linear-gradient(90deg, rgba(0,200,83,0.15) 0%, rgba(0,200,83,0.05) 100%)', borderLeft: '4px solid #00C853', borderRight: '1px solid rgba(0,200,83,0.2)', borderTop: '1px solid rgba(0,200,83,0.2)', borderBottom: '1px solid rgba(0,200,83,0.2)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#00C853]/20">
                    <CheckCircle size={14} style={{ color: '#00C853' }} />
                  </div>
                  <span className="text-[13px] font-semibold tracking-wide" style={{ color: '#00C853' }}>Agent Completed Successfully</span>
                  {(result as Record<string, unknown>)._mock && <span className="text-[11px] font-bold uppercase tracking-wider ml-auto px-2 py-1 rounded-md" style={{ background: 'rgba(255,200,87,0.1)', color: '#FFC857' }}>Demo Mode</span>}
                </div>

                {/* Custom renderer or default grid */}
                {resultRenderer ? resultRenderer(result) : (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {Object.entries(result).filter(([k]) => !k.startsWith('_')).map(([key, val]) => {
                      if (typeof val === 'object' && !Array.isArray(val)) return null
                      const isPriority = ['priority', 'risk', 'severity', 'decision'].includes(key)
                      const isScore = key.includes('score') || key.includes('confidence') || key.includes('similarity')
                      const displayVal = Array.isArray(val) ? (val as string[]).join(', ') : String(val)
                      const valColor = isPriority ? getPriorityColor(displayVal) : isScore ? '#FFC857' : color
                      return (
                        <div key={key} className="p-4 rounded-xl flex flex-col gap-1.5" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
                          <div className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: '#8b95a5' }}>{key.replace(/_/g, ' ')}</div>
                          <div className="text-sm font-semibold" style={{ color: valColor }}>{displayVal}</div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* JSON Output Removed */}

                {/* Agent Metadata Footer Removed */}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* History */}
        {history.length > 0 && (
          <motion.div className="lg:col-span-12 glass-card p-8 rounded-[16px]" style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-bold text-[15px] mb-6 flex items-center gap-2" style={{ color: '#F8FAFC', fontFamily: 'Space Grotesk' }}>
              Recent Results <span className="badge badge-cyan">{history.length}</span>
            </h3>
            <div className="flex flex-col gap-3">
              {history.map((h, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:bg-white/5 hover:border-white/20"
                style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.08)' }}
                onClick={() => { setResult(h.output); setExecTime(h.time) }}>
                <CheckCircle size={14} style={{ color: '#00C853' }} />
                <div className="flex-1 text-xs" style={{ color: 'rgba(248,250,252,0.6)' }}>
                  {Object.values(h.input).filter(Boolean)[0]?.toString().substring(0, 60)}...
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium" style={{ color: 'rgba(248,250,252,0.4)' }}>{h.time}ms</span>
                  <button onClick={e => { e.stopPropagation(); setHistory(prev => prev.filter((_, j) => j !== i)) }}
                    className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(255,68,68,0.1)]" style={{ color: 'rgba(255,68,68,0.5)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
          ))}
          </div>
        </motion.div>
      )}
      </div>
    </div>
  )
}

// Reusable form field components
export function FormField({ label, icon: FieldIcon, children }: { label: string; icon?: React.ElementType; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-[13px] font-semibold tracking-wide uppercase" style={{ color: 'rgba(248,250,252,0.5)' }}>
        {FieldIcon && <FieldIcon size={14} style={{ color: 'rgba(248,250,252,0.4)' }} />}
        {label}
      </label>
      {children}
    </div>
  )
}

export function FormInput({ value, onChange, placeholder, icon: InputIcon }: { value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ElementType }) {
  return (
    <div className="relative flex items-center">
      {InputIcon && <InputIcon size={18} className="absolute left-4" style={{ color: 'rgba(248,250,252,0.4)' }} />}
      <input type="text" className="w-full pr-4 h-[52px] text-[15px] font-medium rounded-[12px] transition-all" 
        style={{ paddingLeft: InputIcon ? '48px' : '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC' }}
        placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} 
        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
      />
    </div>
  )
}

export function FormTextarea({ value, onChange, placeholder, rows = 4, icon: InputIcon }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; icon?: React.ElementType }) {
  return (
    <div className="relative">
      {InputIcon && <InputIcon size={18} className="absolute left-4 top-4" style={{ color: 'rgba(248,250,252,0.4)' }} />}
      <textarea rows={rows} className="w-full pr-4 py-3.5 text-[15px] font-medium rounded-[12px] resize-none transition-all leading-relaxed" 
        style={{ paddingLeft: InputIcon ? '48px' : '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC' }}
        placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} 
        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
      />
    </div>
  )
}

export function FormSelect({ value, onChange, options, icon: InputIcon }: { value: string; onChange: (v: string) => void; options: string[]; icon?: React.ElementType }) {
  return (
    <div className="relative flex items-center">
      {InputIcon && <InputIcon size={18} className="absolute left-4 z-10" style={{ color: 'rgba(248,250,252,0.4)' }} />}
      <select className="w-full pr-4 h-[52px] text-[15px] font-medium rounded-[12px] transition-all appearance-none cursor-pointer relative z-0" 
        style={{ paddingLeft: InputIcon ? '48px' : '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC' }}
        value={value} onChange={e => onChange(e.target.value)}
        onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}>
        {options.map(o => <option key={o} value={o} style={{ background: '#071B2E' }}>{o}</option>)}
      </select>
    </div>
  )
}

export function ResultCard({ label, value, color = '#00D4FF', large = false }: { label: string; value: string; color?: string; large?: boolean }) {
  return (
    <div className="p-5 rounded-[12px] flex flex-col gap-2 h-full" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
      <div className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: '#8b95a5' }}>{label}</div>
      <div className={`font-semibold ${large ? 'text-2xl' : 'text-[15px]'} break-words leading-tight`} style={{ color }}>{value}</div>
    </div>
  )
}

export function AlertBox({ message, type = 'info' }: { message: string; type?: 'info' | 'warning' | 'error' | 'success' }) {
  const colors = { info: '#00D4FF', warning: '#FFC857', error: '#ff4444', success: '#00C853' }
  const c = colors[type]
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl text-sm" style={{ background: `${c}10`, border: `1px solid ${c}30`, color: c }}>
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      {message}
    </div>
  )
}
