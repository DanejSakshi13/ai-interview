import ResumeUpload from "@/components/ResumeUpload"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-10">

      <h1 className="text-4xl font-bold">
        AI Interview Simulator
      </h1>

      <ResumeUpload />

    </main>
  )
}