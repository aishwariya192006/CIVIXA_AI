import os
import json
import google.generativeai as genai

class UnderstandingAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def analyze(self, complaint_text: str) -> dict:
        prompt = f"""
        You are the 'Complaint Understanding Agent'.
        Extract the core issue and specific location from the following citizen complaint.
        
        Complaint: "{complaint_text}"
        
        Return ONLY a JSON object with 'core_issue' and 'location'.
        """
        response = self.model.generate_content(prompt)
        text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(text)
