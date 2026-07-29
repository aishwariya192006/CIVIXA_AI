from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from google import genai
import json, re, os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Department Routing Agent", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DEPARTMENTS = {
    "Water Supply": "water leaks, pipe burst, no water supply, contaminated water, low pressure",
    "Electricity": "power outage, electric shock risk, broken transformer, street light, voltage fluctuation",
    "Sanitation": "open defecation, public toilet, sewage overflow, drain blockage",
    "Roads": "pothole, road damage, broken road, road cave-in, road construction",
    "Drainage": "waterlogging, blocked drain, flooding, stormwater",
    "Traffic": "signal malfunction, traffic jam, illegal parking, road accident",
    "Public Works": "bridge damage, government building, public infrastructure",
    "Street Lighting": "street light not working, dark road, broken lamp post",
    "Parks": "park maintenance, broken bench, overgrown grass, playground damage",
    "Waste Management": "garbage not collected, overflowing bin, illegal dumping, littering"
}

class ComplaintInput(BaseModel):
    complaint_summary: str
    issue_type: Optional[str] = ""
    keywords: Optional[list] = []
    location: Optional[str] = ""

PROMPT = """
You are a Department Routing Agent for Civixa AI, India's AI-powered grievance platform.

Complaint Summary: {summary}
Issue Type: {issue_type}
Keywords: {keywords}
Location: {location}

Available Departments and their scope:
{dept_info}

Analyze the complaint and return ONLY a valid JSON:
{{
  "department": "exact department name from the list",
  "confidence": number between 0.0 and 1.0,
  "reason": "brief explanation of why this department was chosen"
}}
"""

@app.post("/route")
async def route_complaint(complaint: ComplaintInput):
    dept_info = "\n".join([f"- {k}: {v}" for k, v in DEPARTMENTS.items()])
    prompt = PROMPT.format(
        summary=complaint.complaint_summary,
        issue_type=complaint.issue_type,
        keywords=", ".join(complaint.keywords) if complaint.keywords else "none",
        location=complaint.location,
        dept_info=dept_info
    )
    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
    text = response.text.strip()
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    return json.loads(text)

@app.get("/")
async def root():
    return {"agent": "Department Routing Agent", "status": "online", "port": 8003, "endpoints": ["/route", "/health", "/docs"]}

@app.get("/health")
async def health():
    return {"agent": "Department Routing Agent", "status": "online"}
