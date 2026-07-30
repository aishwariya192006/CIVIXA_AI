import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path="../.env")

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found in environment variables.")
    exit(1)
genai.configure(api_key=api_key)

# Mock database of existing complaints for duplicate detection
EXISTING_COMPLAINTS = [
    {"id": "C-101", "title": "Pothole on Main Street", "status": "In Progress"},
    {"id": "C-102", "title": "No water in Sector 4", "status": "Assigned"}
]

class GrievanceSingleAgent:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def process_complaint(self, complaint_text: str):
        print(f"--- Processing New Complaint ---\n{complaint_text}\n")
        
        prompt = f"""
        You are a comprehensive Public Grievance AI Agent. You handle the entire pipeline of a complaint.
        Analyze the following complaint: "{complaint_text}"

        Existing unresolved complaints in the system for context:
        {json.dumps(EXISTING_COMPLAINTS)}

        Perform the following tasks and return a JSON object:
        1. "understanding": Extract the core issue and location.
        2. "duplicate": Check if it matches any existing complaint. Return a boolean `is_duplicate` and `matched_id` (or null).
        3. "routing": Decide the exact government department to handle this (e.g., Water Supply, Roads & Transport, Electricity).
        4. "priority": Assess the urgency (Low, Medium, High, Critical) based on public impact.
        5. "assignment": Suggest an officer role to handle this (e.g., "Chief Engineer", "Maintenance Supervisor").

        Respond ONLY with a valid JSON object matching the structure above.
        """

        try:
            response = self.model.generate_content(prompt)
            # Clean up response to ensure valid JSON (remove markdown blocks if any)
            output_text = response.text.strip()
            if output_text.startswith("```json"):
                output_text = output_text[7:-3]
            elif output_text.startswith("```"):
                output_text = output_text[3:-3]
                
            result = json.loads(output_text.strip())
            
            print("=== Single-Agent Processing Complete ===")
            print(json.dumps(result, indent=4))
            return result

        except Exception as e:
            print(f"Error processing complaint: {e}")
            return None

if __name__ == "__main__":
    agent = GrievanceSingleAgent()
    
    # Test Case 1: A new unique complaint
    agent.process_complaint("There is a massive power outage in the downtown area affecting the hospital.")
    print("\n")
    
    # Test Case 2: A duplicate complaint
    agent.process_complaint("Huge pothole on Main Street, it's damaging cars.")
