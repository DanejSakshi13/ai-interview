import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("models/gemini-2.5-flash")

def generate_question(resume_text: str):

    prompt = f"""
You are a senior software engineering interviewer.

Candidate Resume:
{resume_text}

Ask ONE technical interview question based on the candidate's experience.
Return only the question.
"""

    response = model.generate_content(prompt)

    return response.text