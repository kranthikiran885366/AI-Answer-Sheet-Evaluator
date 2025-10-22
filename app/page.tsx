import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4 bg-cyan-100 text-cyan-700">New</Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">EvalAI Pro</h1>
            <p className="text-lg text-slate-600 mb-8">AI-powered answer sheet evaluation with advanced OCR, explainable grading, and real-time insights for admins, teachers, and students.</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/upload">Upload Sheets</Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="p-4 rounded-xl bg-white/70 backdrop-blur border">OCR + LLM Evaluation</div>
              <div className="p-4 rounded-xl bg-white/70 backdrop-blur border">Real-time WebSockets</div>
              <div className="p-4 rounded-xl bg-white/70 backdrop-blur border">Analytics & Reports</div>
              <div className="p-4 rounded-xl bg-white/70 backdrop-blur border">Secure & Scalable</div>
            </div>
          </div>
          <div className="relative">
            <Image src="/hero-illustration.svg" alt="EvalAI Pro" width={640} height={480} priority className="w-full h-auto" />
          </div>
        </div>
      </section>
    </main>
  )
}
