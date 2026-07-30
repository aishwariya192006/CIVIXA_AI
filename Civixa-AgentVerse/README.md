# Civixa-AgentVerse

This repository demonstrates the AI Agent architecture for the **Civixa** Public Grievance Resolution Platform. It includes both a **Single-Agent** implementation and a collaborative **Multi-Agent** implementation using Google Gemini.

## 📂 Project Structure

```
📁 Civixa-AgentVerse
├── 📁 Single-Agent
│   └── grievance_single_agent.py      # Monolithic agent handling the entire pipeline
│
├── 📁 Multi-Agent
│   ├── understanding_agent.py         # Extracts core issues from complaints
│   ├── duplicate_detection_agent.py   # Checks for similar existing problems
│   ├── routing_agent.py               # Routes to the correct government department
│   ├── priority_agent.py              # Assesses urgency (Low, Medium, High, Critical)
│   ├── assignment_agent.py            # Assigns the complaint to a specific officer
│   ├── notification_agent.py          # Generates citizen notifications
│   └── main_coordinator.py            # Orchestrator that runs the agents in sequence
│
├── .env.example                       # Environment variables template
├── requirements.txt                   # Python dependencies
└── README.md
```

## ⚙️ Setup Instructions

1. **Install Dependencies**
   Ensure you have Python 3.8+ installed. Run:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**
   Rename `.env.example` to `.env` and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## 🚀 How to Run

### 🔹 Single-Agent Approach
In this approach, one monolithic agent is responsible for parsing, routing, prioritizing, and assigning the complaint in a single prompt execution.

```bash
cd Single-Agent
python grievance_single_agent.py
```

### 🔹 Multi-Agent Approach
In this approach, specialized agents collaborate in a sequential pipeline. Each agent handles a specific domain (Understanding -> Duplicates -> Routing -> Priority -> Assignment -> Notification).

```bash
cd Multi-Agent
python main_coordinator.py
```

## 🧠 Why Multi-Agent?
While the Single-Agent approach is faster to implement, the Multi-Agent approach allows for:
- **Better Accuracy:** Each agent has a specialized system prompt.
- **Scalability:** We can swap out the Routing Agent without affecting the Priority Agent.
- **Resilience:** If the Duplicate Detection agent fails, it doesn't crash the entire routing process.
