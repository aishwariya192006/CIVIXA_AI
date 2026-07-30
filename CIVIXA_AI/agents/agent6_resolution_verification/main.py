from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from google import genai
import json, re, os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Resolution Verification Agent", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class VerificationRequest(BaseModel):
    original_complaint: str
    issue_type: Optional[str] = ""
    department: Optional[str] = ""
    resolution_note: str
    proof_description: Optional[str] = ""
    citizen_confirmation: Optional[str] = ""
    days_taken: Optional[int] = None

PROMPT = """
You are a Resolution Verification Agent for Civixa AI, India's AI-powered grievance platform.

Original Complaint: {complaint}
Issue Type: {issue_type}
Department: {department}

Resolution Submitted by Officer:
- Resolution Note: {resolution_note}
- Proof Description: {proof_description}
- Days Taken: {days_taken}

Citizen Feedback: {citizen_confirmation}

Verify whether this complaint has been genuinely resolved by analyzing:
1. Does the resolution note address the original complaint?
2. Does the proof description confirm the work was done?
3. Is the citizen satisfied (if feedback provided)?
4. Is the resolution complete or partial?
5. Are there any red flags suggesting fake resolution?

Return ONLY a valid JSON:
{{
  "verified": true or false,
  "confidence": number between 0.0 and 1.0,
  "decision": "Close | Reopen | Partial Resolution",
  "reason": "detailed explanation of verification decision",
  "resolution_quality": "Excellent | Good | Acceptable | Poor",
  "citizen_satisfaction": "Satisfied | Neutral | Dissatisfied | Unknown"
}}

Decision rules:
- Close: complaint fully resolved, proof matches, citizen satisfied or neutral
- Reopen: resolution is fake, incomplete, or citizen reports issue persists
- Partial Resolution: some work done but issue not fully resolved
"""

@app.post("/verify")
async def verify_resolution(req: VerificationRequest):
    prompt = PROMPT.format(
        complaint=req.original_complaint,
        issue_type=req.issue_type,
        department=req.department,
        resolution_note=req.resolution_note,
        proof_description=req.proof_description or "No proof provided",
        days_taken=req.days_taken or "Not specified",
        citizen_confirmation=req.citizen_confirmation or "No feedback provided"
    )
    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
    text = response.text.strip()
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    return json.loads(text)

@app.get("/")
async def root():
    return {"agent": "Resolution Verification Agent", "status": "online", "port": 8006, "endpoints": ["/verify", "/health", "/docs"]}

@app.get("/health")
async def health():
    return {"agent": "Resolution Verification Agent", "status": "online"}
