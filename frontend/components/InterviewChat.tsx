"use client"

import { useState } from "react"

type Message = {
  role: "ai" | "user"
  text: string
  score?: string
}

export default function InterviewChat({ firstQuestion }: { firstQuestion: string }) {

  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: firstQuestion }
  ])

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const sendAnswer = async () => {

    if (!input) return

    const lastQuestion = messages[messages.length - 1].text

    const userMessage: Message = {
      role: "user",
      text: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    const res = await fetch("http://127.0.0.1:8000/answer-question", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: lastQuestion,
        answer: input
      })
    })

    const data = await res.json()

    setMessages(prev => [
      ...prev.slice(0, -1),
      {
        role: "user",
        text: input,
        score: data.score
      },
      {
        role: "ai",
        text: data.next_question
      }
    ])

    setLoading(false)
  }

  return (
    <div className="flex flex-col w-full max-w-2xl h-[600px] border rounded-lg">

      {/* Chat window */}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {messages.map((msg, index) => (

          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >

            <div
              className={`max-w-[70%] px-4 py-3 rounded-lg ${
                msg.role === "ai"
                  ? "bg-gray-200 text-black"
                  : "bg-blue-500 text-white"
              }`}
            >
              {msg.text}

              {msg.score && (
                <div className="mt-2">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Score: {msg.score}
                  </span>
                </div>
              )}

            </div>

          </div>

        ))}

      </div>

      {/* Input area */}

      <div className="border-t p-3 flex gap-2">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
          className="flex-1 border rounded px-3 py-2"
        />

        <button
          onClick={sendAnswer}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "..." : "Send"}
        </button>

      </div>

    </div>
  )
}