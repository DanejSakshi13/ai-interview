"use client";

import { useState } from "react";
import InterviewChat from "./InterviewChat";

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [firstQuestion, setFirstQuestion] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Upload failed. Please try again.");
        setLoading(false);
        return;
      }

      setFirstQuestion(data.question);
      setResumeText(data.resume_text);
      setError(null);
    } catch (err) {
      setError("Failed to connect to server. Please make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (firstQuestion && resumeText) {
    return <InterviewChat firstQuestion={firstQuestion} resumeText={resumeText} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-zinc-950 border border-white/10 rounded-3xl max-w-lg w-full p-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-8 border border-white rounded-full flex items-center justify-center text-sm font-bold">IA</div>
            <span className="text-2xl font-medium tracking-tighter">InterviewAI</span>
          </div>
          <h1 className="text-4xl font-medium tracking-tight">Voice Interview</h1>
          <p className="text-gray-400 mt-3">Upload your resume to begin a realistic mock interview</p>
        </div>

        <div
          className="border-2 border-dashed border-white/30 hover:border-white/60 rounded-3xl p-16 text-center transition cursor-pointer"
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <div className="text-7xl mb-6 opacity-70">📄</div>
          <p className="text-xl font-medium">Drop your resume PDF here</p>
          <p className="text-sm text-gray-500 mt-3">Only PDF files • Must be a proper resume</p>
        </div>

        <input
          id="file-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0] || null;
            setFile(selected);
            setError(null);
          }}
        />

        {file && (
          <div className="mt-8 p-5 bg-zinc-900 rounded-2xl flex items-center gap-4 border border-white/10">
            <span className="text-3xl">📄</span>
            <div className="truncate text-sm font-medium">{file.name}</div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-5 bg-red-950/50 border border-red-800 text-red-400 rounded-2xl text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full mt-10 border border-white py-5 rounded-full font-medium text-lg hover:bg-white hover:text-black transition-all disabled:opacity-40"
        >
          {loading ? "Validating Resume..." : "Start Voice Interview"}
        </button>

        <p className="text-center text-xs text-gray-500 mt-8">
          Only PDF resumes are accepted. Other documents will be rejected automatically.
        </p>
      </div>
    </div>
  );
}