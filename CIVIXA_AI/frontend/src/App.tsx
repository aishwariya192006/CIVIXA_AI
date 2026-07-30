import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import Agent1Page from './pages/dashboard/Agent1Page'
import Agent2Page from './pages/dashboard/Agent2Page'
import Agent3Page from './pages/dashboard/Agent3Page'
import Agent4Page from './pages/dashboard/Agent4Page'
import Agent5Page from './pages/dashboard/Agent5Page'
import Agent6Page from './pages/dashboard/Agent6Page'
import HistoryPage from './pages/dashboard/HistoryPage'
import AnalyticsPage from './pages/dashboard/AnalyticsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import ParticleBackground from './components/ParticleBackground'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#071B2E', color: '#F8FAFC', border: '1px solid rgba(0,212,255,0.3)' }
        }} />
        <Routes>
          <Route path="/" element={<><ParticleBackground /><LandingPage /></>} />
          <Route path="/login" element={<><ParticleBackground /><LoginPage /></>} />
          <Route path="/register" element={<><ParticleBackground /><RegisterPage /></>} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="agent/1" element={<Agent1Page />} />
            <Route path="agent/2" element={<Agent2Page />} />
            <Route path="agent/3" element={<Agent3Page />} />
            <Route path="agent/4" element={<Agent4Page />} />
            <Route path="agent/5" element={<Agent5Page />} />
            <Route path="agent/6" element={<Agent6Page />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
