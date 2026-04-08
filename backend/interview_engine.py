import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-2.5-flash")


def generate_first_question(resume_text: str, jd: str = "", mood: str = "Professional") -> str:
    prompt = f"""
You are a senior software engineering interviewer conducting a {mood} interview.

Candidate Resume:
{resume_text}

Job Description:
{jd or "General software engineering role"}

Ask ONE short, warm, and natural first question.
Start light — don't jump into deep technical details immediately.
Make it engaging and human, based on the candidate's most recent or strongest project/experience.

Return ONLY the question. No extra text.
"""

    response = model.generate_content(prompt)
    return response.text.strip()