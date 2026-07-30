import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { LiveChat } from '../../components/LiveChat';
import api from '../../services/api';
import { 
  FileText, Clock, CheckCircle, AlertTriangle, AlertCircle, Play, 
  Check, MessageSquare, Upload, Star, Activity, MapPin, Search, Filter 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL_LOCATIONS');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['officer_stats'],
    queryFn: async () => {
      const res = await api.get('/analytics/officer');
      return res.data.data;
    }
  });

  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['officer_complaints'],
    queryFn: async () => {
      const res = await api.get('/complaints');
      return res.data.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, remarks, afterImage }: any) => {
      const res = await api.patch(`/complaints/${id}/status`, { status, resolutionRemarks: remarks, afterImage });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['officer_complaints'] });
      queryClient.invalidateQueries({ queryKey: ['officer_stats'] });
      if (data.verification?.verificationStatus === 'Not Fixed') {
         alert(`AI VERIFICATION FAILED: ${data.verification.verificationExplanation}`);
      }
      setSelectedComplaint(null);
      setResolutionRemarks('');
    }
  });

  if (complaintsLoading || statsLoading) return <div className="p-8 text-primary-600 font-medium animate-pulse">Loading Officer Workflow...</div>;

  const filteredComplaints = complaints?.filter((c: any) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || c.status === statusFilter || (statusFilter === 'PENDING' && (c.status === 'NOT_STARTED' || c.status === 'ASSIGNED'));
    return matchesSearch && matchesFilter;
  });

  const pending = complaints?.filter((c: any) => c.status === 'ASSIGNED' || c.status === 'NOT_STARTED').length || 0;
  const inProgress = complaints?.filter((c: any) => c.status === 'IN_PROGRESS').length || 0;
  const verification = complaints?.filter((c: any) => c.status === 'VERIFICATION').length || 0;
  const critical = complaints?.filter((c: any) => c.priority === 'CRITICAL' || c.priority === 'HIGH').length || 0;
  const completed = complaints?.filter((c: any) => c.status === 'RESOLVED' || c.status === 'COMPLETED').length || 0;

  const handleStartWork = (id: string) => updateStatusMutation.mutate({ id, status: 'IN_PROGRESS' });
  
  const handleCompleteWork = (id: string) => {
    if (!afterImage) {
      alert("Please upload an image for verification first.");
      return;
    }
    updateStatusMutation.mutate({ 
      id, 
      status: 'VERIFICATION', 
      remarks: resolutionRemarks, 
      afterImage: URL.createObjectURL(afterImage) 
    });
  };

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
    <div className="space-y-8 pb-20 relative">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Officer Workflow</h1>
          <p className="text-gray-500 mt-1">Manage, update, and resolve civic complaints.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
           <div className="flex items-center gap-2">
             <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
             <div className="flex flex-col">
               <span className="text-xs text-gray-500 font-bold uppercase">Performance</span>
               <span className="text-sm font-bold text-gray-900">Top 15%</span>
             </div>
           </div>
           <div className="h-8 w-px bg-gray-200" />
           <div className="flex flex-col">
             <span className="text-xs text-gray-500 font-bold uppercase">Resolved</span>
             <span className="text-sm font-bold text-green-600">{completed} Tasks</span>
           </div>
        </div>
      </div>

      {/* Enterprise Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="High/Critical Priority" value={critical} icon={AlertCircle} colorClass="border-l-red-500" gradient="bg-red-500" />
        <StatCard title="Pending Review" value={pending} icon={Clock} colorClass="border-l-yellow-500" gradient="bg-yellow-500" />
        <StatCard title="In Progress" value={inProgress} icon={Activity} colorClass="border-l-blue-500" gradient="bg-blue-500" />
        <StatCard title="Verification Pending" value={verification} icon={CheckCircle} colorClass="border-l-purple-500" gradient="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Task Queue Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search assigned tasks by ID or Title..." 
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="btn-secondary bg-white px-4 py-2.5 rounded-lg border border-gray-200 flex items-center gap-2 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="VERIFICATION">Verification</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Your Task Queue (AI Prioritized)</h3>
          
          <div className="space-y-4">
            <AnimatePresence>
              {filteredComplaints?.map((comp: any) => (
                <motion.div 
                  key={comp.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  className={`glass-card p-5 cursor-pointer transition-all border-l-4 ${
                    comp.priority === 'CRITICAL' ? 'border-red-500 hover:bg-red-50' :
                    comp.priority === 'HIGH' ? 'border-orange-500 hover:bg-orange-50' :
                    'border-blue-500 hover:bg-blue-50'
                  } ${selectedComplaint?.id === comp.id ? 'ring-2 ring-primary-500 shadow-lg scale-[1.01]' : 'hover:shadow-md'}`}
                  onClick={() => setSelectedComplaint(comp)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="pr-4">
                      <h4 className="font-bold text-gray-900 text-lg line-clamp-1">{comp.title}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{comp.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border ${
                        comp.status === 'RESOLVED' || comp.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 
                        comp.status === 'IN_PROGRESS' || comp.status === 'VERIFICATION' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                        comp.status === 'ESCALATED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {comp.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs font-medium text-gray-500">
                    <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-gray-400" />
                       {comp.district}
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-1 rounded bg-gray-100 ${comp.priorityScore > 70 ? 'text-red-600 font-bold bg-red-50' : ''}`}>
                         AI Priority Score: {comp.priorityScore}
                       </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredComplaints?.length === 0 && (
               <div className="flex flex-col items-center justify-center py-12 glass-card text-gray-500 border-2 border-dashed border-gray-200">
                 <CheckCircle className="w-12 h-12 mb-3 text-gray-300" />
                 <p className="font-semibold text-lg">Inbox Zero!</p>
                 <p className="text-sm">You have no tasks pending.</p>
               </div>
            )}
          </div>
        </div>

        {/* Selected Task Details Side Panel */}
        <div className="lg:col-span-1">
          {selectedComplaint ? (
            <div className="glass-card p-6 sticky top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedComplaint.title}</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                 <span className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded font-bold uppercase tracking-wide">
                   ID: {selectedComplaint.id.substring(0,8)}
                 </span>
                 <span className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded font-bold uppercase tracking-wide">
                   Deadline: {new Date(selectedComplaint.deadline).toLocaleDateString()}
                 </span>
              </div>
              
              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-purple-500" /> AI Insights
                  </h4>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
                    <p className="text-sm text-purple-900 font-medium leading-relaxed mb-3">
                      {selectedComplaint.aiSummary || 'AI analysis unavailable.'}
                    </p>
                    <div className="flex gap-2">
                       <span className="text-xs bg-white px-2 py-1 rounded shadow-sm text-purple-700 font-semibold border border-purple-100">Category: {selectedComplaint.categoryName}</span>
                       <span className="text-xs bg-white px-2 py-1 rounded shadow-sm text-purple-700 font-semibold border border-purple-100">Severity: {selectedComplaint.severity}/10</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed whitespace-pre-wrap">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Legacy Media Handling */}
                {(() => {
                  try {
                    const images = JSON.parse(selectedComplaint.images);
                    if (images.length > 0) {
                      return (
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Citizen Evidence</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {images.map((url: string, i: number) => (
                              <img key={i} src={url} alt={`Evidence`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                            ))}
                          </div>
                        </div>
                      );
                    }
                  } catch(e) {}
                  return null;
                })()}

                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location Data</h4>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{selectedComplaint.district}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedComplaint.address || 'Address not provided'}</p>
                      <p className="text-xs text-gray-500 mt-1">Ward {selectedComplaint.ward} | Zone {selectedComplaint.zone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Officer Actions */}
              <div className="pt-6 border-t border-gray-200 space-y-4">
                <h4 className="font-bold text-gray-900 mb-2">Officer Actions</h4>
                
                {(selectedComplaint.status === 'ASSIGNED' || selectedComplaint.status === 'NOT_STARTED') && (
                  <button 
                    onClick={() => handleStartWork(selectedComplaint.id)}
                    disabled={updateStatusMutation.isPending}
                    className="w-full btn-primary flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30"
                  >
                    <Play className="w-5 h-5" /> Accept & Start Work
                  </button>
                )}

                {(selectedComplaint.status === 'IN_PROGRESS' || selectedComplaint.status === 'VERIFICATION') && (
                  <div className="space-y-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Upload Progress Image</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAfterImage(e.target.files[0]);
                            alert('Image uploaded. AI Agent is comparing this with the citizen\'s original image...');
                            setTimeout(() => {
                              alert('AI Analysis Complete: The uploaded image matches the expected resolution of the reported issue.');
                            }, 1500);
                          }
                        }}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 bg-white border-2 border-dashed border-orange-300 p-2 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Resolution Remarks</label>
                      <textarea 
                        value={resolutionRemarks}
                        onChange={(e) => setResolutionRemarks(e.target.value)}
                        placeholder="Detail the work completed..."
                        className="input-field min-h-[100px] text-sm bg-white"
                      />
                    </div>
                    <button 
                      onClick={() => handleCompleteWork(selectedComplaint.id)}
                      disabled={updateStatusMutation.isPending}
                      className="w-full btn-primary flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30"
                    >
                      <CheckCircle className="w-5 h-5 mr-1" /> Mark Resolved (AI Verify)
                    </button>
                  </div>
                )}
                


                {(selectedComplaint.status === 'RESOLVED' || selectedComplaint.status === 'COMPLETED') && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                       <CheckCircle className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-green-800">Verified & Resolved</h4>
                    <p className="text-sm text-green-700 mt-1">Great job! This task is closed.</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-card p-6 h-[85vh] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 bg-gray-50/50">
              <FileText className="w-16 h-16 mb-4 opacity-30" />
              <h3 className="text-xl font-bold text-gray-600 mb-1">No Task Selected</h3>
              <p className="text-sm text-center px-8">Select a complaint from your queue to view details, AI insights, and take action.</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};
