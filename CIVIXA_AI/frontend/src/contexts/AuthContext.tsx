import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000/api'

interface User { id: string; name: string; email: string; role: string }
interface AuthCtx {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('civixa_token'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get(`${API}/auth/me`).then(r => setUser(r.data.user)).catch(() => logout())
    }
  }, [token])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const r = await axios.post(`${API}/auth/login`, { email, password })
      localStorage.setItem('civixa_token', r.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${r.data.token}`
      setToken(r.data.token)
      setUser(r.data.user)
    } finally { setLoading(false) }
  }

  const register = async (name: string, email: string, password: string, role: string) => {
    setLoading(true)
    try {
      const r = await axios.post(`${API}/auth/register`, { name, email, password, role })
      localStorage.setItem('civixa_token', r.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${r.data.token}`
      setToken(r.data.token)
      setUser(r.data.user)
    } finally { setLoading(false) }
  }

  const logout = () => {
    localStorage.removeItem('civixa_token')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
