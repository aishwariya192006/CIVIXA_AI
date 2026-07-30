import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Search, Route, AlertTriangle, UserCheck, CheckCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:5000'

type Field =
  | { key: string; label: string; type: 'select'; options: string[] }
  | { key: string; label: string; type: 'textarea'; placeholder: string }
  | { key: string; label: string; type: 'text'; placeholder: string }

interface Agent {
  id: number
  icon: React.ElementType
  title: string
  subtitle: string
  color: string
  endpoint: string
  port: number
  fields: Field[]
  defaultValues: Record<string, string>
}

const AGENTS: Agent[] = [
  {
    id: 1,
    icon: Brain,
    title: 'Complaint Understanding Agent',
    subtitle: 'Understands text, voice, image & video complaints using LLM',
    color: '#00D4FF',
    endpoint: '/api/agents/understanding',
    port: 8001,
    fields: [
      { key: 'input_type', label: 'Input Type', type: 'select', options: ['text', 'voice', 'image', 'video'] },
      { key: 'content', label: 'Complaint Content', type: 'textarea', placeholder: 'e.g. There is a huge pothole on MG Road near the bus stop...' },
      { key: 'location', label: 'Location (optional)', type: 'text', placeholder: 'e.g. MG Road, Bangalore' },
    ],
    defaultValues: {
      input_type: 'text',
      content: 'There is a massive pothole on MG Road near the bus stop causing accidents. Water is also leaking from a broken pipe nearby flooding the road.',
      location: 'MG Road, Bangalore'
    }
  },
  {
    id: 2,
    icon: Search,
    title: 'Duplicate Detection Agent',
    subtitle: 'Detects duplicate complaints using semantic embeddings',
    color: '#FF8C32',
    endpoint: '/api/agents/duplicate',
    port: 8002,
    fields: [
      { key: 'new_summary', label: 'New Complaint Summary', type: 'textarea', placeholder: 'e.g. Broken water pipe on MG Road causing flooding' },
      { key: 'new_location', label: 'New Complaint Location', type: 'text', placeholder: 'e.g. MG Road, Bangalore' },
    ],
    defaultValues: {
      new_summary: 'Water pipe burst on MG Road near bus stop, water flooding the street',
      new_location: 'MG Road, Bangalore'
    }
  },
  {
    id: 3,
    icon: Route,
    title: 'Department Routing Agent',
    subtitle: 'Routes complaints to the correct government department',
    color: '#00C853',
    endpoint: '/api/agents/routing',
    port: 8003,
    fields: [
      { key: 'complaint_summary', label: 'Complaint Summary', type: 'textarea', placeholder: 'e.g. Street light not working for 3 days near school' },
      { key: 'issue_type', label: 'Issue Type', type: 'text', placeholder: 'e.g. Street light failure' },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Anna Nagar, Chennai' },
    ],
    defaultValues: {
      complaint_summary: 'Street light not working for 3 days near the school on Anna Nagar main road causing safety issues at night',
      issue_type: 'Street light failure',
      location: 'Anna Nagar, Chennai'
    }
  },
  {
    id: 4,
    icon: AlertTriangle,
    title: 'Priority Assessment Agent',
    subtitle: 'Calculates complaint priority based on severity and public impact',
    color: '#FFC857',
    endpoint: '/api/agents/priority',
    port: 8004,
    fields: [
      { key: 'complaint_summary', label: 'Complaint Summary', type: 'textarea', placeholder: 'e.g. Electric wire fallen on road after storm' },
      { key: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Electricity' },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Sector 15, Delhi' },
      { key: 'severity', label: 'Initial Severity', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
    ],
    defaultValues: {
      complaint_summary: 'High voltage electric wire has fallen on the main road after last night storm. Children are passing by and it is extremely dangerous.',
      department: 'Electricity',
      location: 'Sector 15, Delhi',
      severity: 'Critical'
    }
  },
  {
    id: 5,
    icon: UserCheck,
    title: 'Officer Assignment Agent',
    subtitle: 'Assigns the most suitable officer based on expertise and workload',
    color: '#A78BFA',
    endpoint: '/api/agents/assignment',
    port: 8005,
    fields: [
      { key: 'complaint_summary', label: 'Complaint Summary', type: 'textarea', placeholder: 'e.g. Sewage overflow near residential area' },
      { key: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Sanitation' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
      { key: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Koramangala, Bangalore' },
    ],
    defaultValues: {
      complaint_summary: 'Sewage overflow near residential area causing health hazard and foul smell',
      department: 'Sanitation',
      priority: 'High',
      location: 'Koramangala, Bangalore'
    }
  },
  {
    id: 6,
    icon: CheckCircle,
    title: 'Resolution Verification Agent',
    subtitle: 'Verifies genuine resolution before closing complaints',
    color: '#00C853',
    endpoint: '/api/agents/verification',
    port: 8006,
    fields: [
      { key: 'original_complaint', label: 'Original Complaint', type: 'textarea', placeholder: 'e.g. Pothole on main road causing accidents' },
      { key: 'resolution_note', label: 'Officer Resolution Note', type: 'textarea', placeholder: 'e.g. Pothole filled with asphalt and road surface leveled' },
      { key: 'proof_description', label: 'Proof Description (image/video)', type: 'textarea', placeholder: 'e.g. Photo shows smooth road surface with fresh asphalt patch' },
      { key: 'citizen_confirmation', label: 'Citizen Feedback', type: 'text', placeholder: 'e.g. Yes the pothole is fixed, road is smooth now' },
    ],
    defaultValues: {
      original_complaint: 'Large pothole on MG Road causing accidents and vehicle damage',
      resolution_note: 'Pothole has been filled with hot mix asphalt and road surface has been leveled and compacted',
      proof_description: 'Before and after photos show the pothole completely filled. Road surface is now smooth and level.',
      citizen_confirmation: 'Yes the pothole is fixed now, road is smooth'
    }
  }
]

function AgentCard({ agent }: { agent: Agent }) {
  const [formData, setFormData] = useState<Record<string, string>>({ ...agent.defaultValues })
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      let payload: Record<string, unknown> = { ...formData }

      if (agent.id === 2) {
        payload = {
          new_complaint: {
            id: 'new-001',
            summary: formData.new_summary,
            location: formData.new_location,
            department: 'Water Supply'
          },
          existing_complaints: [
            { id: 'ex-001', summary: 'Broken water pipe on MG Road flooding the street', location: 'MG Road, Bangalore', department: 'Water Supply' },
            { id: 'ex-002', summary: 'Garbage not collected in Koramangala for 5 days', location: 'Koramangala, Bangalore', department: 'Waste Management' },
            { id: 'ex-003', summary: 'Street light not working near school', location: 'Anna Nagar, Chennai', department: 'Street Lighting' },
          ]
        }
      }

      if (agent.id === 5) {
        payload.officers = [
          { id: 'SN001', name: 'Deepak Verma', department: formData.department, expertise: ['sewage', 'drain cleaning', 'sanitation'], current_workload: 2, location: 'Zone A', availability: 'Available', past_performance_score: 0.88 },
          { id: 'SN002', name: 'Priya Nair', department: formData.department, expertise: ['waste management', 'public health'], current_workload: 5, location: 'Zone B', availability: 'Busy', past_performance_score: 0.75 },
          { id: 'SN003', name: 'Ramesh Kumar', department: formData.department, expertise: ['sanitation', 'drain repair', 'sewage overflow'], current_workload: 1, location: 'Zone C', availability: 'Available', past_performance_score: 0.92 },
        ]
      }

      const res = await axios.post(`${API}${agent.endpoint}`, payload)
      setResult(res.data)
      setExpanded(true)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string }
      setError(e.response?.data?.error || e.message || 'Agent offline or error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (val: string) => {
    const v = (val || '').toLowerCase()
    if (v === 'critical') return '#ff4444'
    if (v === 'high') return '#FF8C32'
    if (v === 'medium') return '#FFC857'
    return '#00C853'
  }

  const renderField = (field: Field) => {
    if (field.type === 'textarea') {
      return (
        <textarea
          rows={3}
          className="w-full px-3 py-2 text-sm resize-none"
          placeholder={field.placeholder}
          value={formData[field.key] || ''}
          onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
        />
      )
    }
    if (field.type === 'select') {
      return (
        <select
          className="w-full px-3 py-2 text-sm"
          value={formData[field.key] || ''}
          onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
        >
          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }
    return (
      <input
        type="text"
        className="w-full px-3 py-2 text-sm"
        placeholder={field.placeholder}
        value={formData[field.key] || ''}
        onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
      />
    )
  }

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${agent.color}20`, border: `1px solid ${agent.color}40` }}
        >
          <agent.icon size={28} style={{ color: agent.color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-cyan text-xs">Agent {agent.id}</span>
            <span className="status-dot status-online" />
            <span style={{ fontSize: 11, color: '#00C853' }}>Online</span>
          </div>
          <h3 className="font-bold text-lg leading-tight" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>
            {agent.title}
          </h3>
          <p className="text-sm mt-1" style={{ color: 'rgba(248,250,252,0.5)' }}>{agent.subtitle}</p>
          <div className="mt-1 text-xs" style={{ color: 'rgba(0,212,255,0.5)' }}>
            POST :{agent.port}{agent.endpoint.replace('/api/agents', '')}
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3 mb-4">
        {agent.fields.map(field => (
          <div key={field.key}>
            <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(248,250,252,0.6)' }}>
              {field.label}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
        style={{
          background: loading ? 'rgba(0,212,255,0.1)' : `linear-gradient(135deg, ${agent.color}, ${agent.color}99)`,
          color: loading ? 'rgba(248,250,252,0.5)' : '#fff',
          border: `1px solid ${agent.color}40`,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <div className="loading-dots"><span /><span /><span /></div>
          : <><Zap size={16} /> Run Agent</>
        }
      </button>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-3 rounded-xl text-sm"
          style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff6b6b' }}
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <button
              className="w-full flex items-center justify-between py-2 px-3 rounded-lg mb-2 text-sm font-medium"
              style={{ background: 'rgba(0,212,255,0.08)', color: '#00D4FF' }}
              onClick={() => setExpanded(!expanded)}
            >
              <span>✅ Agent Response</span>
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {expanded && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {Object.entries(result).map(([key, val]) => {
                    if (typeof val === 'object') return null
                    const displayVal = String(val)
                    const isScore = key.includes('score') || key.includes('confidence') || key.includes('similarity')
                    const isPriority = key === 'priority' || key === 'risk' || key === 'severity'
                    return (
                      <div key={key} className="p-2 rounded-lg" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
                        <div className="text-xs mb-1" style={{ color: 'rgba(248,250,252,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div
                          className="text-sm font-semibold truncate"
                          style={{ color: isPriority ? getPriorityColor(displayVal) : isScore ? '#FFC857' : agent.color }}
                        >
                          {isScore && !isNaN(Number(displayVal))
                            ? `${typeof val === 'number' && val <= 1 ? Math.round(Number(val) * 100) : displayVal}${key.includes('confidence') && Number(val) <= 1 ? '%' : ''}`
                            : displayVal}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="json-output text-xs">
                  {JSON.stringify(result, null, 2)}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function AgentsPage() {
  return (
    <div className="relative z-10 pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="badge badge-cyan mx-auto mb-4 inline-flex">
            <span className="status-dot status-online" />
            6 Agents Active
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk' }}>
            <span className="text-gradient-saffron">AI Agents</span>{' '}
            <span style={{ color: '#F8FAFC' }}>Demo</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(248,250,252,0.5)' }}>
            Each agent works independently. Test them live with pre-filled examples or your own input.
          </p>
          <div className="mt-4 p-3 rounded-xl inline-block" style={{ background: 'rgba(255,200,87,0.1)', border: '1px solid rgba(255,200,87,0.3)' }}>
            <p className="text-sm" style={{ color: '#FFC857' }}>
              💡 Ensure all 6 Python agents are running (ports 8001–8006) and Express backend is on port 5000
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {AGENTS.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        <motion.div
          className="mt-12 glass-card p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold mb-2 text-gradient-cyan" style={{ fontFamily: 'Space Grotesk' }}>
            How Agents Work Together
          </h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(248,250,252,0.5)' }}>
            When you file a complaint, all agents run in sequence automatically
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            {['Citizen Input', '→', 'Agent 1: Understand', '→', 'Agent 2: Dedup', '→', 'Agent 3: Route', '→', 'Agent 4: Priority', '→', 'Agent 5: Assign', '→', 'Agent 6: Verify', '→', '✅ Resolved'].map((step, i) => (
              <div key={i}>
                {step === '→' ? (
                  <span style={{ color: 'rgba(0,212,255,0.4)', fontSize: 18 }}>→</span>
                ) : (
                  <div
                    className="px-3 py-2 rounded-lg text-xs font-medium"
                    style={{
                      background: step.includes('Agent') ? 'rgba(0,212,255,0.1)' : step.includes('✅') ? 'rgba(0,200,83,0.1)' : 'rgba(255,140,50,0.1)',
                      border: `1px solid ${step.includes('Agent') ? 'rgba(0,212,255,0.3)' : step.includes('✅') ? 'rgba(0,200,83,0.3)' : 'rgba(255,140,50,0.3)'}`,
                      color: step.includes('Agent') ? '#00D4FF' : step.includes('✅') ? '#00C853' : '#FF8C32'
                    }}
                  >
                    {step}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
