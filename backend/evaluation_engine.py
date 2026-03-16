import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create model
model = genai.GenerativeModel("models/gemini-2.5-flash")


def evaluate_answer(question, answer):

    prompt = f"""
You are a senior software engineering interviewer.

Question:
{question}

Candidate answer:
{answer}

Evaluate the answer.

Return ONLY this format:

Score: X/10
Next Question: <next technical interview question>

Do not explain feedback.
Do not use JSON.
Do not use code blocks.
"""

    response = model.generate_content(prompt)

    text = response.text

    score = "N/A"
    next_question = ""

    lines = text.split("\n")

    for line in lines:
        if "Score:" in line:
            score = line.replace("Score:", "").strip()

        if "Next Question:" in line:
            next_question = line.replace("Next Question:", "").strip()

    return {
        "score": score,
        "next_question": next_question
    }