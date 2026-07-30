import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { FileText, MapPin, Calendar, Clock, AlertTriangle, Download, Search, Filter, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const ComplaintList = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints_list'],
    queryFn: async () => {
      const res = await api.get('/complaints');
      return res.data.data;
    }
  });

  const filteredComplaints = complaints?.filter((comp: any) => {
    const matchesSearch = comp.title.toLowerCase().includes(search.toLowerCase()) || 
                          comp.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || comp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    if (!filteredComplaints) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Title,Status,Priority,Date\n"
      + filteredComplaints.map((c: any) => `${c.id},"${c.title}",${c.status},${c.priority},${new Date(c.createdAt).toLocaleDateString()}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "complaints_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="p-8 animate-pulse text-primary-600 font-medium">Loading complaints history...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaint History</h1>
          <p className="text-gray-500">Track, filter, and export all your past and active complaints.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => window.print()} className="btn-secondary bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-50">
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by Title or ID..." 
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="ALL">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="VERIFICATION">Verification</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated</option>
          </select>
        </div>
      </div>

      <div id="printable-report" className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                <th className="p-4">Complaint ID & Title</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4">AI Priority</th>
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredComplaints?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    No complaints match your filters.
                  </td>
                </tr>
              ) : (
                filteredComplaints?.map((comp: any) => (
                  <tr key={comp.id} className="hover:bg-primary-50/30 transition-colors group">
                    <td className="p-4 max-w-xs">
                      <p className="font-semibold text-gray-800 line-clamp-1">{comp.title}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">ID: {comp.id}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {comp.district}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border ${
                        comp.status === 'RESOLVED' || comp.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                        comp.status === 'IN_PROGRESS' || comp.status === 'VERIFICATION' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        comp.status === 'ESCALATED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {comp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className={`w-4 h-4 ${
                          comp.priority === 'CRITICAL' ? 'text-red-500' :
                          comp.priority === 'HIGH' ? 'text-orange-500' : 'text-blue-500'
                        }`} />
                        <span className="text-sm font-medium text-gray-700">{comp.priority || 'NORMAL'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(comp.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                       <Link to={`/app/complaints/${comp.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors opacity-0 group-hover:opacity-100">
                         View <ChevronRight className="w-4 h-4" />
                       </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
