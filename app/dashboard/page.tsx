"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { AIEvaluationEngine } from "@/app/components/ai-evaluation-engine"
import { OCRProcessingEngine } from "@/app/components/ocr-processing-engine"
import { EvaluationResults } from "@/app/components/evaluation-results"
import { RubricManagement } from "@/app/components/rubric-management"
import { AdminDashboard } from "@/app/components/admin-dashboard"
import { StudentDashboard } from "@/app/components/student-dashboard"
import { useWebSocket } from "@/components/websocket-provider"
import { Brain, Upload, Activity } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "teacher" | "student"
  avatar?: string
  institution: string
}

interface SystemStats {
  totalEvaluations: string
  activeStudents: string
  averageScore: string
  aiAccuracy: string
  totalUsers: number
  activeUsers: number
  systemUptime: string
  processingSpeed: string
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeView, setActiveView] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalEvaluations: "15,247",
    activeStudents: "2,847",
    averageScore: "87.2%",
    aiAccuracy: "96.8%",
    totalUsers: 2847,
    activeUsers: 1256,
    systemUptime: "99.9%",
    processingSpeed: "2.3s",
  })

  const { isConnected } = useWebSocket()

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentUser({
        id: "1",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@evalai.pro",
        role: "admin",
        institution: "EvalAI Pro",
      })
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const mockEvaluationData = {
    studentName: "John Smith",
    subject: "Mathematics",
    examType: "Mid-term Exam",
    evaluationDate: "2024-01-15",
    obtainedMarks: 85,
    totalMarks: 100,
    percentage: 85,
    grade: "A",
    confidenceScore: 94,
    overallFeedback:
      "Excellent work! Strong understanding of algebraic concepts with minor areas for improvement in complex problem-solving.",
    strengths: [
      "Clear step-by-step solutions",
      "Correct application of formulas",
      "Good mathematical reasoning",
      "Neat presentation of work",
    ],
    improvements: ["Work on complex word problems", "Show more intermediate steps", "Double-check final answers"],
    questions: [
      {
        id: 1,
        question: "Solve the quadratic equation: 2x² + 5x - 3 = 0",
        studentAnswer:
          "Using the quadratic formula: x = (-5 ± √(25 + 24))/4 = (-5 ± 7)/4\nSo x = 1/2 or x = -3",
        obtainedMarks: 8,
        maxMarks: 10,
        feedback:
          "Excellent application of the quadratic formula. Minor deduction for not showing the discriminant calculation step.",
        keyPointsCovered: ["Quadratic formula", "Correct calculation", "Both solutions found"],
        keyPointsMissed: ["Discriminant explanation"],
        suggestions: "Always show the discriminant calculation step for complete clarity.",
      },
      {
        id: 2,
        question: "Find the derivative of f(x) = 3x³ - 2x² + x - 5",
        studentAnswer: "f'(x) = 9x² - 4x + 1",
        obtainedMarks: 10,
        maxMarks: 10,
        feedback: "Perfect! Correctly applied the power rule for each term.",
        keyPointsCovered: ["Power rule", "Correct coefficients", "All terms included"],
        keyPointsMissed: [],
        suggestions: "Excellent work. Continue practicing with more complex functions.",
      },
    ],
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <p className="text-gray-600">Initializing dashboard...</p>
          <Progress value={70} className="w-56 mx-auto" />
        </motion.div>
      </div>
    )
  }

  const renderMainContent = () => {
    switch (activeView) {
      case "dashboard":
        if (currentUser?.role === "admin") return <AdminDashboard />
        if (currentUser?.role === "student") return <StudentDashboard />
        return <AdminDashboard />
      case "upload":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Upload Answer Sheets</h2>
              <p className="text-gray-600">Upload and process answer sheets with advanced OCR</p>
            </div>
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-cyan-400 transition-colors">
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Drop files here or click to upload</h3>
                  <p className="text-gray-600 mb-4">Support for PDF, JPG, PNG files up to 50MB</p>
                  <Button className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700">Select Files</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case "ocr":
        return <OCRProcessingEngine />
      case "evaluation":
        return <AIEvaluationEngine />
      case "results":
        return <EvaluationResults data={mockEvaluationData} />
      case "rubrics":
        return <RubricManagement userRole={currentUser?.role} />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50">
        <MainSidebar userRole={currentUser?.role} />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-emerald-600">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">EvalAI Pro</span>
                  <span className="text-xs text-gray-500">AI Answer Evaluator</span>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                  <span className="text-xs text-gray-600">{isConnected ? "Connected" : "Disconnected"}</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Activity className="h-3 w-3 mr-1" />
                  System Online
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">{renderMainContent()}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
