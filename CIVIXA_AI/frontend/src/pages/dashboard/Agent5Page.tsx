import { UserCheck, MapPin } from 'lucide-react'
import AgentPageWrapper, { FormField, FormTextarea, FormInput, ResultCard } from '../../components/AgentPageWrapper'

const MOCK_OFFICERS = [
  { id: 'SN001', name: 'Deepak Verma', department: 'Sanitation', expertise: ['sewage', 'drain cleaning', 'sanitation'], current_workload: 2, location: 'Zone A', availability: 'Available', past_performance_score: 0.88 },
  { id: 'SN002', name: 'Priya Nair', department: 'Sanitation', expertise: ['waste management', 'public health'], current_workload: 5, location: 'Zone B', availability: 'Busy', past_performance_score: 0.75 },
  { id: 'SN003', name: 'Ramesh Kumar', department: 'Sanitation', expertise: ['sanitation', 'drain repair', 'sewage overflow'], current_workload: 1, location: 'Zone C', availability: 'Available', past_performance_score: 0.92 },
]

export default function Agent5Page() {
  return (
    <AgentPageWrapper
      agentId={5}
      title="Officer Assignment Agent"
      subtitle="Assigns the most suitable officer based on expertise and workload"
      color="#A78BFA"
      icon={UserCheck}
      defaultValues={{
        complaint_summary: 'Sewage overflow near residential area causing health hazard and foul smell',
        department: 'Sanitation',
        priority: 'High',
        location: 'Koramangala, Bangalore',
        issue_type: 'Sewage overflow',
      }}
      buildPayload={(f) => ({
        complaint_summary: f.complaint_summary,
        department: f.department,
        location: f.location,
        issue_type: f.issue_type,
        officers: MOCK_OFFICERS.map(o => ({ ...o, department: f.department || o.department })),
      })}
      resultRenderer={(result) => (
        <div className="space-y-3">
          <div className="p-5 rounded-xl text-center" style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: '#A78BFA', fontFamily: 'Space Grotesk' }}>
              {String(result.assigned_officer || '')}
            </div>
            <div className="text-sm" style={{ color: 'rgba(248,250,252,0.5)' }}>Assigned Officer</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ResultCard label="Assignment Score" value={`${result.assignment_score}/100`} color="#A78BFA" large />
            <ResultCard label="Response Time" value={String(result.estimated_response_time || '')} color="#00D4FF" large />
          </div>
          {result.officer_id && <ResultCard label="Officer ID" value={String(result.officer_id)} color="#FFC857" />}
          {result.reason && (
            <div className="p-3 rounded-xl" style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)' }}>
              <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>Assignment Reason</div>
              <p className="text-sm" style={{ color: '#F8FAFC' }}>{String(result.reason)}</p>
            </div>
          )}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div className="text-xs mb-2 font-medium" style={{ color: 'rgba(248,250,252,0.4)' }}>AVAILABLE OFFICERS</div>
            {MOCK_OFFICERS.map(o => (
              <div key={o.id} className="flex items-center justify-between py-1 text-xs">
                <span style={{ color: '#F8FAFC' }}>{o.name}</span>
                <span style={{ color: o.availability === 'Available' ? '#00C853' : '#FFC857' }}>{o.availability}</span>
                <span style={{ color: 'rgba(248,250,252,0.4)' }}>Load: {o.current_workload}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    >
      {(formData, setFormData) => (
        <>
          <FormField label="Complaint Summary *">
            <FormTextarea value={formData.complaint_summary} onChange={v => setFormData(p => ({ ...p, complaint_summary: v }))}
              placeholder="Describe the complaint..." rows={4} />
          </FormField>
          <FormField label="Department">
            <FormInput value={formData.department} onChange={v => setFormData(p => ({ ...p, department: v }))}
              placeholder="e.g. Sanitation" />
          </FormField>
          <FormField label="Location *" icon={MapPin}>
            <div className="flex gap-3">
              <div className="flex-1">
                <FormInput value={formData.location} onChange={v => setFormData(p => ({ ...p, location: v }))}
                  placeholder="e.g. Koramangala, Bangalore" icon={MapPin} />
              </div>
              <button type="button" onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(async pos => {
                    const { latitude, longitude } = pos.coords;
                    try {
                      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                      const data = await res.json();
                      const placeName = [data.locality, data.city, data.principalSubdivision].filter(Boolean).join(', ');
                      setFormData(p => ({ ...p, location: placeName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
                    } catch {
                      setFormData(p => ({ ...p, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
                    }
                  }, null, { enableHighAccuracy: true });
                }
              }}
                className="w-[140px] rounded-[12px] transition-all hover:bg-white/10 hover:border-white/30 text-[14px] font-bold flex items-center justify-center gap-2 h-[52px] shrink-0 cursor-pointer" 
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#F8FAFC' }}
                title="Detect Current Location"
              >
                <MapPin size={16} /> Detect
              </button>
            </div>
          </FormField>
          <FormField label="Issue Type">
            <FormInput value={formData.issue_type} onChange={v => setFormData(p => ({ ...p, issue_type: v }))}
              placeholder="e.g. Sewage overflow" />
          </FormField>
        </>
      )}
    </AgentPageWrapper>
  )
}
