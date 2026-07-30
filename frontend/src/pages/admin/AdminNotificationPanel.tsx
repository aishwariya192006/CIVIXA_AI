import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Send, Bell, Settings } from 'lucide-react';
import api from '../../services/api';

export const AdminNotificationPanel = () => {
  const [activeTab, setActiveTab] = useState<'BROADCAST' | 'TEMPLATES' | 'LOGS'>('BROADCAST');
  const [broadcastData, setBroadcastData] = useState({ title: '', message: '', html: '', text: '', roleTarget: 'ALL' });
  const [logs, setLogs] = useState<{ emails: any[], sms: any[], push: any[] }>({ emails: [], sms: [], push: [] });
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const logsRes = await api.get('/notifications/admin/logs');
      setLogs(logsRes.data.data);
      const tempRes = await api.get('/notifications/admin/templates');
      setTemplates(tempRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/notifications/admin/broadcast', broadcastData);
      alert('Broadcast initiated successfully!');
      setBroadcastData({ title: '', message: '', html: '', text: '', roleTarget: 'ALL' });
    } catch (err: any) {
      alert('Error initiating broadcast: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Notification Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Manage templates, broadcast messages, and view delivery logs.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('BROADCAST')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'BROADCAST' ? 'bg-futuristic-cyan/20 text-futuristic-cyan border border-futuristic-cyan/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Send className="w-4 h-4" /> Broadcast</button>
        <button onClick={() => setActiveTab('TEMPLATES')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'TEMPLATES' ? 'bg-futuristic-cyan/20 text-futuristic-cyan border border-futuristic-cyan/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Settings className="w-4 h-4" /> Templates</button>
        <button onClick={() => setActiveTab('LOGS')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'LOGS' ? 'bg-futuristic-cyan/20 text-futuristic-cyan border border-futuristic-cyan/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Mail className="w-4 h-4" /> Delivery Logs</button>
      </div>

      {activeTab === 'BROADCAST' && (
        <form onSubmit={handleBroadcast} className="glass-premium p-6 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
            <select value={broadcastData.roleTarget} onChange={e => setBroadcastData({...broadcastData, roleTarget: e.target.value})} className="input-field w-full">
              <option value="ALL">All Users</option>
              <option value="CITIZEN">Citizens</option>
              <option value="OFFICER">Officers</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Title / Subject</label>
            <input type="text" required value={broadcastData.title} onChange={e => setBroadcastData({...broadcastData, title: e.target.value})} className="input-field w-full" placeholder="Alert: System Maintenance" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">In-App Message</label>
            <textarea required value={broadcastData.message} onChange={e => setBroadcastData({...broadcastData, message: e.target.value})} className="input-field w-full h-24" placeholder="Brief message for in-app notification center" />
          </div>
          <button type="submit" className="btn-primary w-full py-3 flex justify-center items-center gap-2"><Send className="w-4 h-4" /> Send Broadcast to {broadcastData.roleTarget === 'ALL' ? 'Everyone' : broadcastData.roleTarget + 's'}</button>
        </form>
      )}

      {activeTab === 'TEMPLATES' && (
        <div className="glass-premium p-6 rounded-xl">
          <p className="text-gray-400 mb-4">Email and SMS templates management (Coming soon / Expandable here).</p>
          <div className="space-y-4">
            {templates.map(t => (
              <div key={t.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex justify-between">
                  <h3 className="font-semibold text-white">{t.name}</h3>
                  <span className="text-xs px-2 py-1 bg-white/10 rounded">{t.type}</span>
                </div>
              </div>
            ))}
            {templates.length === 0 && <p className="text-sm text-gray-500 italic">No templates defined.</p>}
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-premium p-6 rounded-xl">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Mail className="w-4 h-4" /> Email Logs</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {logs.emails.map(log => (
                <div key={log.id} className="p-3 bg-white/5 border border-white/10 rounded-lg text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">{log.to}</span>
                    <span className={log.status === 'SENT' ? 'text-emerald-400' : 'text-red-400'}>{log.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs truncate">{log.subject}</p>
                </div>
              ))}
              {logs.emails.length === 0 && <p className="text-gray-500 text-sm">No email logs found.</p>}
            </div>
          </div>
          
          <div className="glass-premium p-6 rounded-xl">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> SMS Logs</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {logs.sms.map(log => (
                <div key={log.id} className="p-3 bg-white/5 border border-white/10 rounded-lg text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">{log.to}</span>
                    <span className={log.status === 'SENT' ? 'text-emerald-400' : 'text-red-400'}>{log.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs truncate">{log.message}</p>
                </div>
              ))}
              {logs.sms.length === 0 && <p className="text-gray-500 text-sm">No SMS logs found.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
