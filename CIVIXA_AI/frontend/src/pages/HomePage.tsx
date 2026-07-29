import { motion } from 'framer-motion'
import { Zap, Shield, BarChart3, Users, CheckCircle, ArrowRight, Brain, Route, AlertTriangle, UserCheck, RefreshCw, Search } from 'lucide-react'

type Page = 'home' | 'agents' | 'complaint' | 'dashboard'

interface HomePageProps {
  setCurrentPage: (page: Page) => void
}

const features = [
  { icon: Brain, title: 'AI Complaint Understanding', desc: 'Understands text, voice, images & videos using LLM reasoning', color: '#00D4FF' },
  { icon: Search, title: 'Duplicate Detection', desc: 'Semantic embeddings detect & merge duplicate complaints', color: '#FF8C32' },
  { icon: Route, title: 'Smart Department Routing', desc: 'Auto-routes to correct government department with reasoning', color: '#00C853' },
  { icon: AlertTriangle, title: 'Priority Assessment', desc: 'AI calculates urgency based on safety, impact & risk', color: '#FFC857' },
  { icon: UserCheck, title: 'Officer Assignment', desc: 'Assigns best officer by expertise, workload & proximity', color: '#00D4FF' },
  { icon: CheckCircle, title: 'Resolution Verification', desc: 'Verifies genuine resolution before closing complaints', color: '#00C853' },
]

const workflow = [
  { step: '01', label: 'Citizen Reports', icon: Users },
  { step: '02', label: 'AI Understands', icon: Brain },
  { step: '03', label: 'Routes to Dept', icon: Route },
  { step: '04', label: 'Prioritizes', icon: AlertTriangle },
  { step: '05', label: 'Assigns Officer', icon: UserCheck },
  { step: '06', label: 'Monitors', icon: RefreshCw },
  { step: '07', label: 'Verifies', icon: CheckCircle },
  { step: '08', label: 'Resolved', icon: Shield },
]

const stats = [
  { label: 'Faster Resolution', value: '10x', color: '#FF8C32' },
  { label: 'AI Accuracy', value: '97%', color: '#00D4FF' },
  { label: 'Departments', value: '10+', color: '#00C853' },
  { label: 'AI Agents', value: '6', color: '#FFC857' },
]

export default function HomePage({ setCurrentPage }: HomePageProps) {
  return (
    <div className="relative z-10 pt-24 pb-16 px-4">
      {/* Hero */}
      <div className="max-w-6xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="badge badge-cyan mx-auto mb-6 inline-flex">
            <span className="status-dot status-online" />
            AI System Online • 6 Agents Active
          </div>
        </motion.div>

        <motion.div
          className="orb mx-auto mb-8"
          style={{ width: 120, height: 120 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          whileHover={{ scale: 1.1 }}
        />

        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-4 leading-tight"
          style={{ fontFamily: 'Space Grotesk' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-gradient-saffron">Civixa</span>{' '}
          <span style={{ color: '#F8FAFC' }}>AI</span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl mb-3 font-light"
          style={{ color: 'rgba(0,212,255,0.9)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          AI-Powered Multi-Agent Public Grievance Resolution Platform
        </motion.p>

        <motion.p
          className="text-base mb-10 max-w-2xl mx-auto"
          style={{ color: 'rgba(248,250,252,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Building Smarter Governance with AI — Transforming civic complaints into resolved actions through autonomous AI agents
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button className="btn-primary px-8 py-4 text-base flex items-center gap-2" onClick={() => setCurrentPage('complaint')}>
            <Zap size={18} /> File a Complaint
          </button>
          <button className="btn-cyan px-8 py-4 text-base flex items-center gap-2" onClick={() => setCurrentPage('agents')}>
            <Brain size={18} /> Explore AI Agents
          </button>
          <button
            className="px-8 py-4 text-base flex items-center gap-2 rounded-xl font-semibold"
            style={{ border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF', background: 'rgba(0,212,255,0.05)' }}
            onClick={() => setCurrentPage('dashboard')}
          >
            <BarChart3 size={18} /> View Dashboard <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        className="max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-6 text-center">
            <div className="text-4xl font-bold mb-1" style={{ color: s.color, fontFamily: 'Space Grotesk' }}>{s.value}</div>
            <div className="text-sm" style={{ color: 'rgba(248,250,252,0.6)' }}>{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* AI Workflow */}
      <div className="max-w-6xl mx-auto mt-20">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gradient-cyan mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            AI Workflow Pipeline
          </h2>
          <p style={{ color: 'rgba(248,250,252,0.5)' }}>Every complaint goes through 8 autonomous AI stages</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3">
          {workflow.map((w, i) => (
            <motion.div
              key={i}
              className="glass-card p-4 text-center flex flex-col items-center gap-2"
              style={{ minWidth: 100 }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xs font-bold" style={{ color: 'rgba(0,212,255,0.5)' }}>{w.step}</div>
              <w.icon size={24} style={{ color: '#00D4FF' }} />
              <div className="text-xs font-medium" style={{ color: '#F8FAFC' }}>{w.label}</div>
              {i < workflow.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2">
                  <ArrowRight size={12} style={{ color: 'rgba(0,212,255,0.4)' }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto mt-20">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>
            6 Autonomous <span className="text-gradient-saffron">AI Agents</span>
          </h2>
          <p style={{ color: 'rgba(248,250,252,0.5)' }}>Each agent works independently and as part of the multi-agent pipeline</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="glass-card p-6 cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => setCurrentPage('agents')}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}20`, border: `1px solid ${f.color}40` }}
              >
                <f.icon size={24} style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#F8FAFC', fontFamily: 'Space Grotesk' }}>{f.title}</h3>
              <p className="text-sm" style={{ color: 'rgba(248,250,252,0.6)' }}>{f.desc}</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: f.color }}>
                Try Agent <ArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        className="max-w-3xl mx-auto mt-20 glass-card p-10 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="orb mx-auto mb-6" style={{ width: 60, height: 60 }} />
        <h2 className="text-3xl font-bold mb-3 text-gradient-saffron" style={{ fontFamily: 'Space Grotesk' }}>
          Ready to Transform Governance?
        </h2>
        <p className="mb-6" style={{ color: 'rgba(248,250,252,0.6)' }}>
          Experience the future of civic complaint resolution powered by autonomous AI agents
        </p>
        <button className="btn-primary px-10 py-4 text-base" onClick={() => setCurrentPage('complaint')}>
          Start Now — It's Free
        </button>
      </motion.div>
    </div>
  )
}
