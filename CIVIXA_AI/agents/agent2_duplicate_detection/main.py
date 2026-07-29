from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = FastAPI(title="Duplicate Detection Agent", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

embedder = SentenceTransformer("all-MiniLM-L6-v2")

SIMILARITY_THRESHOLD = 0.82

class Complaint(BaseModel):
    id: str
    summary: str
    location: Optional[str] = ""
    department: Optional[str] = ""

class DuplicateRequest(BaseModel):
    new_complaint: Complaint
    existing_complaints: List[Complaint]

def build_text(c: Complaint) -> str:
    return f"{c.summary} {c.location or ''} {c.department or ''}".strip()

@app.post("/detect-duplicate")
async def detect_duplicate(req: DuplicateRequest):
    if not req.existing_complaints:
        return {"is_duplicate": False, "matched_complaint_id": None, "similarity": 0, "decision": "New Complaint"}

    new_text = build_text(req.new_complaint)
    existing_texts = [build_text(c) for c in req.existing_complaints]

    all_texts = [new_text] + existing_texts
    embeddings = embedder.encode(all_texts)

    new_emb = embeddings[0].reshape(1, -1)
    existing_embs = embeddings[1:]

    similarities = cosine_similarity(new_emb, existing_embs)[0]
    max_idx = int(np.argmax(similarities))
    max_sim = float(similarities[max_idx])
    similarity_pct = round(max_sim * 100, 2)

    is_dup = max_sim >= SIMILARITY_THRESHOLD
    matched_id = req.existing_complaints[max_idx].id if is_dup else None
    decision = "Merge" if is_dup else "New Complaint"

    return {
        "is_duplicate": is_dup,
        "matched_complaint_id": matched_id,
        "similarity": similarity_pct,
        "decision": decision
    }

@app.get("/")
async def root():
    return {"agent": "Duplicate Detection Agent", "status": "online", "port": 8002, "endpoints": ["/detect-duplicate", "/health", "/docs"]}

@app.get("/health")
async def health():
    return {"agent": "Duplicate Detection Agent", "status": "online"}
