from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from google import genai
import json, re, os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Officer Assignment Agent", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Officer(BaseModel):
    id: str
    name: str
    department: str
    expertise: List[str]
    current_workload: int
    location: Optional[str] = ""
    availability: str
    past_performance_score: float

class AssignmentRequest(BaseModel):
    complaint_summary: str
    department: str
    priority: str
    location: Optional[str] = ""
    issue_type: Optional[str] = ""
    officers: List[Officer]

PROMPT = """
You are an Officer Assignment Agent for Civixa AI, India's AI-powered grievance platform.

Complaint Details:
- Summary: {summary}
- Department: {department}
- Priority: {priority}
- Location: {location}
- Issue Type: {issue_type}

Available Officers:
{officers_info}

Select the BEST officer considering:
1. Department match (must match)
2. Expertise relevance to the issue
3. Current workload (lower is better)
4. Availability (Available > Busy, never assign to On Leave)
5. Location proximity
6. Past performance score (higher is better)
7. For Critical/High priority, prefer officers with lower workload

Return ONLY a valid JSON:
{{
  "assigned_officer": "officer name",
  "officer_id": "officer id",
  "assignment_score": number from 0 to 100,
  "reason": "explanation of why this officer was selected",
  "estimated_response_time": "e.g. 30 minutes, 2 hours"
}}
"""

@app.post("/assign")
async def assign_officer(req: AssignmentRequest):
    officers_info = ""
    for o in req.officers:
        officers_info += f"""
Officer: {o.name} (ID: {o.id})
  Department: {o.department}
  Expertise: {', '.join(o.expertise)}
  Current Workload: {o.current_workload} active complaints
  Location: {o.location or 'Not specified'}
  Availability: {o.availability}
  Performance Score: {o.past_performance_score}
"""
    prompt = PROMPT.format(
        summary=req.complaint_summary,
        department=req.department,
        priority=req.priority,
        location=req.location,
        issue_type=req.issue_type,
        officers_info=officers_info
    )
    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
    text = response.text.strip()
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    return json.loads(text)

@app.get("/")
async def root():
    return {"agent": "Officer Assignment Agent", "status": "online", "port": 8005, "endpoints": ["/assign", "/health", "/docs"]}

@app.get("/health")
async def health():
    return {"agent": "Officer Assignment Agent", "status": "online"}
