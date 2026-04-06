import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, FileText, Zap, BarChart3, Shield, Clock, ArrowRight, CheckCircle, Users, Star, Upload, BookOpen, GraduationCap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">EvalAI Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">How it works</Link>
            <Link href="#use-cases" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">Use cases</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Sign in</Link>
            <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/dashboard">Get started free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 mb-6 px-4 py-1.5 text-sm font-medium">
            Now with GPT-4o & Claude 3 support
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-tight mb-6">
            Grade answer sheets
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
              10× faster with AI
            </span>
          </h1>

          <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-10">
            Upload handwritten or printed answer sheets. Our AI extracts text, evaluates against your rubric, and delivers detailed scores and feedback — in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 px-8">
              <Link href="/dashboard">
                Start evaluating free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-200 text-slate-700 hover:bg-slate-50 px-8">
              <Link href="/upload">Upload a sheet</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["Dr. A", "Ms. B", "Mr. C", "Dr. D"].map((n, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    {n[0]}
                  </div>
                ))}
              </div>
              <span>Trusted by <strong className="text-slate-700">10,000+</strong> educators</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-indigo-400 text-indigo-400" />)}
              <span className="ml-1"><strong className="text-slate-700">4.9/5</strong> average rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-50 border-y border-slate-100 py-14">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Active educators" },
              { value: "1M+", label: "Sheets evaluated" },
              { value: "99%", label: "OCR accuracy" },
              { value: "2.3s", label: "Avg. processing time" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-bold text-slate-900 mb-1">{value}</p>
                <p className="text-slate-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need to evaluate smarter</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Purpose-built for educators who want to spend less time grading and more time teaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FileText className="w-5 h-5" />,
                color: "bg-indigo-50 text-indigo-600",
                title: "Advanced OCR Engine",
                desc: "Accurately extracts text from handwritten and printed answer sheets — even messy handwriting."
              },
              {
                icon: <Brain className="w-5 h-5" />,
                color: "bg-violet-50 text-violet-600",
                title: "Multi-LLM Evaluation",
                desc: "Choose from GPT-4o, Claude 3, or Gemini to evaluate answers against your custom rubric."
              },
              {
                icon: <BarChart3 className="w-5 h-5" />,
                color: "bg-blue-50 text-blue-600",
                title: "Rich Analytics",
                desc: "Class-wide performance dashboards, question-level breakdowns, and progress trends over time."
              },
              {
                icon: <Zap className="w-5 h-5" />,
                color: "bg-cyan-50 text-cyan-600",
                title: "Real-time Processing",
                desc: "Live progress updates via WebSocket. Watch as each page is extracted and evaluated in real time."
              },
              {
                icon: <BookOpen className="w-5 h-5" />,
                color: "bg-purple-50 text-purple-600",
                title: "Custom Rubrics",
                desc: "Define detailed marking schemes for any subject. Rubrics are applied consistently across all submissions."
              },
              {
                icon: <Shield className="w-5 h-5" />,
                color: "bg-slate-100 text-slate-600",
                title: "Secure & Private",
                desc: "All data is encrypted in transit and at rest. Role-based access for admins, teachers, and students."
              },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-5`}>
                  {icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-500 text-lg">From upload to grade in under 5 seconds</p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: "01",
                title: "Upload answer sheets",
                desc: "Drag and drop PDFs, JPGs, or PNGs. Supports batch uploads for entire classes.",
                icon: <Upload className="w-5 h-5" />,
              },
              {
                step: "02",
                title: "AI extracts and reads text",
                desc: "Our OCR engine reads handwriting and printed text with 99% accuracy, even on poor-quality scans.",
                icon: <FileText className="w-5 h-5" />,
              },
              {
                step: "03",
                title: "LLM evaluates against your rubric",
                desc: "The AI compares student answers to your rubric, assigns marks, and writes detailed feedback.",
                icon: <Brain className="w-5 h-5" />,
              },
              {
                step: "04",
                title: "Get instant results and insights",
                desc: "Download detailed reports, share results with students, and view class-wide analytics.",
                icon: <BarChart3 className="w-5 h-5" />,
              },
            ].map(({ step, title, desc, icon }, i) => (
              <div key={step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {step}
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
                  <p className="text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Built for every educator</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <GraduationCap className="w-6 h-6 text-indigo-600" />,
                title: "Schools & Universities",
                desc: "Automate grading across departments, track student progress over time, and flag struggling learners early.",
                points: ["Automated batch grading", "Per-student progress reports", "Department-level analytics"],
              },
              {
                icon: <Users className="w-6 h-6 text-violet-600" />,
                title: "EdTech Platforms",
                desc: "Integrate our API into your LMS to add AI-powered assessment without building from scratch.",
                points: ["REST API + WebSocket", "White-label ready", "Custom branding options"],
              },
              {
                icon: <Clock className="w-6 h-6 text-blue-600" />,
                title: "Exam Boards",
                desc: "Process thousands of answer sheets consistently with explainable AI scores and audit trails.",
                points: ["Bulk processing", "Detailed audit reports", "Consistent, bias-free grading"],
              },
            ].map(({ icon, title, desc, points }) => (
              <div key={title} className="bg-white rounded-2xl p-8 border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-5">{icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-500 mb-5 text-sm leading-relaxed">{desc}</p>
                <ul className="space-y-2">
                  {points.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-16 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Start grading smarter today</h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
              Join over 10,000 educators using EvalAI Pro to reclaim hours every week.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-8">
                <Link href="/dashboard">Get started — it's free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8">
                <Link href="/upload">Upload a sheet now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-slate-900">EvalAI Pro</span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs">AI-powered answer sheet evaluation for modern educators.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Security", "API Docs"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Support", links: ["Documentation", "Help Center", "Contact", "Status"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-slate-900 font-semibold mb-3 text-sm">{title}</h4>
                <ul className="space-y-2">
                  {links.map(l => (
                    <li key={l}><Link href="#" className="text-slate-500 hover:text-slate-900 text-sm transition-colors">{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">&copy; 2025 EvalAI Pro. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="text-slate-400 hover:text-slate-600 text-sm">Privacy</Link>
              <Link href="#" className="text-slate-400 hover:text-slate-600 text-sm">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
