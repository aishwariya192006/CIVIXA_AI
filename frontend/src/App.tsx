import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
// import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { MainLayout } from './layouts/MainLayout';
import { CitizenDashboard } from './pages/dashboard/CitizenDashboard';
import { OfficerDashboard } from './pages/dashboard/OfficerDashboard';
import { OfficialDashboard } from './pages/dashboard/OfficialDashboard';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { AiAnalyticsDashboard } from './pages/dashboard/AiAnalyticsDashboard';
import AIOpsDashboard from './pages/aiops/AIOpsDashboard';
import { AdminNotificationPanel } from './pages/admin/AdminNotificationPanel';
import { ComplaintForm } from './pages/complaints/ComplaintForm';
import { ComplaintList } from './pages/complaints/ComplaintList';
import { ComplaintDetails } from './pages/complaints/ComplaintDetails';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { UserManagement } from './pages/admin/UserManagement';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center text-primary-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'CITIZEN') return <CitizenDashboard />;
  if (user?.role === 'OFFICER') return <OfficerDashboard />;
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (user?.role === 'OFFICIAL') return <OfficialDashboard />;
  return <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/app" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardRouter />} />
        <Route path="complaints" element={<ComplaintList />} />
        <Route path="analytics" element={<AiAnalyticsDashboard />} />
        <Route path="aiops" element={<ProtectedRoute allowedRoles={['ADMIN']}><AIOpsDashboard /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
        <Route path="notifications/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminNotificationPanel /></ProtectedRoute>} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="complaints/new" element={<ComplaintForm />} />
        <Route path="complaints/:id" element={<ComplaintDetails />} />
        <Route path="complaints/success" element={<div className="p-8 text-center text-green-600 font-bold text-2xl">Complaint Submitted Successfully!</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

