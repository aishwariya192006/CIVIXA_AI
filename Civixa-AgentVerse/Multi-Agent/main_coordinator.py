import os
import json
from dotenv import load_dotenv

# Import agents
from understanding_agent import UnderstandingAgent
from duplicate_detection_agent import DuplicateDetectionAgent
from routing_agent import RoutingAgent
from priority_agent import PriorityAgent
from assignment_agent import AssignmentAgent
from notification_agent import NotificationAgent

def run_multi_agent_pipeline():
    load_dotenv(dotenv_path="../../.env")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment variables.")
        exit(1)

    print("=== Initializing Multi-Agent System ===\n")
    understanding_agent = UnderstandingAgent(api_key)
    duplicate_agent = DuplicateDetectionAgent(api_key)
    routing_agent = RoutingAgent(api_key)
    priority_agent = PriorityAgent(api_key)
    assignment_agent = AssignmentAgent(api_key)
    notification_agent = NotificationAgent(api_key)

    complaint_text = "There is a massive power outage in the downtown area affecting the hospital."
    print(f"New Complaint: '{complaint_text}'\n")

    # Step 1: Understanding
    print("[Agent 1: Understanding] Analyzing complaint...")
    understanding_data = understanding_agent.analyze(complaint_text)
    print(f"Result: {understanding_data}\n")

    # Step 2: Duplicate Detection
    print("[Agent 2: Duplicate Detection] Checking for duplicates...")
    duplicate_data = duplicate_agent.check(understanding_data)
    print(f"Result: {duplicate_data}\n")

    # Step 3: Routing
    print("[Agent 3: Routing] Determining department...")
    department = routing_agent.route(understanding_data)
    print(f"Result: {department}\n")

    # Step 4: Priority Assessment
    print("[Agent 4: Priority] Assessing urgency...")
    priority = priority_agent.assess(understanding_data)
    print(f"Result: {priority}\n")

    # Step 5: Assignment
    print("[Agent 5: Assignment] Finding officer...")
    officer = assignment_agent.assign(department, priority)
    print(f"Result: {officer}\n")

    # Step 6: Notification
    print("[Agent 6: Notification] Generating response...")
    message = notification_agent.generate_message(complaint_text, department, priority)
    print(f"Result: {message}\n")

    print("=== Pipeline Complete ===")
    print("Final Output State:")
    print(json.dumps({
        "core_issue": understanding_data.get("core_issue"),
        "location": understanding_data.get("location"),
        "is_duplicate": duplicate_data.get("is_duplicate"),
        "matched_id": duplicate_data.get("matched_id"),
        "department": department,
        "priority": priority,
        "assigned_officer_role": officer,
        "notification_message": message
    }, indent=4))


if __name__ == "__main__":
    run_multi_agent_pipeline()
