import { Search, MapPin } from 'lucide-react'
import AgentPageWrapper, { FormField, FormTextarea, FormInput, ResultCard } from '../../components/AgentPageWrapper'

const str = (v: unknown): string => (v == null ? '' : String(v))

export default function Agent2Page() {
  return (
    <AgentPageWrapper
      agentId={2}
      title="Duplicate Detection Agent"
      subtitle="Identifies similar or identical complaints to prevent redundant work"
      color="#FF8C32"
      icon={Search}
      defaultValues={{
        new_summary: 'Water pipe burst on MG Road near bus stop, water flooding the street',
        new_location: 'MG Road, Bangalore',
      }}
      buildPayload={(f) => ({ new_summary: f.new_summary, new_location: f.new_location })}
      resultRenderer={(result) => (
        <div className="space-y-6">
          <div className="p-4 rounded-xl text-center" style={{
            background: result.is_duplicate ? 'rgba(255,200,87,0.1)' : 'rgba(0,200,83,0.1)',
            border: `1px solid ${result.is_duplicate ? 'rgba(255,200,87,0.4)' : 'rgba(0,200,83,0.4)'}`
          }}>
            <div className="text-3xl font-bold mb-1" style={{ color: result.is_duplicate ? '#FFC857' : '#00C853', fontFamily: 'Space Grotesk' }}>
              {result.is_duplicate ? '⚠️ DUPLICATE' : '✅ UNIQUE'}
            </div>
            <div className="text-sm" style={{ color: 'rgba(248,250,252,0.6)' }}>
              {result.is_duplicate ? 'This complaint already exists in the system' : 'This is a new unique complaint'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ResultCard label="Similarity Score" value={`${str(result.similarity)}%`} color="#FF8C32" large />
            <ResultCard label="Decision" value={str(result.decision)} color={result.is_duplicate ? '#FFC857' : '#00C853'} large />
          </div>
          {result.matched_complaint_id && (
            <ResultCard label="Matched Complaint ID" value={str(result.matched_complaint_id)} color="#FF8C32" />
          )}
          <details><summary className="cursor-pointer text-xs font-medium" style={{ color: '#FF8C32' }}>View Raw JSON</summary>
            <div className="json-output text-xs mt-2">{JSON.stringify(result, null, 2)}</div>
          </details>
        </div>
      )}
    >
      {(formData, setFormData) => (
        <>
          <FormField label="New Complaint Summary *">
            <FormTextarea value={formData.new_summary} onChange={v => setFormData(p => ({ ...p, new_summary: v }))}
              placeholder="Enter the new complaint to check for duplicates..." rows={4} />
          </FormField>
          <FormField label="Location *" icon={MapPin}>
            <div className="flex gap-3">
              <div className="flex-1">
                <FormInput value={formData.new_location} onChange={v => setFormData(p => ({ ...p, new_location: v }))} placeholder="e.g. MG Road, Bangalore" icon={MapPin} />
              </div>
              <button type="button" onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(async pos => {
                    const { latitude, longitude } = pos.coords;
                    try {
                      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                      const data = await res.json();
                      const placeName = [data.locality, data.city, data.principalSubdivision].filter(Boolean).join(', ');
                      setFormData(p => ({ ...p, new_location: placeName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
                    } catch {
                      setFormData(p => ({ ...p, new_location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
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
          
          <div className="p-5 rounded-[12px] mt-2" style={{ background: 'rgba(255,140,50,0.05)', border: '1px solid rgba(255,140,50,0.15)' }}>
            <div className="text-[12px] font-bold tracking-wide uppercase mb-3" style={{ color: '#FF8C32' }}>Existing Complaints in System (auto-loaded)</div>
            <div className="flex flex-col gap-2">
              {['Broken water pipe on MG Road flooding the street', 'Garbage not collected in Koramangala for 5 days', 'Street light not working near school', 'Pothole on main road causing accidents'].map((c, i) => (
                <div key={i} className="text-[14px] flex items-start gap-2 leading-tight" style={{ color: 'rgba(248,250,252,0.6)' }}>
                  <span style={{ color: '#FF8C32', marginTop: '2px' }}>•</span> {c}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AgentPageWrapper>
  )
}
