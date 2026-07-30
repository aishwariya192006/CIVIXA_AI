import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { 
  ArrowLeft, Clock, MapPin, AlertTriangle, CheckCircle, BrainCircuit,
  MessageSquare, User, Building, Phone, Calendar, Download, Star, StarHalf
} from 'lucide-react';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [afterImage, setAfterImage] = useState<File | null>(null);

  const { data: complaint, isLoading, error } = useQuery({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const res = await api.get(`/complaints/${id}`);
      return res.data.data;
    },
    enabled: !!id
  });



  if (isLoading) return <div className="p-8 animate-pulse">Loading details...</div>;
  if (error || !complaint) return <div className="p-8 text-red-500">Failed to load complaint.</div>;

  const statusColors: any = {
    'NOT_STARTED': 'bg-gray-100 text-gray-700',
    'ASSIGNED': 'bg-blue-100 text-blue-700',
    'IN_PROGRESS': 'bg-orange-100 text-orange-700',
    'VERIFICATION': 'bg-purple-100 text-purple-700',
    'RESOLVED': 'bg-green-100 text-green-700',
    'COMPLETED': 'bg-green-100 text-green-700',
    'ESCALATED': 'bg-red-100 text-red-700'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[complaint.status] || 'bg-gray-100 text-gray-700'}`}>
                {complaint.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">ID: {complaint.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="btn-secondary bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div id="printable-report" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Description Card */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
            
            {/* Images */}
            {(() => {
              try {
                const images = JSON.parse(complaint.images);
                if (images.length > 0) {
                  return (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Attached Evidence</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {images.map((url: string, i: number) => (
                          <img key={i} src={url} alt={`Evidence ${i+1}`} className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                        ))}
                      </div>
                    </div>
                  );
                }
              } catch (e) {}
              return null;
            })()}
          </div>

          {/* AI Insights Card */}
          <div className="glass-card p-6 border-l-4 border-l-purple-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit className="w-24 h-24 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" /> AI Insights Panel
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-600 font-medium">Predicted Category</p>
                <p className="font-semibold text-purple-900 mt-1">{complaint.categoryName || 'Unknown'}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-600 font-medium">Severity (1-10)</p>
                <p className="font-semibold text-purple-900 mt-1">{complaint.severity}/10</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-600 font-medium">Urgency (1-10)</p>
                <p className="font-semibold text-purple-900 mt-1">{complaint.urgency}/10</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-600 font-medium">Priority Score</p>
                <p className="font-semibold text-purple-900 mt-1">{complaint.priorityScore?.toFixed(1)} pts</p>
              </div>
            </div>

            <div className="relative z-10">
              <h4 className="text-sm font-semibold text-purple-800 mb-2">AI Generated Summary</h4>
              <p className="text-sm text-purple-900 bg-white/50 p-4 rounded-xl border border-purple-100 leading-relaxed">
                {complaint.aiSummary || 'AI analysis pending...'}
              </p>
            </div>
          </div>

          {/* Resolution / Feedback */}
          {(complaint.status === 'RESOLVED' || complaint.status === 'COMPLETED') && (
            <div className="glass-card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Resolution Details
              </h3>
              <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                <p className="text-sm text-gray-800 font-medium mb-1">Officer Remarks:</p>
                <p className="text-gray-600 text-sm">{complaint.resolutionRemarks || 'No remarks provided.'}</p>
              </div>
              

            </div>
          )}

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Timeline */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Timeline</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {complaint.auditLogs?.map((log: any, index: number) => (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{log.action.replace(/_/g, ' ')}</span>
                      <time className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</time>
                    </div>
                    <p className="text-xs text-gray-600">{log.details}</p>
                    {log.user && (
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">By: {log.user.fullName} {log.user.roleName ? `(${log.user.roleName})` : ''}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details Card */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Complaint Meta</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Location</p>
                  <p className="text-gray-500">{complaint.address}, {complaint.district}</p>
                  <p className="text-gray-500 text-xs">Ward: {complaint.ward}, Zone: {complaint.zone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Department</p>
                  <p className="text-gray-500">{complaint.department?.name || 'Unassigned'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Assigned Officer</p>
                  <p className="text-gray-500">{complaint.assignedOfficer?.fullName || 'Pending Assignment'}</p>
                  {complaint.assignedOfficer?.contactNumber && (
                    <p className="text-gray-500 flex items-center gap-1 mt-1 text-xs"><Phone className="w-3 h-3" /> {complaint.assignedOfficer.contactNumber}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-700">Priority Level</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
                    complaint.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    complaint.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                    complaint.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {complaint.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>


    </div>
  );
};
