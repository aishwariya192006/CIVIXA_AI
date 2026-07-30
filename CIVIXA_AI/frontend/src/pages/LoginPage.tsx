import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { SharedContainer } from '../components/SharedContainer'
import { Spacer } from '../components/Spacer'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch {
      toast.error('Invalid credentials')
    }
  }

  return (
    <div className="w-full aurora-bg relative z-10 overflow-hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <SharedContainer className="flex flex-col items-center justify-center w-full">
        
        <motion.div className="w-full max-w-[520px] flex flex-col items-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <div className="orb" style={{ width: 64, height: 64 }} />
            <Spacer h={16} />
            <h1 className="text-3xl font-bold text-gradient-saffron" style={{ fontFamily: 'Space Grotesk' }}>Civixa AI</h1>
            <Spacer h={4} />
            <p className="text-sm" style={{ color: 'rgba(248,250,252,0.5)' }}>Sign in to your account</p>
          </div>

          <Spacer h={32} />

          {/* Form Card */}
          <div className="glass-card w-full p-[48px] flex flex-col">
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[24px]">
              
              <div className="w-full flex flex-col gap-[8px]">
                <label className="text-xs font-medium" style={{ color: 'rgba(248,250,252,0.6)' }}>Email</label>
                <div className="relative w-full">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(0,212,255,0.5)' }} />
                  <input type="email" className="w-full pl-[36px] pr-3 py-[12px] text-sm rounded-lg outline-none" placeholder="you@example.com"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.2)', color: '#F8FAFC' }}
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              
              <div className="w-full flex flex-col gap-[8px]">
                <label className="text-xs font-medium" style={{ color: 'rgba(248,250,252,0.6)' }}>Password</label>
                <div className="relative w-full">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(0,212,255,0.5)' }} />
                  <input type={showPass ? 'text' : 'password'} className="w-full pl-[36px] pr-[36px] py-[12px] text-sm rounded-lg outline-none" placeholder="••••••••"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.2)', color: '#F8FAFC' }}
                    value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
                    style={{ color: 'rgba(248,250,252,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Spacer h={8} />

              <button type="submit" disabled={loading}
                className="w-full py-[14px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                style={{
                  background: loading ? 'rgba(255,140,50,0.2)' : 'linear-gradient(135deg, #FF8C32, #FF6B00)',
                  color: loading ? 'rgba(248,250,252,0.4)' : '#fff',
                  border: '1px solid rgba(255,140,50,0.3)',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}>
                {loading ? <div className="loading-dots"><span /><span /><span /></div> : <><Zap size={16} /> Sign In</>}
              </button>
            </form>

            <Spacer h={24} />

            <div className="w-full flex flex-col items-center gap-[12px]">
              <p className="text-sm" style={{ color: 'rgba(248,250,252,0.4)' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#00D4FF' }} className="font-semibold hover:underline">Register</Link>
              </p>
              <p className="text-sm" style={{ color: 'rgba(248,250,252,0.4)' }}>
                <Link to="/" style={{ color: 'rgba(0,212,255,0.6)' }} className="hover:underline">← Back to Home</Link>
              </p>
            </div>
            
          </div>
        </motion.div>
        
      </SharedContainer>
    </div>
  )
}
