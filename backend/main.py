from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
import re
import json

from interview_engine import generate_first_question
from evaluation_engine import evaluate_answer

app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],                    # Change to your Vercel URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RESUME_KEYWORDS = ["experience", "education", "skill", "project", "work", "employment", "summary", "objective", "career", "professional", "qualification", "bachelor", "master", "phd", "university", "college", "internship"]

def is_likely_resume(text: str) -> bool:
    if not text or len(text.strip()) < 100: return False
    text_lower = text.lower()
    keyword_count = sum(1 for k in RESUME_KEYWORDS if k in text_lower)
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text))
    has_phone = bool(re.search(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}', text))
    has_date = bool(re.search(r'\b(19|20)\d{2}\b', text))
    return keyword_count >= 3 or (has_email and (has_phone or has_date))


@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    jd: str = Form(""),
    mood: str = Form("Professional")
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are allowed.")

    contents = await file.read()
    text = ""

    try:
        with open("temp.pdf", "wb") as f:
            f.write(contents)
        with pdfplumber.open("temp.pdf") as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception:
        raise HTTPException(400, "Invalid or corrupted PDF.")

    if len(text.strip()) < 50 or not is_likely_resume(text):
        raise HTTPException(400, "Please upload a proper resume PDF.")

    resume_text = text.strip()[:12000]

    first_question = generate_first_question(resume_text, jd, mood)

    return {
        "question": first_question,
        "resume_text": resume_text,
        "jd": jd,
        "mood": mood,
        "message": "Resume validated successfully!"
    }


class AnswerRequest(BaseModel):
    resume_text: str
    jd: str = ""
    mood: str = "Professional"
    question: str
    answer: str
    history: str = ""
    question_count: int = 1


@app.post("/answer-question")
async def answer_question(req: AnswerRequest):
    result = evaluate_answer(
        resume_text=req.resume_text,
        jd=req.jd,
        mood=req.mood,
        question=req.question,
        answer=req.answer,
        history=req.history,
        question_count=req.question_count
    )
    return result


class ReportRequest(BaseModel):
    resume_text: str
    jd: str
    mood: str
    messages: list


@app.post("/generate-report")
async def generate_report(req: ReportRequest):
    # Simple but effective full-report prompt
    conversation = "\n".join([f"{m['role'].upper()}: {m['text']}" for m in req.messages])
    
    prompt = f"""
You are an expert interview coach. Analyze the full interview below.

Resume: {req.resume_text[:8000]}
Job Description: {req.jd or "General role"}
Interview Style: {req.mood}

Full Conversation:
{conversation}

Generate a professional, beautiful post-interview report with:
- Overall Score (average)
- Strengths (3-4 bullets)
- Areas of Improvement (3-4 bullets with specific examples)
- STAR feedback where applicable
- System design / technical depth comments
- Final actionable tips

Return in clean markdown format.
"""

    response = model.generate_content(prompt)  # using global model from evaluation_engine
    return {"report": response.text.strip()}