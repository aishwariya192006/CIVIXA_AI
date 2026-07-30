import os
import json
import google.generativeai as genai

class AssignmentAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def assign(self, department: str, priority: str) -> str:
        prompt = f"""
        You are the 'Officer Assignment Agent'.
        An issue in the "{department}" department has been flagged as "{priority}" priority.
        Suggest the title of the officer who should handle this (e.g., "Chief Engineer", "Field Officer").
        
        Return ONLY a JSON object with 'officer_role' as a string.
        """
        response = self.model.generate_content(prompt)
        text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(text).get('officer_role', 'Assigned Officer')
