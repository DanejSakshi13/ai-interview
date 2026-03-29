"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:50px_50px] opacity-40"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24">
        
        {/* Top Navigation - Minimal */}
        <nav className="flex justify-between items-center mb-24">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white rounded-full flex items-center justify-center text-sm font-bold tracking-widest">
              IA
            </div>
            <span className="text-2xl font-medium tracking-tighter">InterviewAI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition">How it works</a>
            <a href="#" className="hover:text-white transition">Features</a>
            <a href="#" className="hover:text-white transition">For Companies</a>
          </div>

          <button 
            onClick={() => router.push("/interview")}
            className="px-8 py-3.5 border border-white hover:bg-white hover:text-black transition-all duration-300 text-sm font-medium rounded-full"
          >
            Start Interview
          </button>
        </nav>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 rounded-full text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Real-time • Voice-enabled • Powered by Gemini
            </div>

            <h1 className="text-7xl lg:text-[82px] font-medium tracking-tighter leading-none">
              Practice like it's<br />
              the real thing.
            </h1>

            <p className="text-xl text-gray-400 max-w-md">
              Upload your resume. Get interviewed by AI with natural voice conversation, 
              intelligent follow-ups, and honest scoring.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/interview")}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="group px-10 py-6 border border-white hover:bg-white hover:text-black transition-all duration-300 text-lg font-medium rounded-full flex items-center justify-center gap-3"
              >
                Begin Mock Interview
                <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
              </button>

              <button className="px-10 py-6 border border-white/30 hover:border-white/60 transition-all duration-300 text-lg font-medium rounded-full">
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-12 text-sm text-gray-400">
              <div>Used by engineers at</div>
              <div className="flex gap-8 opacity-70">
                <span>Google</span>
                <span>Microsoft</span>
                <span>Atlassian</span>
              </div>
            </div>
          </div>

          {/* Right Side - Clean Visual */}
          <div className="relative hidden lg:block">
            <div className="relative bg-zinc-950 border border-white/10 rounded-3xl p-10 shadow-2xl">
              {/* Mock Interview Card */}
              <div className="bg-zinc-900 rounded-2xl p-8 mb-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-11 h-11 bg-white text-black rounded-2xl flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <div className="font-medium text-lg">Senior Software Engineer</div>
                    <div className="text-xs text-gray-500">Live Mock Interview • 9 min remaining</div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="text-lg leading-snug border-l-2 border-white pl-6">
                    Tell me about a time you had to debug a complex production issue under pressure.
                  </div>
                  
                  <div className="pl-6 text-gray-300 text-[15px]">
                    I was on-call when our payment service went down at 2 AM...
                  </div>
                </div>
              </div>

              {/* Score Indicators */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-medium text-white">9.1</div>
                  <div className="text-xs text-gray-500 mt-1 tracking-widest">PROBLEM SOLVING</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-medium text-white">8.4</div>
                  <div className="text-xs text-gray-500 mt-1 tracking-widest">COMMUNICATION</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-medium text-white">9.3</div>
                  <div className="text-xs text-gray-500 mt-1 tracking-widest">DEPTH</div>
                </div>
              </div>
            </div>

            {/* Subtle floating element */}
            <div className="absolute -bottom-5 -right-5 bg-zinc-900 border border-white/10 px-6 py-3 rounded-2xl text-sm flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              AI Voice Interview in progress
            </div>
          </div>
        </div>

        {/* Minimal Features Bar */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-4 gap-10 text-center">
          <div className="space-y-3">
            <div className="text-3xl">📄</div>
            <div className="font-medium">Resume Intelligence</div>
            <div className="text-sm text-gray-400">Deep parsing of your experience and projects</div>
          </div>
          <div className="space-y-3">
            <div className="text-3xl">🎤</div>
            <div className="font-medium">Voice Conversation</div>
            <div className="text-sm text-gray-400">Speak naturally. AI listens and responds in voice</div>
          </div>
          <div className="space-y-3">
            <div className="text-3xl">⚖️</div>
            <div className="font-medium">Balanced Depth</div>
            <div className="text-sm text-gray-400">Covers multiple projects without getting stuck</div>
          </div>
          <div className="space-y-3">
            <div className="text-3xl">📊</div>
            <div className="font-medium">Instant Scoring</div>
            <div className="text-sm text-gray-400">Honest feedback after every answer</div>
          </div>
        </div>
      </div>
    </div>
  );
}