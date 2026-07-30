import os
import json
import google.generativeai as genai

class PriorityAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def assess(self, understanding_data: dict) -> str:
        prompt = f"""
        You are the 'Priority Assessment Agent'.
        Based on this issue: "{understanding_data['core_issue']}", what is the urgency level?
        Levels: Low, Medium, High, Critical.
        
        Return ONLY a JSON object with 'priority' as a string.
        """
        response = self.model.generate_content(prompt)
        text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(text).get('priority', 'Medium')
