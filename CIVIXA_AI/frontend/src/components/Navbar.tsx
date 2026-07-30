import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Globe, Moon, User, Zap, Menu, X } from 'lucide-react'

type Page = 'home' | 'agents' | 'complaint' | 'dashboard'

interface NavbarProps {
  currentPage: Page
  setCurrentPage: (page: Page) => void
}

const navLinks: { label: string; page: Page }[] = [
  { label: 'Home', page: 'home' },
  { label: 'AI Agents', page: 'agents' },
  { label: 'File Complaint', page: 'complaint' },
  { label: 'Dashboard', page: 'dashboard' },
]

export default function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-3"
    >
      <div
        className="glass mx-auto max-w-7xl px-6 py-3 flex items-center justify-between"
        style={{
          backdropFilter: scrolled ? 'blur(30px)' : 'blur(20px)',
          borderColor: scrolled ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.15)',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
          <div className="orb" style={{ width: 32, height: 32 }} />
          <div>
            <div className="text-gradient-saffron font-bold text-lg leading-none" style={{ fontFamily: 'Space Grotesk' }}>
              Civixa AI
            </div>
            <div style={{ fontSize: 9, color: 'rgba(0,212,255,0.7)', letterSpacing: '0.5px' }}>
              MULTI-AGENT PLATFORM
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <button
              key={link.page}
              onClick={() => setCurrentPage(link.page)}
              className={`nav-link ${currentPage === link.page ? 'active' : ''}`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right Icons */}
        <div className="hidden md:flex items-center gap-3">
          <button className="nav-link p-2"><Globe size={16} /></button>
          <button className="nav-link p-2"><Bell size={16} /></button>
          <button className="nav-link p-2"><Moon size={16} /></button>
          <button className="nav-link p-2"><User size={16} /></button>
          <button
            className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
            onClick={() => setCurrentPage('complaint')}
          >
            <Zap size={14} />
            Emergency
          </button>
        </div>

        {/* Mobile Menu */}
        <button className="md:hidden nav-link p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mx-4 mt-2 p-4 flex flex-col gap-2"
        >
          {navLinks.map(link => (
            <button
              key={link.page}
              onClick={() => { setCurrentPage(link.page); setMobileOpen(false) }}
              className={`nav-link text-left ${currentPage === link.page ? 'active' : ''}`}
            >
              {link.label}
            </button>
          ))}
        </motion.div>
      )}
    </motion.nav>
  )
}
