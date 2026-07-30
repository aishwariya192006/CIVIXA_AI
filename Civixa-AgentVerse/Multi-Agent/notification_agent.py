import os
import json
import google.generativeai as genai

class NotificationAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_message(self, complaint_text: str, department: str, priority: str) -> str:
        prompt = f"""
        You are the 'Citizen Notification Agent'.
        Write a brief, polite SMS/Email notification (max 2 sentences) to the citizen confirming their issue 
        has been received, routed to the {department} department, and logged with {priority} priority.
        
        Return ONLY a JSON object with 'message' as a string.
        """
        response = self.model.generate_content(prompt)
        text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(text).get('message', 'Your complaint has been received and routed successfully.')
