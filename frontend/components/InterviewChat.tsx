"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "ai" | "user";
  text: string;
  score?: string;
};

export default function InterviewChat({
  firstQuestion,
  resumeText,
  jd,
  mood,
  onInterviewComplete,
}: {
  firstQuestion: string;
  resumeText: string;
  jd: string;
  mood: string;
  onInterviewComplete: (messages: Message[], avgScore: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState("");
  const [avgScore, setAvgScore] = useState("N/A");

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Start interview with countdown + first question
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{ role: "ai", text: firstQuestion }]);
      speak(firstQuestion);
    }, 3200);
    return () => clearTimeout(timer);
  }, [firstQuestion]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Timer
  useEffect(() => {
    if (interviewEnded || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? (setInterviewEnded(true), 0) : prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [interviewEnded, timeLeft]);

  // Speech Recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const rec = new SpeechRecognitionAPI();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";

    let finalTranscript = "";

    rec.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript.trim()) {
        submitAnswer(finalTranscript.trim());
        finalTranscript = "";
      }
    };

    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  }, []);

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1.02;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  };

  const resumeSpeaking = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const submitAnswer = async (userAnswer: string) => {
    if (!userAnswer.trim() || interviewEnded || loading) return;

    const currentQuestion = messages[messages.length - 1]?.text || "";
    const currentQuestionCount = Math.floor(messages.length / 2) + 1;

    let history = "";
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === "ai" && i + 1 < messages.length && messages[i + 1].role === "user") {
        history += `Question: ${messages[i].text}\nAnswer: ${messages[i + 1].text}\n\n`;
      }
    }

    setMessages((prev) => [...prev, { role: "user", text: userAnswer.trim() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/answer-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          jd,
          mood,
          question: currentQuestion,
          answer: userAnswer.trim(),
          history: history.trim(),
          question_count: currentQuestionCount,
        }),
      });

      const data = await res.json();

      setMessages((prev) => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.role === "user") {
          updated[updated.length - 1].score = data.score;
        }
        updated.push({ role: "ai", text: data.next_question });
        return updated;
      });

      if (isVoiceMode) {
        setTimeout(() => speak(data.next_question), 700);
      }

      if (data.next_question.toLowerCase().includes("interview complete")) {
        setInterviewEnded(true);
        setTimeout(generateFinalReport, 1000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateFinalReport = async () => {
    const scores = messages
      .filter((m) => m.score)
      .map((m) => parseFloat(m.score || "0"));
    const average = scores.length
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : "N/A";
    setAvgScore(average);

    try {
      const res = await fetch("http://127.0.0.1:8000/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText, jd, mood, messages }),
      });
      const data = await res.json();
      setReport(data.report);
      setShowReport(true);
      onInterviewComplete(messages, average);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (showReport) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto bg-zinc-900 rounded-3xl p-10">
          <h1 className="text-4xl font-medium mb-2">Your Interview Report</h1>
          <p className="text-emerald-400 text-3xl mb-10">Overall Score: {avgScore}/10</p>
          <div
            className="prose prose-invert max-w-none text-[15.5px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, "<br><br>") }}
          />
          <button
            onClick={() => window.location.reload()}
            className="mt-12 w-full py-6 bg-white text-black rounded-3xl font-semibold text-xl hover:bg-gray-200"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-zinc-950 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border border-white rounded-full flex items-center justify-center text-sm font-bold">IA</div>
            <div className="font-medium text-xl tracking-tight">InterviewAI • {mood}</div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`px-6 py-2.5 rounded-3xl border text-sm font-medium transition-all ${
                isVoiceMode ? "bg-white text-black border-white" : "border-white/30 hover:bg-white/10"
              }`}
            >
              {isVoiceMode ? "🎤 Voice Mode" : "⌨️ Text Mode"}
            </button>

            <div className="font-mono text-2xl tabular-nums">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 overflow-y-auto">
        <div className="space-y-12 pb-32">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] px-8 py-7 rounded-3xl border ${
                  msg.role === "ai" ? "bg-zinc-900 border-white/10" : "bg-white text-black"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-[15.8px]">
                  {msg.text}
                </div>
                {msg.score && msg.role === "user" && (
                  <div className="mt-4 inline-flex items-center gap-3 bg-black/10 px-5 py-2 rounded-2xl text-sm">
                    <span className="text-gray-500">Score</span>
                    <span className="font-semibold text-lg text-black">{msg.score}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && <div className="pl-4 text-gray-400">AI is thinking...</div>}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Bottom Controls */}
      {!interviewEnded && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-950 border border-white/10 rounded-3xl px-8 py-6 shadow-2xl flex items-center gap-5 z-50">
          {isVoiceMode ? (
            // Voice Controls with Play/Pause/Resume
            <div className="flex items-center gap-4">
              {/* Pause / Resume */}
              {isSpeaking || isPaused ? (
                <>
                  {isPaused ? (
                    <button
                      onClick={resumeSpeaking}
                      className="px-8 py-4 border border-white/30 hover:bg-white/10 rounded-2xl flex items-center gap-2"
                    >
                      ▶ Resume
                    </button>
                  ) : (
                    <button
                      onClick={pauseSpeaking}
                      className="px-8 py-4 border border-white/30 hover:bg-white/10 rounded-2xl flex items-center gap-2"
                    >
                      ⏸ Pause
                    </button>
                  )}

                  <button
                    onClick={stopSpeaking}
                    className="px-8 py-4 border border-red-600 text-red-400 hover:bg-red-950 rounded-2xl"
                  >
                    ⏹ Stop
                  </button>
                </>
              ) : null}

              {/* Mic Button */}
              <button
                onClick={toggleListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all border-4 ${
                  isListening
                    ? "bg-red-600 border-red-500 animate-pulse"
                    : "bg-white text-black border-white hover:scale-105"
                }`}
              >
                {isListening ? "●" : "🎤"}
              </button>

              {/* Repeat Question */}
              <button
                onClick={() => speak(messages[messages.length - 1]?.text || "")}
                className="px-8 py-4 border border-white/30 hover:bg-white/10 rounded-2xl"
              >
                🔊 Repeat
              </button>
            </div>
          ) : (
            // Text Mode
            <div className="flex w-[620px] gap-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), submitAnswer(input))}
                placeholder="Type your answer here and press Enter..."
                className="flex-1 bg-zinc-900 border border-white/20 focus:border-white rounded-3xl px-8 py-6 outline-none text-[17px]"
              />
              <button
                onClick={() => submitAnswer(input)}
                disabled={!input.trim() || loading}
                className="bg-white text-black px-12 rounded-3xl font-semibold disabled:opacity-50"
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}

      {interviewEnded && !showReport && (
        <div className="fixed bottom-0 left-0 right-0 bg-emerald-600 py-6 text-center text-xl font-medium">
          Generating your detailed report...
        </div>
      )}
    </div>
  );
}