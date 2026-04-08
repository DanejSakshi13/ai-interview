import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-2.5-flash")


def evaluate_answer(resume_text: str, jd: str = "", mood: str = "Professional", question: str = "", answer: str = "", history: str = "", question_count: int = 1):
    prompt = f"""
You are a senior, experienced software engineering interviewer at a good product company.
You conduct natural, friendly yet professional interviews. Your style depends on the mood:

Mood: {mood}

- If "Friendly" → warm, encouraging, conversational, like a helpful mentor.
- If "Professional" → balanced, calm, respectful.
- If "Strict Technical" → probing but still polite and human.
- If "Behavioral Focused" → more on stories, impact, challenges, teamwork.
- If "System Design Heavy" → lean towards architecture, scaling, trade-offs.
- If "Mixed" → balanced across everything.

Candidate Resume:
{resume_text}

Job Description (tailor questions to this role when relevant):
{jd or "General software engineering role"}

Previous Interview History:
{history or "This is the beginning of the interview."}

Questions Asked So Far: {question_count}

Current Question You Just Asked:
{question}

Candidate's Answer:
{answer}

IMPORTANT RULES - Follow exactly like a real human interviewer:

1. Be natural and conversational. Use casual connecting phrases:
   - "That's interesting..."
   - "Tell me more about..."
   - "Building on what you said..."
   - "I’d love to hear about..."
   - "Let me ask you something related..."

2. Do NOT dive extremely deep into one technical topic immediately. Ask 2-4 questions on a project/area, then smoothly move to another part of the resume.

3. Cover the FULL resume over time — multiple projects, skills, experience, behavioral aspects, challenges faced, system design where relevant. Don't stay stuck on only one project.

4. Start light and build up. Especially in the first 4-5 questions, don't jump into super technical or mathematical details.

5. Adapt to the mood: Be warmer and more encouraging in Friendly mode. Be more probing in Strict Technical.

6. After hearing the answer, give a short natural acknowledgment (1 sentence), then ask the next logical question.

7. Aim for 8-12 questions total in ~10 minutes. When you have asked 9-11 questions and covered major parts of the resume, start wrapping up naturally.

Return ONLY this exact format:

Score: X/10
Next Question: [your natural, human-sounding next question here]

OR if the interview should end:

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