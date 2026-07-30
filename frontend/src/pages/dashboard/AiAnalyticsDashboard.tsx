import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BrainCircuit, Activity, Zap, ShieldAlert } from 'lucide-react';

const mockTimelineData = [
  { time: '08:00', load: 12, efficiency: 98 },
  { time: '10:00', load: 45, efficiency: 95 },
  { time: '12:00', load: 89, efficiency: 87 },
  { time: '14:00', load: 120, efficiency: 82 },
  { time: '16:00', load: 70, efficiency: 91 },
  { time: '18:00', load: 30, efficiency: 96 },
];

export const AiAnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Intelligence Analytics</h1>
          <p className="text-gray-500">Monitor the performance and routing efficiency of CIVIXA AI Agents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-primary-500">
          <div className="p-3 bg-primary-100 text-primary-700 rounded-xl"><BrainCircuit className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500">AI Agents Active</p><p className="text-xl font-bold">8 / 8</p></div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-green-500">
          <div className="p-3 bg-green-100 text-green-700 rounded-xl"><Zap className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500">Auto-Routed</p><p className="text-xl font-bold">94.2%</p></div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-orange-500">
          <div className="p-3 bg-orange-100 text-orange-700 rounded-xl"><ShieldAlert className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500">Duplicates Caught</p><p className="text-xl font-bold">142</p></div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-purple-500">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-xl"><Activity className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500">Avg Processing</p><p className="text-xl font-bold">1.2s</p></div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">AI Processing Load (Timeline)</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockTimelineData}>
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
