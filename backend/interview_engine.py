# interview_engine.py
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-2.5-flash")


def generate_first_question(resume_text: str) -> str:
    prompt = f"""
You are a friendly senior software engineering interviewer.

Candidate Resume:
{resume_text}

Ask ONE short, natural, and engaging first technical question based on the candidate's most recent or strongest project.
Keep the question to 1-2 short sentences maximum. Make it sound like a real human interviewer.

Return ONLY the question. No extra text.
"""

    response = model.generate_content(prompt)
    return response.text.strip()