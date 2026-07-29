import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, Brain, BarChart3, ArrowRight, CheckCircle, Route, AlertTriangle, UserCheck, Search, RefreshCw, Shield, Users } from 'lucide-react'

const features = [
  { icon: Brain, title: 'AI Complaint Understanding', desc: 'Understands text, voice, images & videos using LLM reasoning', color: '#00D4FF' },
  { icon: Search, title: 'Duplicate Detection', desc: 'Semantic embeddings detect & merge duplicate complaints', color: '#FF8C32' },
  { icon: Route, title: 'Smart Department Routing', desc: 'Auto-routes to correct government department with reasoning', color: '#00C853' },
  { icon: AlertTriangle, title: 'Priority Assessment', desc: 'AI calculates urgency based on safety, impact & risk', color: '#FFC857' },
  { icon: UserCheck, title: 'Officer Assignment', desc: 'Assigns best officer by expertise, workload & proximity', color: '#A78BFA' },
  { icon: CheckCircle, title: 'Resolution Verification', desc: 'Verifies genuine resolution before closing complaints', color: '#00C853' },
]

const workflow = [
  { step: '01', label: 'Citizen Reports', icon: Users },
  { step: '02', label: 'AI Understands', icon: Brain },
  { step: '03', label: 'Routes to Dept', icon: Route },
  { step: '04', label: 'Prioritizes', icon: AlertTriangle },
  { step: '05', label: 'Assigns Officer', icon: UserCheck },
  { step: '06', label: 'Monitors', icon: RefreshCw },
  { step: '07', label: 'Verifies', icon: Shield },
  { step: '08', label: 'Resolved', icon: CheckCircle },
]

const stats = [
  { label: 'Faster Resolution', value: '10x', color: '#FF8C32' },
  { label: 'AI Accuracy', value: '97%', color: '#00D4FF' },
  { label: 'Departments', value: '10+', color: '#00C853' },
  { label: 'AI Agents', value: '6', color: '#FFC857' },
]

import { SharedContainer } from '../components/SharedContainer'
import { Spacer } from '../components/Spacer'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="relative z-10 w-full min-h-screen bg-transparent text-[#F8FAFC] overflow-x-hidden flex flex-col">
      
      {/* Navbar: Height 80px, Sticky, Blur */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[80px] w-full flex items-center px-[48px] backdrop-blur-md bg-[#030712]/80 border-b border-[#00D4FF]/10">
        <div className="flex items-center justify-between w-full h-full">
          <div className="flex items-center gap-[12px] cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="orb" style={{ width: 32, height: 32 }} />
            <div>
              <div className="text-gradient-saffron font-bold text-[20px] leading-none" style={{ fontFamily: 'Space Grotesk' }}>Civixa AI</div>
              <div style={{ fontSize: 10, color: 'rgba(0,212,255,0.7)', letterSpacing: '1px', marginTop: '2px', fontWeight: 600 }}>MULTI-AGENT PLATFORM</div>
            </div>
          </div>
          <div className="flex items-center gap-[32px] ml-auto">
            <button className="text-[15px] font-medium text-[#F8FAFC]/70 hover:text-[#00D4FF] transition-colors flex items-center justify-center h-full" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="btn-primary h-[56px] px-[34px] text-[15px] rounded-[10px] shadow-[0_4px_16px_rgba(255,140,50,0.3)] hover:shadow-[0_6px_24px_rgba(255,140,50,0.5)] transition-shadow flex items-center justify-center" onClick={() => navigate('/register')}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content flow using flex-col and exactly sized spacers */}
      <main className="w-full flex flex-col flex-grow items-center">
        
        {/* Navbar -> Hero Spacing */}
        <Spacer h={120} />

        {/* Hero Section */}
        <section className="w-full flex flex-col items-center justify-center">
          <SharedContainer className="flex flex-col items-center text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="mx-auto mb-[32px] inline-flex items-center px-4 py-2 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/10 text-[#00D4FF] text-[13px] font-semibold gap-2 shadow-[0_0_15px_rgba(0,212,255,0.2)] tracking-wide">
                <span className="status-dot status-online w-2 h-2 rounded-full bg-[#00C853]" />
                AI System Online • 6 Agents Active
              </div>
            </motion.div>

            <motion.h1 className="font-bold leading-[1.15] mb-[24px] text-[40px] md:text-[56px] lg:text-[72px] overflow-visible"
              style={{ fontFamily: 'Space Grotesk' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <span className="text-gradient-saffron">Civixa</span>{' '}
              <span className="text-[#F8FAFC]">AI</span>
              <br />
              <span className="bg-gradient-to-r from-[#00D4FF] to-[#00C853] bg-clip-text text-transparent leading-[1.2]">
                Public Grievance Resolution
              </span>
            </motion.h1>

            <motion.p className="text-[17px] leading-[1.7] mb-[48px] max-w-[700px] text-[#F8FAFC]/60 font-light"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              Building Smarter Governance with AI — Transforming civic complaints into resolved actions through a pipeline of autonomous AI agents working in perfect sync.
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row items-center gap-[48px] justify-center w-full sm:w-auto"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <button className="btn-primary h-[56px] px-[34px] py-[18px] text-[16px] flex items-center justify-center gap-[10px] w-full sm:w-auto shadow-[0_8px_24px_rgba(255,140,50,0.3)] hover:scale-[1.02] transition-transform" 
                onClick={() => navigate('/register')}>
                <Zap size={20} /> Get Started Free
              </button>
              <button className="btn-cyan h-[56px] px-[34px] py-[18px] text-[16px] flex items-center justify-center gap-[10px] w-full sm:w-auto shadow-[0_8px_24px_rgba(0,212,255,0.3)] hover:scale-[1.02] transition-transform" 
                onClick={() => navigate('/login')}>
                <Brain size={20} /> Login to Dashboard
              </button>
              <button className="h-[56px] px-[34px] py-[18px] text-[16px] flex items-center justify-center gap-[10px] w-full sm:w-auto rounded-[12px] font-semibold border border-[#00D4FF]/30 text-[#00D4FF] bg-[#00D4FF]/5 hover:bg-[#00D4FF]/10 transition-colors"
                onClick={() => navigate('/dashboard')}>
                <BarChart3 size={20} /> View Dashboard <ArrowRight size={18} />
              </button>
            </motion.div>
          </SharedContainer>
        </section>

        {/* Hero -> Stats Spacing */}
        <Spacer h={60} />

        {/* Stats Section */}
        <section className="w-full flex flex-col items-center">
          <SharedContainer className="flex flex-wrap justify-center items-center gap-[24px]">
            {stats.map((s, i) => (
              <motion.div key={i} className="w-[170px] h-[95px] rounded-[16px] bg-[#091C2F]/60 backdrop-blur-[24px] border border-[#00D4FF]/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center transition-colors hover:border-[#00D4FF]/40"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-[32px] font-bold leading-none mb-[4px]" style={{ color: s.color, fontFamily: 'Space Grotesk' }}>{s.value}</div>
                <div className="text-[14px] text-[#F8FAFC]/60 font-medium tracking-wide">{s.label}</div>
              </motion.div>
            ))}
          </SharedContainer>
        </section>

        {/* Stats -> Workflow Spacing */}
        <Spacer h={90} />

        {/* Workflow Section */}
        <section className="w-full flex flex-col items-center">
          <SharedContainer className="flex flex-col items-center">
            
            <motion.h2 className="text-[36px] md:text-[48px] font-bold text-gradient-cyan leading-[1.2] text-center" style={{ fontFamily: 'Space Grotesk' }}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              AI Workflow Pipeline
            </motion.h2>
            
            <Spacer h={24} />
            
            <motion.p className="text-[17px] text-[#F8FAFC]/60 max-w-[600px] leading-[1.7] text-center"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              Every single complaint flows through an unbreakable pipeline of 8 specialized autonomous AI stages ensuring zero manual bottleneck.
            </motion.p>
            
            <Spacer h={40} />

            <div className="flex flex-wrap justify-center gap-[20px] w-full">
              {workflow.map((w, i) => (
                <motion.div key={i} className="w-[140px] h-[100px] rounded-[16px] bg-[#091C2F]/70 backdrop-blur-[24px] border border-[#00D4FF]/20 shadow-[0_8px_24px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center gap-[8px] cursor-default"
                  initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.05, borderColor: 'rgba(0,212,255,0.5)', boxShadow: '0 8px 32px rgba(0,212,255,0.2)' }}>
                  <div className="flex items-center justify-between w-full px-[16px]">
                    <div className="text-[12px] font-bold text-[#00D4FF]/50 tracking-wider">{w.step}</div>
                    <w.icon size={20} className="text-[#00D4FF]" />
                  </div>
                  <div className="text-[14px] font-semibold text-[#F8FAFC] text-center px-[8px] leading-[1.2]">{w.label}</div>
                </motion.div>
              ))}
            </div>
            
          </SharedContainer>
        </section>

        {/* Workflow -> Agents Spacing */}
        <Spacer h={100} />

        {/* Features / AI Agents Section */}
        <section className="w-full flex flex-col items-center">
          <SharedContainer className="flex flex-col items-center">
            
            <motion.h2 className="text-[36px] md:text-[48px] font-bold leading-[1.2] text-[#F8FAFC] text-center" style={{ fontFamily: 'Space Grotesk' }}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              6 Autonomous <span className="text-gradient-saffron">AI Agents</span>
            </motion.h2>
            
            <Spacer h={24} />
            
            <motion.p className="text-[17px] text-[#F8FAFC]/60 max-w-[700px] leading-[1.7] text-center"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              Each agent acts as a specialized expert, communicating seamlessly to resolve complex civic issues in real-time.
            </motion.p>
            
            <Spacer h={40} />

            <div className="w-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', justifyContent: 'center', alignItems: 'stretch' }}>
              {features.map((f, i) => (
                <motion.div key={i} className="h-[240px] p-[28px] rounded-[20px] bg-[#091C2F]/70 backdrop-blur-[24px] border border-[#00D4FF]/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-col cursor-pointer transition-colors duration-300 group"
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8, borderColor: f.color, boxShadow: `0 12px 40px ${f.color}30` }}
                  onClick={() => navigate('/dashboard')}>
                  <div className="w-[56px] h-[56px] rounded-[14px] flex items-center justify-center mb-[20px] transition-all duration-300 shrink-0"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                    <f.icon size={28} style={{ color: f.color }} />
                  </div>
                  <h3 className="font-bold text-[24px] mb-[12px] text-[#F8FAFC] leading-[1.3] shrink-0" style={{ fontFamily: 'Space Grotesk' }}>{f.title}</h3>
                  <p className="text-[15px] text-[#F8FAFC]/60 leading-[1.6] flex-grow">{f.desc}</p>
                </motion.div>
              ))}
            </div>

          </SharedContainer>
        </section>

        {/* Agents -> CTA Spacing */}
        <Spacer h={120} />

        {/* CTA Section */}
        <section className="w-full flex flex-col items-center">
          <SharedContainer className="flex flex-col items-center">
            <motion.div className="w-full max-w-[900px] rounded-[24px] bg-gradient-to-br from-[#091C2F]/90 to-[#030712]/90 backdrop-blur-[32px] border border-[#FF8C32]/30 shadow-[0_0_60px_rgba(255,140,50,0.15)] p-[48px] md:p-[64px] flex flex-col items-center text-center relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#FF8C32]/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#00D4FF]/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="orb mb-[32px] z-10" style={{ width: 64, height: 64 }} />
              <h2 className="text-[36px] md:text-[48px] font-bold mb-[24px] text-gradient-saffron leading-[1.2] z-10" style={{ fontFamily: 'Space Grotesk' }}>
                Ready to Transform Governance?
              </h2>
              <p className="mb-[40px] text-[17px] text-[#F8FAFC]/70 max-w-[500px] leading-[1.7] z-10">
                Experience the future of civic complaint resolution powered by an unbreakable team of autonomous AI agents.
              </p>
              <button className="btn-primary h-[56px] px-[40px] py-[16px] text-[16px] rounded-[14px] z-10 hover:scale-[1.02] transition-transform shadow-[0_8px_32px_rgba(255,140,50,0.4)]" onClick={() => navigate('/register')}>
                Start Now — It's Free
              </button>
            </motion.div>
          </SharedContainer>
        </section>

        {/* CTA -> Footer Spacing */}
        <Spacer h={100} />
        
      </main>
    </div>
  )
}
