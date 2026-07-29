# Civixa AI — Multi-Agent Public Grievance Resolution Platform

> AI-Powered autonomous platform that transforms civic complaints into resolved actions through 6 independent AI agents.

---

## Architecture

```
citizen input
     │
     ▼
React Frontend (port 5173)
     │
     ▼
Express.js Backend / API Gateway (port 5000)
     │
     ├──► Agent 1: Complaint Understanding  (port 8001) — Gemini 1.5 Flash
     ├──► Agent 2: Duplicate Detection      (port 8002) — Sentence Transformers
     ├──► Agent 3: Department Routing       (port 8003) — Gemini 1.5 Flash
     ├──► Agent 4: Priority Assessment      (port 8004) — Gemini 1.5 Flash
     ├──► Agent 5: Officer Assignment       (port 8005) — Gemini 1.5 Flash
     └──► Agent 6: Resolution Verification  (port 8006) — Gemini 1.5 Flash
     │
     ▼
PostgreSQL Database
```

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (optional — app works without it using mock data)
- Google Gemini API Key (free at https://aistudio.google.com)

### Step 1 — Get Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Create a free API key
3. Add it to each agent's `.env` file:

```
agents/agent1_complaint_understanding/.env
agents/agent3_department_routing/.env
agents/agent4_priority_assessment/.env
agents/agent5_officer_assignment/.env
agents/agent6_resolution_verification/.env
```

Set: `GEMINI_API_KEY=your_actual_key_here`

### Step 2 — Install Dependencies
```
Double-click INSTALL.bat
```
Or manually:
```bash
# Each agent
cd agents/agent1_complaint_understanding && pip install -r requirements.txt

# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Step 3 — Start Everything
```
Double-click START_ALL.bat
```
Or manually in separate terminals:
```bash
# Agent 1
cd agents/agent1_complaint_understanding && uvicorn main:app --port 8001 --reload

# Agent 2
cd agents/agent2_duplicate_detection && uvicorn main:app --port 8002 --reload

# Agent 3
cd agents/agent3_department_routing && uvicorn main:app --port 8003 --reload

# Agent 4
cd agents/agent4_priority_assessment && uvicorn main:app --port 8004 --reload

# Agent 5
cd agents/agent5_officer_assignment && uvicorn main:app --port 8005 --reload

# Agent 6
cd agents/agent6_resolution_verification && uvicorn main:app --port 8006 --reload

# Backend
cd backend && node server.js

# Frontend
cd frontend && npm run dev
```

---

## Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Agent 1 Swagger | http://localhost:8001/docs |
| Agent 2 Swagger | http://localhost:8002/docs |
| Agent 3 Swagger | http://localhost:8003/docs |
| Agent 4 Swagger | http://localhost:8004/docs |
| Agent 5 Swagger | http://localhost:8005/docs |
| Agent 6 Swagger | http://localhost:8006/docs |

---

## The 6 AI Agents

### Agent 1 — Complaint Understanding Agent
- **Port:** 8001
- **Endpoint:** `POST /understand`
- **Tech:** Google Gemini 1.5 Flash
- **Input:** text / voice / image / video complaint
- **Output:** structured JSON with summary, department, severity, keywords, confidence

### Agent 2 — Duplicate Detection Agent
- **Port:** 8002
- **Endpoint:** `POST /detect-duplicate`
- **Tech:** Sentence Transformers (all-MiniLM-L6-v2), cosine similarity
- **Input:** new complaint + list of existing complaints
- **Output:** is_duplicate, similarity score, decision (Merge/New)

### Agent 3 — Department Routing Agent
- **Port:** 8003
- **Endpoint:** `POST /route`
- **Tech:** Google Gemini 1.5 Flash
- **Input:** complaint summary, issue type, keywords
- **Output:** department, confidence, routing reason

### Agent 4 — Priority Assessment Agent
- **Port:** 8004
- **Endpoint:** `POST /priority`
- **Tech:** Google Gemini 1.5 Flash
- **Input:** complaint details, severity
- **Output:** priority (Low/Medium/High/Critical), score 0-100, risk, response time

### Agent 5 — Officer Assignment Agent
- **Port:** 8005
- **Endpoint:** `POST /assign`
- **Tech:** Google Gemini 1.5 Flash
- **Input:** complaint + list of available officers
- **Output:** assigned officer, assignment score, reason

### Agent 6 — Resolution Verification Agent
- **Port:** 8006
- **Endpoint:** `POST /verify`
- **Tech:** Google Gemini 1.5 Flash
- **Input:** original complaint, resolution note, proof description, citizen feedback
- **Output:** verified (true/false), decision (Close/Reopen/Partial), confidence

---

## API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/complaints | Full pipeline (all 6 agents) |
| GET | /api/complaints | List all complaints |
| POST | /api/verify | Verify resolution |
| GET | /api/stats | Analytics stats |
| GET | /agents/health | All agent health status |
| POST | /api/agent/understand | Direct Agent 1 |
| POST | /api/agent/duplicate | Direct Agent 2 |
| POST | /api/agent/route | Direct Agent 3 |
| POST | /api/agent/priority | Direct Agent 4 |
| POST | /api/agent/assign | Direct Agent 5 |
| POST | /api/agent/verify | Direct Agent 6 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 + Glassmorphism |
| Animations | Framer Motion |
| Particles | tsParticles |
| Icons | Lucide React |
| Backend | Express.js + Node.js |
| Database | PostgreSQL (pg) |
| AI Agents | FastAPI + Python |
| LLM | Google Gemini 1.5 Flash |
| Embeddings | Sentence Transformers (all-MiniLM-L6-v2) |

---

## Demo Flow for Presentation

1. Open http://localhost:5173
2. Go to **AI Agents** page — test each agent individually with pre-filled examples
3. Go to **File Complaint** page — submit a complaint through the full pipeline
4. Go to **Dashboard** — see agent health, stats, and analytics
5. Open http://localhost:8001/docs — show Swagger UI for individual agent

---

## Project Structure

```
CIVIXA_AI/
├── agents/
│   ├── agent1_complaint_understanding/   (port 8001)
│   ├── agent2_duplicate_detection/       (port 8002)
│   ├── agent3_department_routing/        (port 8003)
│   ├── agent4_priority_assessment/       (port 8004)
│   ├── agent5_officer_assignment/        (port 8005)
│   └── agent6_resolution_verification/   (port 8006)
├── backend/                              (port 5000)
│   ├── server.js
│   └── .env
├── frontend/                             (port 5173)
│   └── src/
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── AgentsPage.tsx
│       │   ├── ComplaintPage.tsx
│       │   └── DashboardPage.tsx
│       └── components/
│           ├── Navbar.tsx
│           └── ParticleBackground.tsx
├── START_ALL.bat
├── INSTALL.bat
└── README.md
```
