import { AlertTriangle, MapPin } from 'lucide-react'
import AgentPageWrapper, { FormField, FormTextarea, FormInput, FormSelect, ResultCard } from '../../components/AgentPageWrapper'

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical']

export default function Agent4Page() {
  return (
    <AgentPageWrapper
      agentId={4}
      title="Priority Intelligence Agent"
      subtitle="Evaluates safety risk and calculates priority scores"
      color="#FF3366"
      icon={AlertTriangle}
      defaultValues={{ complaint_summary: 'High voltage electric wire has fallen on the main road after last night storm. Children are passing by and it is extremely dangerous.', department: 'Electricity', location: 'Sector 15, Delhi', severity: 'Critical' }}
      buildPayload={(f) => ({ complaint_summary: f.complaint_summary, department: f.department, location: f.location, severity: f.severity, keywords: [], issue_type: '' })}
      resultRenderer={(result) => {
        const score = Number(result.score || 0)
        const priority = String(result.priority || '')
        const pColor = priority === 'Critical' ? '#ff4444' : priority === 'High' ? '#FF8C32' : priority === 'Medium' ? '#FFC857' : '#00C853'
        return (
          <div className="space-y-3">
            <div className="p-5 rounded-xl text-center" style={{ background: `${pColor}15`, border: `1px solid ${pColor}40` }}>
              <div className="text-4xl font-bold mb-1" style={{ color: pColor, fontFamily: 'Space Grotesk' }}>{priority}</div>
              <div className="text-sm" style={{ color: 'rgba(248,250,252,0.5)' }}>Priority Level</div>
            </div>
            {/* Score bar */}
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,200,87,0.05)', border: '1px solid rgba(255,200,87,0.15)' }}>
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: 'rgba(248,250,252,0.5)' }}>Priority Score</span>
                <span style={{ color: '#FFC857', fontWeight: 700 }}>{score}/100</span>
              </div>
              <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-3 rounded-full transition-all" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${pColor}, ${pColor}80)` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ResultCard label="Risk Level" value={String(result.risk || '')} color={pColor} />
              <ResultCard label="Response Time" value={String(result.recommended_response_time || '')} color="#00D4FF" />
            </div>
            {result.affected_population && <ResultCard label="Affected Population" value={String(result.affected_population)} color="#A78BFA" />}
            {result.reason && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,200,87,0.05)', border: '1px solid rgba(255,200,87,0.15)' }}>
                <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>Assessment Reason</div>
                <p className="text-sm" style={{ color: '#F8FAFC' }}>{String(result.reason)}</p>
              </div>
            )}
          </div>
        )
      }}
    >
      {(formData, setFormData) => (
        <>
          <FormField label="Complaint Summary *">
            <FormTextarea value={formData.complaint_summary} onChange={v => setFormData(p => ({ ...p, complaint_summary: v }))} placeholder="Describe the complaint..." rows={4} />
          </FormField>
          <FormField label="Department">
            <FormInput value={formData.department} onChange={v => setFormData(p => ({ ...p, department: v }))} placeholder="e.g. Electricity" />
          </FormField>
          <FormField label="Location *" icon={MapPin}>
            <div className="flex gap-3">
              <div className="flex-1">
                <FormInput value={formData.location} onChange={v => setFormData(p => ({ ...p, location: v }))} placeholder="e.g. Sector 15, Delhi" icon={MapPin} />
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
          <FormField label="Initial Severity">
            <FormSelect value={formData.severity} onChange={v => setFormData(p => ({ ...p, severity: v }))} options={SEVERITIES} />
          </FormField>
        </>
      )}
    </AgentPageWrapper>
  )
}
