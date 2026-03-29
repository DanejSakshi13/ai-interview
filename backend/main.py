# # main.py
# from fastapi import FastAPI, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# import pdfplumber

# from interview_engine import generate_first_question
# from evaluation_engine import evaluate_answer

# app = FastAPI()

# # CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # ====================== Upload Resume ======================
# @app.post("/upload-resume")
# async def upload_resume(file: UploadFile = File(...)):
#     contents = await file.read()

#     # Save temporarily
#     with open("temp.pdf", "wb") as f:
#         f.write(contents)

#     # Extract text
#     text = ""
#     with pdfplumber.open("temp.pdf") as pdf:
#         for page in pdf.pages:
#             text += (page.extract_text() or "") + "\n"

#     resume_text = text.strip()[:12000]  # Safe limit for Gemini

#     # Generate first question
#     first_question = generate_first_question(resume_text)

#     return {
#         "question": first_question,
#         "resume_text": resume_text
#     }


# # ====================== Answer Question ======================
# class AnswerRequest(BaseModel):
#     resume_text: str
#     question: str
#     answer: str
#     history: str = ""   # Previous Q&A as string


# @app.post("/answer-question")
# async def answer_question(req: AnswerRequest):
#     result = evaluate_answer(
#         resume_text=req.resume_text,
#         question=req.question,
#         answer=req.answer,
#         history=req.history
#     )
#     return result

#     # uvicorn main:app --reload





# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
import re

from interview_engine import generate_first_question
from evaluation_engine import evaluate_answer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Common resume keywords (case-insensitive)
RESUME_KEYWORDS = [
    "experience", "education", "skill", "project", "work", "employment", 
    "summary", "objective", "career", "professional", "qualification",
    "bachelor", "master", "phd", "university", "college", "internship"
]

def is_likely_resume(text: str) -> bool:
    """Simple but effective resume validation"""
    if not text or len(text.strip()) < 100:
        return False
    
    text_lower = text.lower()
    
    # Count how many resume-related keywords appear
    keyword_count = sum(1 for keyword in RESUME_KEYWORDS if keyword in text_lower)
    
    # Check for common resume patterns
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text))
    has_phone = bool(re.search(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}', text))
    has_date = bool(re.search(r'\b(19|20)\d{2}\b', text))  # years like 2020, 2015 etc.
    
    # A good resume usually has at least 3 keywords + contact info
    return keyword_count >= 3 or (has_email and (has_phone or has_date))


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    # Step 1: Check file extension
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400, 
            detail="Only PDF files are allowed. Please upload a resume in PDF format."
        )

    # Step 2: Read file content
    contents = await file.read()

    # Step 3: Extract text safely
    text = ""
    try:
        with open("temp.pdf", "wb") as f:
            f.write(contents)

        with pdfplumber.open("temp.pdf") as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail="Invalid or corrupted PDF file. Please upload a valid resume PDF."
        )

    if len(text.strip()) < 50:
        raise HTTPException(
            status_code=400, 
            detail="The uploaded document appears to be empty or unreadable."
        )

    # Step 4: Resume validation
    if not is_likely_resume(text):
        raise HTTPException(
            status_code=400,
            detail="The uploaded document does not appear to be a resume. Please upload a proper resume PDF containing sections like Experience, Education, Skills, or Projects."
        )

    # If we reach here → it's likely a valid resume
    resume_text = text.strip()[:12000]  # Safe limit

    # Generate first question
    first_question = generate_first_question(resume_text)

    return {
        "question": first_question,
        "resume_text": resume_text,
        "message": "Resume validated successfully!"
    }


# Keep your existing /answer-question endpoint unchanged
class AnswerRequest(BaseModel):
    resume_text: str
    question: str
    answer: str
    history: str = ""
    question_count: int = 1


@app.post("/answer-question")
async def answer_question(req: AnswerRequest):
    result = evaluate_answer(
        resume_text=req.resume_text,
        question=req.question,
        answer=req.answer,
        history=req.history,
        question_count=req.question_count
    )
    return result