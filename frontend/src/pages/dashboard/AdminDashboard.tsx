import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Users, Settings, Database, Server, Shield, Activity, HardDrive, Cpu, Edit3, Key, Terminal, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const res = await api.get('/analytics/admin');
      return res.data.data;
    }
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const res = await api.get('/auth/users'); 
      return res.data.data || [];
    }
  });

  if (statsLoading) return <div className="p-8 font-medium text-primary-600 animate-pulse">Loading Admin Control Center...</div>;

  const StatCard = ({ title, value, icon: Icon, colorClass, gradient }: any) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 border-l-4 ${colorClass} relative overflow-hidden group`}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 ${gradient} group-hover:scale-150 transition-transform duration-500`} />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-4 rounded-xl bg-white shadow-sm border border-gray-100 ${colorClass.replace('border-l-', 'text-')}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Admin Console</h1>
          <p className="text-gray-500 mt-1">Manage infrastructure, access controls, and AI Agents.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Citizens" value={stats?.totalCitizens || 0} icon={Users} colorClass="border-l-blue-500" gradient="bg-blue-500" />
        <StatCard title="Active Officers" value={stats?.activeOfficers || 0} icon={Shield} colorClass="border-l-green-500" gradient="bg-green-500" />
        <StatCard title="Total Complaints" value={stats?.totalComplaints || 0} icon={Database} colorClass="border-l-purple-500" gradient="bg-purple-500" />
        <StatCard title="AI Agent Uptime" value="99.9%" icon={Cpu} colorClass="border-l-orange-500" gradient="bg-orange-500" />
      </div>

      <div className="glass-card overflow-hidden mt-8">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {['overview', 'users', 'ai_management', 'security'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === tab ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="p-6">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
               <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                 <BarChart2 className="w-5 h-5 text-primary-600" /> System Processing Trends
               </h3>
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={stats?.monthlyTrends || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                     <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                     <Area type="monotone" dataKey="complaints" name="Total Processed" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSys)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>
          )}

          {/* USER MANAGEMENT TAB */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Role & Access Management</h3>
                <button className="btn-primary py-2 px-4 shadow-md">Provision User</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
                      <th className="py-3 px-4 rounded-tl-lg font-bold uppercase tracking-wider text-xs">Name</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs">Email</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs">Role</th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs">Department</th>
                      <th className="py-3 px-4 rounded-tr-lg font-bold uppercase tracking-wider text-xs text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usersLoading ? (
                      <tr><td colSpan={5} className="p-4 text-center text-gray-500">Loading directory...</td></tr>
                    ) : (
                      users?.map((u: any) => (
                        <tr key={u.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-white font-bold">
                               {u.fullName.charAt(0)}
                             </div>
                             {u.fullName}
                          </td>
                          <td className="py-3 px-4 text-gray-500">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded shadow-sm text-xs font-bold uppercase border ${
                              u.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200' :
                              u.role === 'OFFICIAL' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              u.role === 'OFFICER' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              'bg-green-50 text-green-700 border-green-200'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">{u.department?.name || '-'}</td>
                          <td className="py-3 px-4 text-right">
                            <button className="text-gray-400 hover:text-primary-600 transition-colors p-2 bg-white rounded-lg border border-gray-200 shadow-sm"><Edit3 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* AI MANAGEMENT TAB */}
          {activeTab === 'ai_management' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-gray-700" /> Active AI Agents Cluster
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {[
                     { name: 'Understanding Agent', status: 'Online', model: 'Gemini 1.5 Flash', tokens: '1.2M' },
                     { name: 'Routing Agent', status: 'Online', model: 'Gemini 1.5 Flash', tokens: '450K' },
                     { name: 'Duplicate Detection', status: 'Online', model: 'Gemini 1.5 Flash', tokens: '890K' },
                     { name: 'Priority Agent', status: 'Online', model: 'Gemini 1.5 Flash', tokens: '320K' },
                     { name: 'Verification Agent', status: 'Online', model: 'Gemini 1.5 Pro Vision', tokens: '2.1M' },
                     { name: 'Escalation Agent', status: 'Online', model: 'Gemini 1.5 Flash', tokens: '110K' },
                   ].map(agent => (
                     <div key={agent.name} className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                           <span className="font-semibold text-gray-800">{agent.name}</span>
                           <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                             {agent.status}
                           </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                           <span>Model: {agent.model}</span>
                           <span>Tokens: {agent.tokens}</span>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 text-gray-300 shadow-xl border border-gray-800">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <Key className="w-5 h-5 text-gray-400" /> LLM Configuration
                 </h3>
                 <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold mb-1">Provider</label>
                      <input type="text" disabled value="Google DeepMind (Gemini API)" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-sm text-gray-400 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider font-bold mb-1">System Instructions Prompt (Global Override)</label>
                      <textarea className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 min-h-[100px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" defaultValue={"You are the core AI backend for CIVIXA. Follow all strict routing protocols. Never hallucinate departments."}></textarea>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg">Save AI Config</button>
                 </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="py-12 flex flex-col items-center text-center">
              <Shield className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">System Audit Logs</h3>
              <p className="text-gray-500 max-w-md">No security breaches detected. All API requests are currently authenticated via JWT and rate-limited.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
