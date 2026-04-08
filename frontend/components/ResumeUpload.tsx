"use client";

import { useState, useEffect } from "react";
import InterviewChat from "./InterviewChat";

type PastInterview = {
  id: string;
  date: string;
  mood: string;
  jdSnippet: string;
  finalScore: string;
};

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [mood, setMood] = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [firstQuestion, setFirstQuestion] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [jdState, setJdState] = useState("");
  const [moodState, setMoodState] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pastInterviews, setPastInterviews] = useState<PastInterview[]>([]);

  // Load past interviews
  useEffect(() => {
    const saved = localStorage.getItem("pastInterviews");
    if (saved) setPastInterviews(JSON.parse(saved));
  }, []);

  const moods = ["Professional", "Friendly", "Strict Technical", "Behavioral Focused", "System Design Heavy", "Mixed"];

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jd", jd);
    formData.append("mood", mood);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Upload failed");
        return;
      }

      setFirstQuestion(data.question);
      setResumeText(data.resume_text);
      setJdState(data.jd);
      setMoodState(data.mood);
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // If active interview
  if (firstQuestion && resumeText) {
    return (
      <InterviewChat
        firstQuestion={firstQuestion}
        resumeText={resumeText}
        jd={jdState}
        mood={moodState}
        onInterviewComplete={(messages, avgScore) => {
          // Save to history
          const newInterview: PastInterview = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString("en-IN"),
            mood: moodState,
            jdSnippet: jdState.substring(0, 60) + (jdState.length > 60 ? "..." : ""),
            finalScore: avgScore,
          };
          const updated = [newInterview, ...pastInterviews];
          setPastInterviews(updated);
          localStorage.setItem("pastInterviews", JSON.stringify(updated));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-zinc-950 border border-white/10 rounded-3xl max-w-2xl w-full p-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-8 border border-white rounded-full flex items-center justify-center text-sm font-bold">IA</div>
            <span className="text-2xl font-medium tracking-tighter">InterviewAI</span>
          </div>
          <h1 className="text-4xl font-medium tracking-tight">Voice Interview</h1>
          <p className="text-gray-400 mt-3">Upload resume + JD for a personalized mock interview</p>
        </div>

        {/* Past Interviews */}
        {pastInterviews.length > 0 && (
          <div className="mb-10">
            <h3 className="text-lg mb-4 text-gray-400">Past Interviews</h3>
            <div className="space-y-3 max-h-64 overflow-auto">
              {pastInterviews.map((interview) => (
                <div key={interview.id} className="bg-zinc-900 p-4 rounded-2xl flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">{interview.date}</span> • {interview.mood}
                    <br />
                    <span className="text-gray-500 text-xs">{interview.jdSnippet}</span>
                  </div>
                  <div className="text-emerald-400 font-semibold">Score: {interview.finalScore}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload form */}
        <div className="border-2 border-dashed border-white/30 hover:border-white/60 rounded-3xl p-12 text-center transition cursor-pointer"
             onClick={() => document.getElementById("file-input")?.click()}>
          <div className="text-7xl mb-6 opacity-70">📄</div>
          <p className="text-xl font-medium">Drop your resume PDF here</p>
        </div>

        <input id="file-input" type="file" accept=".pdf" className="hidden"
               onChange={(e) => setFile(e.target.files?.[0] || null)} />

        {file && <div className="mt-6 p-4 bg-zinc-900 rounded-2xl text-sm">{file.name}</div>}

        {/* JD */}
        <div className="mt-8">
          <label className="text-sm text-gray-400 block mb-2">Job Description (optional)</label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the JD here..."
            className="w-full h-32 bg-zinc-900 border border-white/10 rounded-3xl p-6 text-sm resize-none"
          />
        </div>

        {/* Mood */}
        <div className="mt-6">
          <label className="text-sm text-gray-400 block mb-2">Interview Mood / Mode</label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-3xl px-6 py-5 text-white"
          >
            {moods.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {error && <div className="mt-6 p-5 bg-red-950/50 border border-red-800 text-red-400 rounded-2xl text-sm">{error}</div>}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full mt-10 border border-white py-6 rounded-3xl font-medium text-xl hover:bg-white hover:text-black transition-all disabled:opacity-40"
        >
          {loading ? "Starting Interview..." : "Start Voice Interview"}
        </button>
      </div>
    </div>
  );
}