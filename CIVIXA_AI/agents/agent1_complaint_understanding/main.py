from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from google import genai
import json, re, os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="Complaint Understanding Agent", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DEPARTMENTS = ["Water Supply","Electricity","Sanitation","Roads","Drainage","Traffic","Public Works","Street Lighting","Parks","Waste Management"]

class ComplaintInput(BaseModel):
    input_type: str
    content: str
    location: Optional[str] = None

PROMPT_TEMPLATE = """
You are an AI agent for Civixa AI, a public grievance resolution platform in India.
Analyze the following civic complaint and extract structured information.

Input Type: {input_type}
Content: {content}
Provided Location: {location}

Return ONLY a valid JSON object with these exact fields:
{{
  "complaint_summary": "concise 1-2 sentence summary",
  "issue_type": "specific civic issue",
  "department": "one of: {departments}",
  "location": "extracted or provided location",
  "severity": "Low | Medium | High | Critical",
  "confidence": number between 0.0 and 1.0,
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "citizen_intent": "what the citizen wants resolved"
}}

Rules:
- severity Critical = immediate public safety risk
- severity High = major disruption affecting many people
- severity Medium = significant inconvenience
- severity Low = minor issue
- confidence reflects how clearly the complaint maps to a department
- Extract location from content if not provided
- keywords should be 3-6 relevant civic terms
"""

@app.post("/understand")
async def understand_complaint(complaint: ComplaintInput):
    prompt = PROMPT_TEMPLATE.format(
        input_type=complaint.input_type,
        content=complaint.content,
        location=complaint.location or "Not specified",
        departments=", ".join(DEPARTMENTS)
    )
    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
    text = response.text.strip()
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    return json.loads(text)

@app.get("/")
async def root():
    return {"agent": "Complaint Understanding Agent", "status": "online", "port": 8001, "endpoints": ["/understand", "/health", "/docs"]}

@app.get("/health")
async def health():
    return {"agent": "Complaint Understanding Agent", "status": "online"}
