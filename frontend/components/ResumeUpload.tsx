"use client"

import { useState } from "react"
import InterviewChat from "./InterviewChat"

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [firstQuestion, setFirstQuestion] = useState<string | null>(null)

  const handleUpload = async () => {

    if (!file) {
      alert("Please select a resume first")
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("http://127.0.0.1:8000/upload-resume", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      setFirstQuestion(data.question)

    } catch (error) {
      console.error(error)
      alert("Upload failed")
    } finally {
      setLoading(false)
    }
  }

  if (firstQuestion) {
    return <InterviewChat firstQuestion={firstQuestion} />
  }

  return (
    <div className="flex flex-col gap-4 items-center border p-6 rounded-lg">

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="border p-2 rounded"
      />

      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload Resume"}
      </button>

    </div>
  )
}