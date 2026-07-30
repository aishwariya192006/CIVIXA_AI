import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { MapComponent } from '../../components/MapComponent';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Activity, Download, Search, Map, ShieldAlert, ArrowRight, UserCog } from 'lucide-react';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#6366f1'];

export const OfficialDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics_official'],
    queryFn: async () => {
      const res = await api.get('/analytics/official');
      return res.data.data;
    }
  });

  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['official_complaints'],
    queryFn: async () => {
      const res = await api.get('/complaints');
      return res.data.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await api.patch(`/complaints/${id}/status`, { status, resolutionRemarks: 'Updated by Higher Official' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['official_complaints'] });
      queryClient.invalidateQueries({ queryKey: ['analytics_official'] });
    }
  });

  if (isLoading || complaintsLoading) return <div className="p-8 text-primary-600 font-medium animate-pulse">Loading Government Monitoring Engine...</div>;

  const { totalComplaints = 0, delayed = 0, escalated = 0, departmentStats = [], monthlyTrends = [] } = analytics || {};

  const successRate = totalComplaints > 0 
    ? Math.round((departmentStats.reduce((acc: number, d: any) => acc + d.resolved, 0) / totalComplaints) * 100) 
    : 0;

  const exportToCSV = () => {
    const header = ['Department', 'Total Complaints', 'Resolved', 'Pending'];
    const rows = departmentStats.map((d: any) => [d.name, d.total, d.resolved, d.pending]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `official_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, gradient }: any) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 border-l-4 ${colorClass} relative overflow-hidden group`}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 ${gradient} group-hover:scale-150 transition-transform duration-500`} />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`p-4 rounded-xl bg-white shadow-sm border border-gray-100 ${colorClass.replace('border-l-', 'text-')}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Government Oversight</h1>
          <p className="text-gray-500 mt-1">Real-time monitoring and analytics for city-wide resolutions.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToCSV} className="btn-secondary bg-white px-5 py-2.5 rounded-xl border border-gray-200 flex items-center gap-2 font-semibold shadow-sm hover:bg-gray-50">
            <Download className="w-5 h-5 text-gray-500" /> Export PDF/Excel
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Cases" value={totalComplaints} subtitle="All time complaints" icon={Activity} colorClass="border-l-blue-500" gradient="bg-blue-500" />
        <StatCard title="Resolution Rate" value={`${successRate}%`} subtitle="City-wide average" icon={TrendingUp} colorClass="border-l-green-500" gradient="bg-green-500" />
        <StatCard title="Escalated" value={escalated} subtitle="Requires immediate attention" icon={AlertTriangle} colorClass="border-l-red-500" gradient="bg-red-500" />
        <StatCard title="Delayed" value={delayed} subtitle="Missed SLA deadlines" icon={ShieldAlert} colorClass="border-l-orange-500" gradient="bg-orange-500" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['overview', 'management', 'map'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold text-sm uppercase tracking-wider ${
              activeTab === tab ? 'border-b-2 border-primary-600 text-primary-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'overview' ? 'Analytics Overview' : tab === 'management' ? 'Action Center' : 'Geospatial Heatmap'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Trend Chart */}
          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Monthly Resolution Trends
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="complaints" name="Incoming" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorComplaints)" />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Bar Chart */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Department Load Ranking</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontWeight: 600 }} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={30} />
                  <Bar dataKey="resolved" name="Resolved" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Pie Chart */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Case Distribution</h3>
            <div className="h-[250px] w-full flex items-center justify-center -mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={departmentStats} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="total">
                    {departmentStats.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
               {departmentStats.map((d: any, i: number) => (
                  <div key={d.name} className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                     <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                     <span className="text-xs text-gray-700 font-medium">{d.name}</span>
                  </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'management' && (
        <div className="glass-card p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Action Center: Critical Cases</h3>
            <div className="relative w-64">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 w-full bg-gray-50 border-gray-200"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tl-lg">Complaint</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {complaints?.filter((c:any) => c.status === 'ESCALATED' || c.priority === 'CRITICAL' || c.priority === 'HIGH')
                  .filter((c:any) => c.title.toLowerCase().includes(search.toLowerCase()))
                  .map((comp: any) => (
                  <tr key={comp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900 text-sm line-clamp-1">{comp.title}</p>
                      <p className="text-xs text-gray-500">ID: {comp.id.substring(0,8)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{comp.categoryName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border ${
                        comp.status === 'ESCALATED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {comp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-red-600">
                      {comp.priority} ({comp.priorityScore})
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 flex justify-end">
                       <button className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 rounded-lg shadow-sm transition-all" title="Reassign Officer">
                         <UserCog className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => updateStatusMutation.mutate({ id: comp.id, status: 'ESCALATED' })}
                         disabled={comp.status === 'ESCALATED'}
                         className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-300 rounded-lg shadow-sm transition-all disabled:opacity-50" 
                         title="Force Escalate"
                       >
                         <AlertTriangle className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Map className="w-5 h-5 text-green-600" /> City-wide Issue Heatmap
          </h3>
          <MapComponent complaints={complaints || []} />
        </div>
      )}
    </div>
  );
};
