import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, FileText, Mic, Image, Video, MapPin, CheckCircle, AlertTriangle, User, Building2, ArrowRight } from 'lucide-react'
import axios from 'axios'

const API = 'http://localhost:5000'

const INPUT_TYPES = [
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'voice', label: 'Voice Transcript', icon: Mic },
  { value: 'image', label: 'Image Description', icon: Image },
  { value: 'video', label: 'Video Description', icon: Video },
]

const PLACEHOLDERS: Record<string, string> = {
  text: 'Describe your civic issue in detail. e.g. There is a large pothole on MG Road near the bus stop causing accidents...',
  voice: 'Paste voice transcript here. e.g. "I am calling to report a broken street light near my house on Anna Nagar main road..."',
  image: 'Describe what you see in the image. e.g. The image shows a burst water pipe on the footpath with water gushing out...',
  video: 'Describe what the video shows. e.g. The video shows garbage piled up near the park entrance for over a week...',
}

type PipelineStep = {
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
  result?: Record<string, unknown>
}

export default function ComplaintPage() {
  const [inputType, setInputType] = useState('text')
  const [content, setContent] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [finalResult, setFinalResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [steps, setSteps] = useState<PipelineStep[]>([
    { label: 'Understanding Complaint', status: 'pending' },
    { label: 'Checking Duplicates', status: 'pending' },
    { label: 'Routing to Department', status: 'pending' },
    { label: 'Assessing Priority', status: 'pending' },
    { label: 'Assigning Officer', status: 'pending' },
  ])

  const updateStep = (index: number, status: PipelineStep['status'], result?: Record<string, unknown>) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, status, result } : s))
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)
    setError('')
    setFinalResult(null)
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending', result: undefined })))

    try {
      // Step 1
      updateStep(0, 'running')
      await new Promise(r => setTimeout(r, 300))
      const res = await axios.post(`${API}/api/complaints`, { input_type: inputType, content, location })
      updateStep(0, 'done')

      if (res.data.status === 'duplicate') {
        updateStep(1, 'done', res.data.duplicate_info)
        setFinalResult({ status: 'duplicate', ...res.data })
        setLoading(false)
        return
      }

      updateStep(1, 'done')
      updateStep(2, 'done', res.data.complaint?.routing)
      updateStep(3, 'done', res.data.complaint?.priority_details)
      updateStep(4, 'done', res.data.complaint?.assignment)
      setFinalResult(res.data.complaint)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string }
      setError(e.response?.data?.error || e.message || 'Failed to process complaint')
      setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'error' } : s))
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (p: string) => {
    if (!p) return '#00D4FF'
    const v = p.toLowerCase()
    if (v === 'critical') return '#ff4444'
    if (v === 'high') return '#FF8C32'
    if (v === 'medium') return '#FFC857'
    return '#00C853'
  }

  const stepIcon = (status: PipelineStep['status']) => {
    if (status === 'done') return <CheckCircle size={16} style={{ color: '#00C853' }} />
    if (status === 'running') return <div className="loading-dots"><span /><span /><span /></div>
    if (status === 'error') return <AlertTriangle size={16} style={{ color: '#ff4444' }} />
    return <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(0,212,255,0.3)' }} />
  }

  return (
    <div className="relative z-10 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="badge badge-saffron mx-auto mb-4 inline-flex">
            <Zap size={12} /> Full AI Pipeline
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk' }}>
            <span style={{ color: '#F8FAFC' }}>File a </span>
            <span className="text-gradient-saffron">Complaint</span>
          </h1>
          <p style={{ color: 'rgba(248,250,252,0.5)' }}>
            All 6 AI agents process your complaint automatically in real-time
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form - 3 cols */}
          <motion.div
            className="lg:col-span-3 glass-card p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-bold text-lg mb-5" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>
              Complaint Details
            </h2>

            {/* Input Type */}
            <div className="mb-5">
              <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(248,250,252,0.6)' }}>
                Input Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {INPUT_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setInputType(t.value)}
                    className="py-2 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all"
                    style={{
                      background: inputType === t.value ? 'rgba(255,140,50,0.2)' : 'rgba(9,28,47,0.8)',
                      border: `1px solid ${inputType === t.value ? 'rgba(255,140,50,0.5)' : 'rgba(0,212,255,0.15)'}`,
                      color: inputType === t.value ? '#FF8C32' : 'rgba(248,250,252,0.6)'
                    }}
                  >
                    <t.icon size={16} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(248,250,252,0.6)' }}>
                Complaint Content *
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 text-sm resize-none"
                placeholder={PLACEHOLDERS[inputType]}
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(248,250,252,0.6)' }}>
                <MapPin size={12} className="inline mr-1" />Location (optional)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 text-sm"
                placeholder="e.g. MG Road, Bangalore, Karnataka"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>

            <button
              className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2"
              style={{
                background: loading || !content.trim() ? 'rgba(255,140,50,0.2)' : 'linear-gradient(135deg, #FF8C32, #FF6B00)',
                color: loading || !content.trim() ? 'rgba(248,250,252,0.4)' : '#fff',
                cursor: loading || !content.trim() ? 'not-allowed' : 'pointer',
                border: '1px solid rgba(255,140,50,0.3)',
                transition: 'all 0.3s'
              }}
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
            >
              {loading ? (
                <><div className="loading-dots"><span /><span /><span /></div> Processing...</>
              ) : (
                <><Zap size={18} /> Submit to AI Pipeline</>
              )}
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 rounded-xl text-sm"
                style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff6b6b' }}
              >
                ⚠️ {error}
              </motion.div>
            )}
          </motion.div>

          {/* Pipeline Status - 2 cols */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Pipeline Steps */}
            <div className="glass-card p-5">
              <h3 className="font-bold mb-4 text-sm" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>
                AI Pipeline Status
              </h3>
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0">{stepIcon(step.status)}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{
                        color: step.status === 'done' ? '#00C853' : step.status === 'running' ? '#00D4FF' : step.status === 'error' ? '#ff4444' : 'rgba(248,250,252,0.5)'
                      }}>
                        Agent {i + 1}: {step.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Examples */}
            <div className="glass-card p-5">
              <h3 className="font-bold mb-3 text-sm" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>
                Quick Examples
              </h3>
              <div className="space-y-2">
                {[
                  'Large pothole on MG Road causing accidents near bus stop',
                  'Street light not working for 3 days near school',
                  'Garbage not collected for a week in our area',
                  'Water pipe burst flooding the main road',
                  'Electric wire fallen on road after storm - dangerous',
                ].map((ex, i) => (
                  <button
                    key={i}
                    className="w-full text-left text-xs p-2 rounded-lg transition-all flex items-start gap-2"
                    style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)', color: 'rgba(248,250,252,0.6)' }}
                    onClick={() => setContent(ex)}
                  >
                    <ArrowRight size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#00D4FF' }} />
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {finalResult && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8"
            >
              {(finalResult as Record<string, unknown>).status === 'duplicate' ? (
                <div className="glass-card p-6" style={{ borderColor: 'rgba(255,200,87,0.4)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle size={24} style={{ color: '#FFC857' }} />
                    <h3 className="font-bold text-lg" style={{ color: '#FFC857', fontFamily: 'Space Grotesk' }}>
                      Duplicate Complaint Detected
                    </h3>
                  </div>
                  <p className="text-sm mb-4" style={{ color: 'rgba(248,250,252,0.6)' }}>
                    This complaint is similar to an existing one. It will be merged to avoid duplicate work.
                  </p>
                  <div className="json-output text-xs">{JSON.stringify(finalResult, null, 2)}</div>
                </div>
              ) : (
                <div className="glass-card p-6" style={{ borderColor: 'rgba(0,200,83,0.4)' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle size={24} style={{ color: '#00C853' }} />
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: '#00C853', fontFamily: 'Space Grotesk' }}>
                        Complaint Processed Successfully
                      </h3>
                      <p className="text-sm" style={{ color: 'rgba(248,250,252,0.5)' }}>
                        ID: {String(finalResult.id || 'N/A')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {([
                      { label: 'Department', value: String(finalResult.department || ''), Icon: Building2, color: '#00D4FF' },
                      { label: 'Priority', value: String(finalResult.priority || ''), Icon: AlertTriangle, color: getPriorityColor(String(finalResult.priority || '')) },
                      { label: 'Severity', value: String(finalResult.severity || ''), Icon: Zap, color: '#FF8C32' },
                      { label: 'Assigned To', value: String(finalResult.assigned_officer || ''), Icon: User, color: '#00C853' },
                    ] as { label: string; value: string; Icon: React.ElementType; color: string }[]).map((item, i) => (
                      <div key={i} className="p-4 rounded-xl" style={{ background: `${item.color}10`, border: `1px solid ${item.color}30` }}>
                        <item.Icon size={18} style={{ color: item.color, marginBottom: 8 }} />
                        <div className="text-xs mb-1" style={{ color: 'rgba(248,250,252,0.4)' }}>{item.label}</div>
                        <div className="font-bold text-sm" style={{ color: item.color }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {finalResult.complaint_summary ? (
                    <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                      <div className="text-xs mb-1" style={{ color: 'rgba(248,250,252,0.4)' }}>AI SUMMARY</div>
                      <p className="text-sm" style={{ color: '#F8FAFC' }}>{String(finalResult.complaint_summary)}</p>
                    </div>
                  ) : null}

                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium" style={{ color: '#00D4FF' }}>
                      View Full JSON Response
                    </summary>
                    <div className="json-output text-xs mt-3">{JSON.stringify(finalResult, null, 2)}</div>
                  </details>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
