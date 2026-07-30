import { CheckCircle } from 'lucide-react'
import AgentPageWrapper, { FormField, FormTextarea, FormInput, ResultCard } from '../../components/AgentPageWrapper'

export default function Agent6Page() {
  return (
    <AgentPageWrapper
      agentId={6}
      title="Resolution Verification Agent"
      subtitle="Verifies genuine resolution before closing complaints"
      color="#00C853"
      icon={CheckCircle}
      defaultValues={{
        original_complaint: 'Large pothole on MG Road causing accidents and vehicle damage',
        resolution_note: 'Pothole has been filled with hot mix asphalt and road surface has been leveled and compacted',
        proof_description: 'Before and after photos show the pothole completely filled. Road surface is now smooth and level.',
        citizen_confirmation: 'Yes the pothole is fixed now, road is smooth',
        issue_type: 'Pothole',
        department: 'Roads',
      }}
      buildPayload={(f) => ({
        original_complaint: f.original_complaint,
        resolution_note: f.resolution_note,
        proof_description: f.proof_description,
        citizen_confirmation: f.citizen_confirmation,
        issue_type: f.issue_type,
        department: f.department,
      })}
      resultRenderer={(result) => {
        const verified = result.verified === true || result.verified === 'true'
        const decision = String(result.decision || '')
        const decisionColor = decision === 'Close' ? '#00C853' : decision === 'Reopen' ? '#ff4444' : '#FFC857'
        return (
          <div className="space-y-3">
            <div className="p-5 rounded-xl text-center" style={{
              background: verified ? 'rgba(0,200,83,0.1)' : 'rgba(255,68,68,0.1)',
              border: `1px solid ${verified ? 'rgba(0,200,83,0.4)' : 'rgba(255,68,68,0.4)'}`
            }}>
              <div className="text-4xl mb-1">{verified ? '✅' : '❌'}</div>
              <div className="text-2xl font-bold" style={{ color: verified ? '#00C853' : '#ff4444', fontFamily: 'Space Grotesk' }}>
                {verified ? 'VERIFIED' : 'NOT VERIFIED'}
              </div>
              <div className="text-sm mt-1" style={{ color: 'rgba(248,250,252,0.5)' }}>
                {verified ? 'Resolution confirmed genuine' : 'Resolution requires review'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ResultCard label="Decision" value={decision} color={decisionColor} large />
              <ResultCard label="Confidence" value={`${Math.round(Number(result.confidence || 0) * 100)}%`} color="#00C853" large />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {result.resolution_quality && <ResultCard label="Resolution Quality" value={String(result.resolution_quality)} color="#FFC857" />}
              {result.citizen_satisfaction && <ResultCard label="Citizen Satisfaction" value={String(result.citizen_satisfaction)} color="#00D4FF" />}
            </div>
            {result.reason && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(0,200,83,0.05)', border: '1px solid rgba(0,200,83,0.15)' }}>
                <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: 'rgba(248,250,252,0.4)' }}>Verification Reason</div>
                <p className="text-sm" style={{ color: '#F8FAFC' }}>{String(result.reason)}</p>
              </div>
            )}
          </div>
        )
      }}
    >
      {(formData, setFormData) => (
        <>
          <FormField label="Original Complaint *">
            <FormTextarea value={formData.original_complaint} onChange={v => setFormData(p => ({ ...p, original_complaint: v }))}
              placeholder="What was the original complaint?" rows={3} />
          </FormField>
          <FormField label="Officer Resolution Note *">
            <FormTextarea value={formData.resolution_note} onChange={v => setFormData(p => ({ ...p, resolution_note: v }))}
              placeholder="What did the officer do to resolve it?" rows={3} />
          </FormField>
          <FormField label="Proof Description">
            <FormTextarea value={formData.proof_description} onChange={v => setFormData(p => ({ ...p, proof_description: v }))}
              placeholder="Describe the proof (photo/video description)..." rows={2} />
          </FormField>
          <FormField label="Citizen Feedback">
            <FormInput value={formData.citizen_confirmation} onChange={v => setFormData(p => ({ ...p, citizen_confirmation: v }))}
              placeholder="e.g. Yes the issue is fixed" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Issue Type">
              <FormInput value={formData.issue_type} onChange={v => setFormData(p => ({ ...p, issue_type: v }))}
                placeholder="e.g. Pothole" />
            </FormField>
            <FormField label="Department">
              <FormInput value={formData.department} onChange={v => setFormData(p => ({ ...p, department: v }))}
                placeholder="e.g. Roads" />
            </FormField>
          </div>
        </>
      )}
    </AgentPageWrapper>
  )
}
