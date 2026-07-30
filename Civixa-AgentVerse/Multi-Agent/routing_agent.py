import os
import json
import google.generativeai as genai

class RoutingAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def route(self, understanding_data: dict) -> str:
        prompt = f"""
        You are the 'Department Routing Agent'.
        Based on this issue: "{understanding_data['core_issue']}", which government department should handle it?
        Examples: Water Supply, Roads & Transport, Electricity, Sanitation.
        
        Return ONLY a JSON object with 'department' as a string.
        """
        response = self.model.generate_content(prompt)
        text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(text).get('department', 'General Administration')
