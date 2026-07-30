import os
import json
import google.generativeai as genai

EXISTING_COMPLAINTS = [
    {"id": "C-101", "title": "Pothole on Main Street", "status": "In Progress"},
    {"id": "C-102", "title": "No water in Sector 4", "status": "Assigned"}
]

class DuplicateDetectionAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def check(self, understanding_data: dict) -> dict:
        prompt = f"""
        You are the 'Duplicate Detection Agent'.
        Compare this new complaint data: {json.dumps(understanding_data)}
        with our existing unresolved issues: {json.dumps(EXISTING_COMPLAINTS)}
        
        Determine if this new complaint is a duplicate.
        Return ONLY a JSON object with 'is_duplicate' (boolean) and 'matched_id' (string or null).
        """
        response = self.model.generate_content(prompt)
        text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(text)
