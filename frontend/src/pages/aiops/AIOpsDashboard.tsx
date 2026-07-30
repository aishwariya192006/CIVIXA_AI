import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Server, Database, AlertTriangle, CheckCircle, 
  Clock, Zap, Shield, Cpu, RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

const StatCard = ({ title, value, icon: Icon, color, suffix = '' }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-premium p-6 rounded-2xl border border-white/10 relative overflow-hidden group"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-${color}-500 blur-2xl group-hover:bg-${color}-400 transition-all duration-500`} />
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
    </div>
    <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
      <span className="text-gray-400 text-sm font-medium">{suffix}</span>
    </div>
  </motion.div>
);

const AIOpsDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [queues, setQueues] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, agentsRes, queuesRes, incidentsRes] = await Promise.all([
        api.get('/aiops/dashboard'),
        api.get('/aiops/agents'),
        api.get('/aiops/queues'),
        api.get('/aiops/incidents')
      ]);
      setData(dashRes.data.data);
      setAgents(agentsRes.data.data);
      setQueues(queuesRes.data.data);
      setIncidents(incidentsRes.data.data);
    } catch (err: any) {
      setError('Failed to fetch AIOps metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const socket = getSocket();
    
    // Real-time updates
    const handleHealthUpdate = () => {
      api.get('/aiops/dashboard').then(res => setData(res.data.data));
      api.get('/aiops/agents').then(res => setAgents(res.data.data));
    };
    const handleQueueUpdate = () => {
      api.get('/aiops/queues').then(res => setQueues(res.data.data));
    };

    socket.on('aiops:health_update', handleHealthUpdate);
    socket.on('aiops:queue_update', handleQueueUpdate);
    socket.on('aiops:alert', fetchDashboardData);
    socket.on('aiops:cost_update', fetchDashboardData);

    return () => {
      socket.off('aiops:health_update', handleHealthUpdate);
      socket.off('aiops:queue_update', handleQueueUpdate);
      socket.off('aiops:alert', fetchDashboardData);
      socket.off('aiops:cost_update', fetchDashboardData);
    };
  }, []);

  const handleRestartAgent = async (agentName: string) => {
    try {
      await api.post('/aiops/restart-agent', { agentName });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-futuristic-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 bg-red-500/10 rounded-xl">{error}</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Server className="w-8 h-8 text-futuristic-cyan" />
            AI Operations Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Real-time infrastructure & AI agent monitoring</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total AI Requests" value={data?.totalRequests?.toLocaleString()} icon={Activity} color="futuristic-cyan" />
        <StatCard title="Avg Latency" value={data?.avgResponseTime?.toFixed(0)} suffix="ms" icon={Clock} color="purple" />
        <StatCard title="Avg Confidence" value={((data?.avgConfidence || 0) * 100).toFixed(1)} suffix="%" icon={CheckCircle} color="emerald" />
        <StatCard title="Today's Cost" value={`$${(data?.todayCost || 0).toFixed(4)}`} icon={Zap} color="india-saffron" />
      </div>

      {/* Agent Health & Infrastructure Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Agent Status */}
        <div className="lg:col-span-2 glass-premium border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              AI Agents Status
            </h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                {data?.healthyAgents} Healthy
              </span>
              {(data?.warningAgents || 0) > 0 && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                  {data?.warningAgents} Warning
                </span>
              )}
              {(data?.failedAgents || 0) > 0 && (
                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                  {data?.failedAgents} Failed
                </span>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                  <th className="p-4 font-medium">Agent Name</th>
                  <th className="p-4 font-medium">Model</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Latency</th>
                  <th className="p-4 font-medium">Confidence</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white">{agent.agentName}</td>
                    <td className="p-4 text-gray-400">{agent.currentModel}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full border ${
                        agent.status === 'HEALTHY' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        agent.status === 'WARNING' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                        'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{agent.responseTime.toFixed(0)} ms</td>
                    <td className="p-4 text-gray-300">{(agent.confidence * 100).toFixed(1)}%</td>
                    <td className="p-4 text-right">
                      {agent.status !== 'HEALTHY' && (
                        <button 
                          onClick={() => handleRestartAgent(agent.agentName)}
                          className="px-3 py-1 bg-futuristic-cyan/20 hover:bg-futuristic-cyan/30 text-futuristic-cyan rounded text-xs transition-colors"
                        >
                          Restart
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Infrastructure & Queues */}
        <div className="space-y-6">
          {/* Resource Usage */}
          <div className="glass-premium p-6 border border-white/10 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              Resource Usage
            </h2>
            <div className="space-y-4">
              {[
                { label: 'CPU Usage', value: data?.cpuUsage, color: 'bg-purple-500' },
                { label: 'Memory Usage', value: data?.memoryUsage, color: 'bg-futuristic-cyan' },
                { label: 'GPU Usage', value: data?.gpuUsage, color: 'bg-india-saffron' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1 text-gray-300">
                    <span>{stat.label}</span>
                    <span>{stat.value?.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full ${stat.color} rounded-full`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Queues */}
          <div className="glass-premium p-6 border border-white/10 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Active Queues
            </h2>
            <div className="space-y-3">
              {queues.map((q) => (
                <div key={q.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-white">{q.queueName}</p>
                    <p className="text-xs text-gray-400">{q.waitingJobs} waiting</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-400">{q.activeJobs} active</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIOpsDashboard;
