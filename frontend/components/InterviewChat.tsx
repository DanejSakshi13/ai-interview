// "use client";

// import { useState, useRef, useEffect } from "react";

// type Message = {
//   role: "ai" | "user";
//   text: string;
//   score?: string;
// };

// export default function InterviewChat({
//   firstQuestion,
//   resumeText,
// }: {
//   firstQuestion: string;
//   resumeText: string;
// }) {
//   const [messages, setMessages] = useState<Message[]>([
//     { role: "ai", text: firstQuestion },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [interviewEnded, setInterviewEnded] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

//   const bottomRef = useRef<HTMLDivElement>(null);

//   // Auto-scroll
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // 10-minute countdown timer
//   useEffect(() => {
//     if (interviewEnded || timeLeft <= 0) return;

//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           setInterviewEnded(true);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [interviewEnded, timeLeft]);

//   const formatTime = (seconds: number) => {
//     const min = Math.floor(seconds / 60);
//     const sec = seconds % 60;
//     return `${min}:${sec < 10 ? "0" : ""}${sec}`;
//   };

//   const sendAnswer = async () => {
//     if (!input.trim() || interviewEnded || loading) return;

//     const userAnswer = input.trim();
//     const currentQuestion = messages[messages.length - 1]?.text || "";
//     const currentQuestionCount = Math.floor(messages.length / 2) + 1;

//     // Build history
//     let history = "";
//     for (let i = 0; i < messages.length; i++) {
//       if (messages[i].role === "ai" && i + 1 < messages.length && messages[i + 1].role === "user") {
//         history += `Question: ${messages[i].text}\nAnswer: ${messages[i + 1].text}\n\n`;
//       }
//     }

//     setMessages((prev) => [...prev, { role: "user", text: userAnswer }]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await fetch("http://127.0.0.1:8000/answer-question", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           resume_text: resumeText,
//           question: currentQuestion,
//           answer: userAnswer,
//           history: history.trim(),
//           question_count: currentQuestionCount,   // ← new
//         }),
//       });

//       const data = await res.json();

//       setMessages((prev) => {
//         const updated = [...prev];
//         if (updated.length > 0 && updated[updated.length - 1].role === "user") {
//           updated[updated.length - 1].score = data.score;
//         }
//         updated.push({ role: "ai", text: data.next_question });
//         return updated;
//       });

//       if (
//         data.next_question.toLowerCase().includes("interview complete") ||
//         data.next_question.toLowerCase().includes("thank you")
//       ) {
//         setInterviewEnded(true);
//       }
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
//       {/* Header with Timer */}
//       <div className="border-b border-white/10 bg-[#12121a]/80 backdrop-blur-xl sticky top-0 z-50">
//         <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold">
//               AI
//             </div>
//             <div className="font-semibold text-xl tracking-tight">AI Interviewer</div>
//           </div>

//           {/* Timer */}
//           <div className="flex items-center gap-3 bg-[#1a1a24] px-6 py-2 rounded-3xl border border-white/10">
//             <span className="text-emerald-400 text-sm font-medium">TIME LEFT</span>
//             <span className={`font-mono text-2xl font-semibold ${timeLeft < 120 ? "text-red-400" : "text-white"}`}>
//               {formatTime(timeLeft)}
//             </span>
//           </div>

//           {interviewEnded && (
//             <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-sm font-medium">
//               ✓ Interview Completed
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 overflow-y-auto">
//         <div className="space-y-10 pb-20">
//           {messages.map((msg, index) => (
//             <div
//               key={index}
//               className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
//             >
//               <div
//                 className={`max-w-[78%] px-7 py-6 rounded-3xl ${
//                   msg.role === "ai"
//                     ? "bg-[#1a1a24] border border-white/10"
//                     : "bg-gradient-to-br from-indigo-600 to-purple-600"
//                 }`}
//               >
//                 <div className="whitespace-pre-wrap leading-relaxed text-[15.8px]">
//                   {msg.text}
//                 </div>
//                 {msg.score && msg.role === "user" && (
//                   <div className="mt-4 flex items-center gap-2">
//                     <div className="bg-black/30 px-5 py-2 rounded-2xl text-sm inline-flex items-center gap-2">
//                       <span className="text-emerald-400">Score</span>
//                       <span className="font-semibold text-lg">{msg.score}</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}

//           {loading && (
//             <div className="flex justify-start">
//               <div className="bg-[#1a1a24] border border-white/10 px-8 py-5 rounded-3xl flex items-center gap-3">
//                 <div className="flex gap-1.5">
//                   <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
//                   <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping delay-150"></div>
//                   <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping delay-300"></div>
//                 </div>
//                 <span className="text-gray-400">AI is thinking...</span>
//               </div>
//             </div>
//           )}
//         </div>
//         <div ref={bottomRef} />
//       </div>

//       {/* Input Area */}
//       {!interviewEnded ? (
//         <div className="border-t border-white/10 bg-[#12121a] py-8 sticky bottom-0 z-40">
//           <div className="max-w-5xl mx-auto px-6">
//             <div className="flex gap-4">
//               <input
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendAnswer())}
//                 placeholder="Type your answer here..."
//                 className="flex-1 bg-[#1a1a24] border border-white/10 focus:border-purple-500 rounded-3xl px-8 py-6 outline-none text-[17px] placeholder-gray-500"
//               />
//               <button
//                 onClick={sendAnswer}
//                 disabled={!input.trim() || loading}
//                 className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 px-12 rounded-3xl font-semibold text-lg transition-all active:scale-[0.97]"
//               >
//                 Send
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-[#12121a] border-t border-white/10 py-12 text-center">
//           <div className="max-w-md mx-auto px-6">
//             <div className="text-6xl mb-6">🎉</div>
//             <h3 className="text-3xl font-semibold mb-3">Interview Completed!</h3>
//             <p className="text-gray-400">You finished a full 10-minute resume-based mock interview.</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }







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
}: {
  firstQuestion: string;
  resumeText: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);

  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 3-2-1 Countdown
  useEffect(() => {
    if (!showCountdown) return;
    const timer = setTimeout(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          setShowCountdown(false);
          setMessages([{ role: "ai", text: firstQuestion }]);
          setTimeout(() => speak(firstQuestion), 600);
          return 0;
        }
        return prev - 1;
      });
    }, 900);
    return () => clearTimeout(timer);
  }, [countdown, showCountdown, firstQuestion]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 10-min timer
  useEffect(() => {
    if (interviewEnded || timeLeft <= 0 || showCountdown) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? (setInterviewEnded(true), 0) : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [interviewEnded, timeLeft, showCountdown]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

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
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + " ";
        else interim = event.results[i][0].transcript;
      }

      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        if (finalTranscript.trim()) {
          submitAnswer(finalTranscript.trim());
          finalTranscript = "";
        }
      }, 1500);
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
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang.includes("IN") || v.name.toLowerCase().includes("india"));
    if (indianVoice) utterance.voice = indianVoice;

    utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeaking = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resumeSpeaking = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const submitAnswer = async (userAnswer: string) => {
    if (!userAnswer) return;

    const currentQuestion = messages[messages.length - 1]?.text || "";
    const currentQuestionCount = Math.floor(messages.length / 2) + 1;

    let history = "";
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === "ai" && i + 1 < messages.length && messages[i + 1].role === "user") {
        history += `Question: ${messages[i].text}\nAnswer: ${messages[i + 1].text}\n\n`;
      }
    }

    setMessages((prev) => [...prev, { role: "user", text: userAnswer }]);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/answer-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeText,
          question: currentQuestion,
          answer: userAnswer,
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

      setTimeout(() => speak(data.next_question), 700);

      if (data.next_question.toLowerCase().includes("interview complete")) {
        setInterviewEnded(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  if (showCountdown) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-[160px] font-medium text-white leading-none tracking-tighter">{countdown}</div>
          <p className="text-3xl text-gray-400 mt-8">Interview starting in...</p>
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
            <div className="font-medium text-xl tracking-tight">Voice Interview</div>
          </div>
          <div className="font-mono text-2xl text-white/80">{formatTime(timeLeft)}</div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 overflow-y-auto">
        <div className="space-y-12 pb-32">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div 
                className={`max-w-[75%] px-8 py-7 rounded-3xl border ${
                  msg.role === "ai" 
                    ? "bg-zinc-900 border-white/10" 
                    : "bg-white text-black"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-[15.5px]">
                  {msg.text}
                </div>
                {msg.score && msg.role === "user" && (
                  <div className="mt-5 inline-flex items-center gap-3 bg-black/10 px-5 py-2 rounded-2xl text-sm">
                    <span className="text-gray-500">Score</span>
                    <span className="font-semibold text-lg text-black">{msg.score}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-400 pl-4">AI is thinking...</div>}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Voice Controls */}
      {!interviewEnded && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-950 border border-white/10 rounded-3xl px-8 py-6 shadow-2xl flex items-center gap-5 z-50">
          {isSpeaking && (
            <>
              {isPaused ? (
                <button 
                  onClick={resumeSpeaking} 
                  className="px-7 py-3 border border-white hover:bg-white hover:text-black rounded-2xl transition"
                >
                  ▶ Resume
                </button>
              ) : (
                <button 
                  onClick={pauseSpeaking} 
                  className="px-7 py-3 border border-white hover:bg-white hover:text-black rounded-2xl transition"
                >
                  ⏸ Pause
                </button>
              )}
            </>
          )}

          <button 
            onClick={stopSpeaking} 
            className="px-7 py-3 border border-red-600 text-red-400 hover:bg-red-950 rounded-2xl transition"
          >
            ⏹ Stop
          </button>

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

          <button 
            onClick={() => speak(messages[messages.length - 1]?.text || "")} 
            className="px-7 py-3 border border-white/30 hover:bg-white/10 rounded-2xl transition"
          >
            🔊 Repeat
          </button>
        </div>
      )}

      {interviewEnded && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-white/10 py-10 text-center text-lg">
          Interview Completed. Scroll up to review your performance.
        </div>
      )}
    </div>
  );
}