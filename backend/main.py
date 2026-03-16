from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber

from interview_engine import generate_question
from evaluation_engine import evaluate_answer


app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------- Upload Resume -------- #

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    contents = await file.read()

    with open("temp.pdf", "wb") as f:
        f.write(contents)

    text = ""

    with pdfplumber.open("temp.pdf") as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    question = generate_question(text[:4000])

    return {
        "question": question
    }


# -------- Interview Chat -------- #

class AnswerRequest(BaseModel):
    question: str
    answer: str


@app.post("/answer-question")
async def answer_question(req: AnswerRequest):

    print("Question:", req.question)
    print("Answer:", req.answer)

    result = evaluate_answer(req.question, req.answer)

    return result