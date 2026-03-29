# evaluation_engine.py
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-2.5-flash")


def evaluate_answer(resume_text: str, question: str, answer: str, history: str = "", question_count: int = 1):
    """
    Balanced, natural, human-like interview with depth + breadth + 10-minute pacing.
    """
    prompt = f"""
You are a senior software engineering interviewer at a FAANG-level company.
You conduct natural, professional, and well-paced technical interviews.

Candidate Resume:
{resume_text}

Previous Interview History:
{history or "This is the first question."}

Total Questions Asked So Far: {question_count}

Current Question:
{question}

Candidate's Answer:
{answer}

STRICT INTERVIEW RULES (follow exactly):
- Give meaningful depth on the current topic (usually 2–4 questions) before moving on.
- After 2–4 questions on one project/experience, make a SMOOTH, natural transition to another area of the resume.
- Use connecting phrases like a real interviewer:
  - "Building on what you shared about..."
  - "That’s a great insight — related to that, I’d like to ask about your work on..."
  - "Interesting. Let me switch to another project you mentioned..."
- Do NOT stay stuck on one project even if the answer is good.
- Goal: Cover MAXIMUM areas of the resume (multiple projects, skills, system design, behavioral, etc.) within ~10 minutes.
- Aim for 8–12 questions total. When you reach 9–11 questions, start wrapping up naturally.
- Only end the interview when major parts of the resume have been covered.

Return ONLY this exact format:

Score: X/10
Next Question: [natural next question with smooth transition if needed]

OR if you have covered enough of the resume (9+ questions):

Score: X/10
Next Question: Interview Complete. Thank you for your time! We will review your performance shortly.
"""

    response = model.generate_content(prompt)
    text = response.text.strip()

    score = "N/A"
    next_question = ""

    for line in text.split("\n"):
        line = line.strip()
        if line.startswith("Score:"):
            score = line.replace("Score:", "").strip()
        elif line.startswith("Next Question:"):
            next_question = line.replace("Next Question:", "").strip()

    return {
        "score": score,
        "next_question": next_question
    }