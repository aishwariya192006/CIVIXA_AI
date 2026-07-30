import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LiveChat } from '../../components/LiveChat';
import { MapComponent } from '../../components/MapComponent';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle, AlertTriangle, Plus, MessageSquare, 
  MapPin, Activity, Bell, Download, ShieldCheck, Search, ChevronRight, User
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [trackId, setTrackId] = useState('');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['citizen-stats'],
    queryFn: async () => {
      const res = await api.get('/complaints/stats/citizen');
      return res.data.data;
    }
  });

  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const res = await api.get('/complaints');
      return res.data.data;
    }
  });

  if (statsLoading || complaintsLoading) {
    return <div className="p-8 animate-pulse text-gray-500">Loading your enterprise command center...</div>;
  }

  const StatCard = ({ title, value, icon: Icon, colorClass, gradient }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 border-l-4 ${colorClass} relative overflow-hidden group`}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 ${gradient} group-hover:scale-150 transition-transform duration-500`} />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{t(title)}</p>
          <h3 className="text-3xl font-bold text-white">{value || 0}</h3>
        </div>
        <div className={`p-4 rounded-xl bg-white shadow-sm border border-gray-100 ${colorClass.replace('border-l-', 'text-')}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId.trim()) navigate(`/app/complaints/${trackId.trim()}`);
  };

  const exportToCSV = () => {
    if (!complaints || complaints.length === 0) return alert('No complaints to export');
    const headers = ['ID', 'Title', 'Status', 'Date'];
    const rows = complaints.map((c: any) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.status,
      new Date(c.createdAt).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "complaints_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('Welcome')}, {user?.fullName}</h1>
          <p className="text-gray-400 mt-1">{t('Your unified civic grievance command center.')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> {t('Export Report')}
          </button>
          <Link to="/app/complaints/new" className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/30">
            <Plus className="w-5 h-5" />
            {t('File Complaint')}
          </Link>
        </div>
      </div>

      {/* Enterprise Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Filed" value={stats?.total} icon={FileText} colorClass="border-l-blue-500" gradient="bg-blue-500" />
        <StatCard title="Pending Review" value={stats?.pending} icon={Clock} colorClass="border-l-yellow-500" gradient="bg-yellow-500" />
        <StatCard title="In Progress" value={stats?.inProgress} icon={Activity} colorClass="border-l-orange-500" gradient="bg-orange-500" />
        <StatCard title="Resolved" value={stats?.resolved} icon={CheckCircle} colorClass="border-l-green-500" gradient="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions & Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-futuristic-cyan" /> {t('Track Complaint')}
              </h3>
              <form onSubmit={handleTrack} className="flex gap-2">
                <input 
                  type="text" 
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  placeholder="Enter Complaint ID..." 
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary">{t('Track')}</button>
              </form>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link to="/app/complaints" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-primary-50 hover:text-primary-700 transition-colors text-sm font-medium text-gray-700 border border-gray-100">
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> {t('My History')}</span>
                </Link>
                <button onClick={async () => {
                  try {
                    const { default: api } = await import('../../services/api');
                    const res = await api.get('/notifications');
                    const unread = (res.data.data || []).filter((n: any) => !n.read);
                    if (unread.length === 0) {
                      alert('no alerts');
                    } else {
                      // Trigger click on header bell
                      const bellIcons = document.querySelectorAll('header .lucide-bell');
                      if (bellIcons.length > 0 && bellIcons[0].parentElement) {
                        bellIcons[0].parentElement.click();
                      } else {
                        alert(`You have ${unread.length} unread alerts. Check the notification bell.`);
                      }
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-primary-50 hover:text-primary-700 transition-colors text-sm font-medium text-gray-700 border border-gray-100 w-full text-left">
                  <span className="flex items-center gap-2"><Bell className="w-4 h-4" /> {t('Alerts')}</span>
                </button>
              </div>
            </div>

            {/* Profile Widget */}
            <div className="glass-card p-6 flex flex-col justify-center">
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-600 to-blue-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white">
                   {user?.fullName.charAt(0)}
                 </div>
                  <div>
                   <h3 className="font-bold text-white text-lg">{user?.fullName}</h3>
                   <p className="text-gray-400 text-sm">{user?.email}</p>
                   <span className="inline-block mt-2 px-3 py-1 bg-futuristic-cyan/20 text-futuristic-cyan text-xs font-semibold rounded-full border border-futuristic-cyan/30">
                     {t('Verified Citizen')}
                   </span>
                 </div>
               </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">{t('Filing Trends (Current Year)')}</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#00f0ff' }}
                    cursor={{ fill: '#ffffff10' }}
                  />
                  <Bar dataKey="complaints" fill="url(#colorComplaints)" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>



        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Recent List */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">{t('Recent Activity')}</h3>
              <Link to="/app/complaints" className="text-sm text-futuristic-cyan font-medium hover:underline">{t('View All')}</Link>
            </div>
            
            <div className="space-y-4">
              {complaints?.slice(0, 4).map((comp: any) => (
                <div key={comp.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:border-primary-300 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800 line-clamp-1 pr-2 group-hover:text-primary-600 transition-colors">{comp.title}</h4>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider shrink-0 border ${
                      comp.status === 'RESOLVED' || comp.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 
                      comp.status === 'IN_PROGRESS' || comp.status === 'VERIFICATION' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                      comp.status === 'ESCALATED' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {comp.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{comp.description}</p>
                  
                  {/* Progress Bar Mocked based on status */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                    <div className={`h-1.5 rounded-full ${
                      comp.status === 'RESOLVED' || comp.status === 'COMPLETED' ? 'bg-green-500 w-full' :
                      comp.status === 'IN_PROGRESS' || comp.status === 'VERIFICATION' ? 'bg-orange-500 w-2/3' :
                      'bg-blue-500 w-1/3'
                    }`}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400 font-medium">
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </div>
                    <Link 
                      to={`/app/complaints/${comp.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Details <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
              {complaints?.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No complaints filed yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Your city needs your voice.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Notice */}
          <div className="glass-card p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
            <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" /> AI Monitoring Active
            </h4>
            <p className="text-sm text-indigo-700/80 leading-relaxed">
              Your dashboard is powered by the CIVIXA multi-agent AI system. Complaints are automatically routed to the nearest available officers, and duplicates are automatically clustered to ensure maximum priority and fastest resolution times.
            </p>
          </div>

        </div>

      </div>

      <AnimatePresence>
        {isChatOpen && selectedComplaintId && (
          <LiveChat complaintId={selectedComplaintId} onClose={() => setIsChatOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};
