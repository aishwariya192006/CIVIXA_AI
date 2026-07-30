import { Brain, Mic, Image, FileText, Video, MapPin, AlignLeft, Settings2 } from 'lucide-react'
import AgentPageWrapper, { FormField, FormTextarea, FormSelect, FormInput, ResultCard } from '../../components/AgentPageWrapper'

const INPUT_TYPES = ['text', 'voice', 'image']

const TYPE_ICONS: Record<string, React.ElementType> = { text: FileText, voice: Mic, image: Image, video: Video }

const str = (v: unknown): string => (v == null ? '' : String(v))
const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : [])

export default function Agent1Page() {
  return (
    <AgentPageWrapper
      agentId={1}
      title="Complaint Understanding Agent"
      subtitle="Understands text, voice, image & video complaints"
      color="#00D4FF"
      icon={Brain}
      defaultValues={{ input_type: 'text', content: '', location: '' }}
      buildPayload={(f) => ({ input_type: f.input_type, content: f.content, location: f.location })}
      buttonText="Run Complaint Agent"
      resultRenderer={(result) => {
        const severity = str(result.severity) || 'Unknown'
        const sevColor = severity === 'Critical' ? '#ff4444' : severity === 'High' ? '#FF8C32' : severity === 'Medium' ? '#FFC857' : '#00C853'
        const priority = 'High' // Fallback/Mock for new UI requirement
        const priColor = '#FF8C32'
        const action = str(result.suggested_action) || 'Dispatch field team for immediate inspection and barrier placement.'
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <ResultCard label="Category" value={str(result.issue_type)} color="#A78BFA" />
              <ResultCard label="Severity" value={severity} color={sevColor} />
              <ResultCard label="Priority" value={priority} color={priColor} />
              <ResultCard label="Confidence" value={`${Math.round(Number(result.confidence || 0) * 100)}%`} color="#FFC857" />
            </div>

            <ResultCard label="Responsible Department" value={str(result.department)} color="#00D4FF" />

            {result.complaint_summary && (
              <div className="p-6 rounded-[16px] flex flex-col gap-3" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                <div className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: '#8b95a5' }}>AI Summary</div>
                <p className="text-[15px] leading-relaxed" style={{ color: '#F8FAFC' }}>{str(result.complaint_summary)}</p>
              </div>
            )}

            <div className="p-6 rounded-[16px] flex flex-col gap-3" style={{ background: 'rgba(255,140,50,0.05)', border: '1px solid rgba(255,140,50,0.15)' }}>
              <div className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: '#8b95a5' }}>Suggested Action</div>
              <p className="text-[15px] leading-relaxed" style={{ color: '#FF8C32' }}>{action}</p>
            </div>

            {result.keywords && Array.isArray(result.keywords) && (
              <div className="flex flex-col gap-3">
                <div className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: '#8b95a5' }}>Keywords</div>
                <div className="flex flex-wrap gap-3">
                  {arr(result.keywords).map((k, i) => (
                    <span key={i} className="text-[13px] font-semibold px-[16px] py-[8px] rounded-full" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>{k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      }}
    >
      {(formData, setFormData) => (
        <>
          <FormField label="Input Format" icon={Settings2}>
            <FormSelect value={formData.input_type} onChange={v => setFormData(p => ({ ...p, input_type: v }))} options={INPUT_TYPES} icon={Settings2} />
          </FormField>

          <FormField label="Complaint Content *" icon={AlignLeft}>
            <FormTextarea value={formData.content} onChange={v => setFormData(p => ({ ...p, content: v }))}
              placeholder="Complaint description..." rows={8} />
          </FormField>
          
          <FormField label="Location *" icon={MapPin}>
            <div className="flex gap-3">
              <div className="flex-1">
                <FormInput value={formData.location} onChange={v => setFormData(p => ({ ...p, location: v }))} placeholder="e.g. MG Road, Bangalore" icon={MapPin} />
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
        </>
      )}
    </AgentPageWrapper>
  )
}
