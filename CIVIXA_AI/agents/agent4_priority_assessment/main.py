from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from google import genai
import json, re, os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Priority Assessment Agent", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ComplaintInput(BaseModel):
    complaint_summary: str
    issue_type: Optional[str] = ""
    department: Optional[str] = ""
    location: Optional[str] = ""
    keywords: Optional[List[str]] = []
    severity: Optional[str] = ""

PROMPT = """
You are a Priority Assessment Agent for Civixa AI, India's AI-powered public grievance platform.

Complaint Details:
- Summary: {summary}
- Issue Type: {issue_type}
- Department: {department}
- Location: {location}
- Keywords: {keywords}
- Initial Severity: {severity}

Assess the priority of this complaint considering:
1. Public safety risk (highest weight)
2. Number of people affected
3. Infrastructure damage potential
4. Emergency keywords (fire, flood, electric shock, collapse, accident)
5. Health hazards
6. Duration of impact

Return ONLY a valid JSON:
{{
  "priority": "Low | Medium | High | Critical",
  "score": integer from 0 to 100,
  "risk": "Low | Medium | High | Critical",
  "reason": "detailed explanation of priority assessment",
  "affected_population": "estimated number or range of people affected",
  "recommended_response_time": "e.g. 2 hours, 24 hours, 3 days, 1 week"
}}

Priority scoring guide:
- Critical (85-100): Immediate life/safety threat, large population affected
- High (65-84): Major disruption, health risk, infrastructure damage
- Medium (40-64): Significant inconvenience, moderate impact
- Low (0-39): Minor issue, few people affected
"""

@app.post("/priority")
async def assess_priority(complaint: ComplaintInput):
    prompt = PROMPT.format(
        summary=complaint.complaint_summary,
        issue_type=complaint.issue_type,
        department=complaint.department,
        location=complaint.location,
        keywords=", ".join(complaint.keywords) if complaint.keywords else "none",
        severity=complaint.severity or "Not specified"
    )
    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
    text = response.text.strip()
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    return json.loads(text)

@app.get("/")
async def root():
    return {"agent": "Priority Assessment Agent", "status": "online", "port": 8004, "endpoints": ["/priority", "/health", "/docs"]}

@app.get("/health")
async def health():
    return {"agent": "Priority Assessment Agent", "status": "online"}
