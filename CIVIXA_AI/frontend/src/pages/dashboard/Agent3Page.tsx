import { Route, MapPin } from 'lucide-react'
import AgentPageWrapper, { FormField, FormTextarea, FormInput, ResultCard } from '../../components/AgentPageWrapper'

const DEPTS = ['Water Supply','Electricity','Sanitation','Roads','Drainage','Traffic','Public Works','Street Lighting','Parks','Waste Management']

export default function Agent3Page() {
  return (
    <AgentPageWrapper
      agentId={3}
      title="Department Routing Agent"
      subtitle="Routes complaints to the exact correct department"
      color="#00C853"
      icon={Route}
      defaultValues={{ complaint_summary: 'Street light not working for 3 days near the school on Anna Nagar main road causing safety issues at night', issue_type: 'Street light failure', location: 'Anna Nagar, Chennai' }}
      buildPayload={(f) => ({ complaint_summary: f.complaint_summary, issue_type: f.issue_type, location: f.location, keywords: [] })}
      resultRenderer={(result) => (
        <div className="space-y-6">
          <div className="p-5 rounded-xl text-center" style={{ background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.3)' }}>
            <div className="text-3xl font-bold mb-1 text-gradient-cyan" style={{ fontFamily: 'Space Grotesk' }}>{String(result.department || '')}</div>
            <div className="text-sm" style={{ color: 'rgba(248,250,252,0.5)' }}>Assigned Department</div>
          </div>
          <ResultCard label="Routing Confidence" value={`${Math.round(Number(result.confidence || 0) * 100)}%`} color="#00C853" large />
          {result.reason && (
            <div className="p-3 rounded-xl" style={{ background: 'rgba(0,200,83,0.05)', border: '1px solid rgba(0,200,83,0.15)' }}>
              <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>Routing Reason</div>
              <p className="text-sm" style={{ color: '#F8FAFC' }}>{String(result.reason)}</p>
            </div>
          )}
        </div>
      )}
    >
      {(formData, setFormData) => (
        <>
          <FormField label="Complaint Summary *">
            <FormTextarea value={formData.complaint_summary} onChange={v => setFormData(p => ({ ...p, complaint_summary: v }))} placeholder="Describe the complaint..." rows={4} />
          </FormField>
          <FormField label="Issue Type">
            <FormInput value={formData.issue_type} onChange={v => setFormData(p => ({ ...p, issue_type: v }))} placeholder="e.g. Street light failure" />
          </FormField>
          <FormField label="Location *" icon={MapPin}>
            <div className="flex gap-3">
              <div className="flex-1">
                <FormInput value={formData.location} onChange={v => setFormData(p => ({ ...p, location: v }))} placeholder="e.g. Anna Nagar, Chennai" icon={MapPin} />
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
          <div className="p-3 rounded-xl" style={{ background: 'rgba(0,200,83,0.05)', border: '1px solid rgba(0,200,83,0.15)' }}>
            <div className="text-xs font-medium mb-2" style={{ color: '#00C853' }}>Supported Departments</div>
            <div className="flex flex-wrap gap-1">{DEPTS.map(d => <span key={d} className="badge badge-green text-xs">{d}</span>)}</div>
          </div>
        </>
      )}
    </AgentPageWrapper>
  )
}
