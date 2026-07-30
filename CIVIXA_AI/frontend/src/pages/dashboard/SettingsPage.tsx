import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <motion.div className="mb-8 flex flex-col gap-3" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-14 h-14 rounded-[14px] flex items-center justify-center" style={{ background: 'rgba(255,200,87,0.1)', border: '1px solid rgba(255,200,87,0.2)' }}>
          <Settings size={28} style={{ color: '#FFC857' }} />
        </div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk', color: '#F8FAFC' }}>Settings</h1>
        <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: 15 }}>Manage your platform preferences and agent configurations (Coming Soon).</p>
      </motion.div>
      <motion.div className="glass-card flex flex-col items-center justify-center gap-5" style={{ minHeight: '400px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Settings size={56} style={{ color: 'rgba(248,250,252,0.1)' }} />
        <p className="text-[15px] font-medium" style={{ color: 'rgba(248,250,252,0.4)' }}>Settings panel is under construction.</p>
      </motion.div>
    </div>
  )
}
