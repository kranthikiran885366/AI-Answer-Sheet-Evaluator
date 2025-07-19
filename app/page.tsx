"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "./components/main-sidebar"
import { StunningDashboard } from "./components/stunning-dashboard"
import { AIEvaluationEngine } from "./components/ai-evaluation-engine"
import { OCRProcessingEngine } from "./components/ocr-processing-engine"
import { EvaluationResults } from "./components/evaluation-results"
import { RubricManagement } from "./components/rubric-management"
import { AdminDashboard } from "./components/admin-dashboard"
import { StudentDashboard } from "./components/student-dashboard"
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

export default function AIAnswerEvaluatorApp() {
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

  const { isConnected, lastMessage } = useWebSocket()

  useEffect(() => {
    // Simulate loading and user authentication
    const timer = setTimeout(() => {
      setCurrentUser({
        id: "1",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@evalai.pro",
        role: "admin",
        institution: "EvalAI Pro",
      })
      setIsLoading(false)
    }, 2000)

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
        studentAnswer: "Using the quadratic formula: x = (-5 ± √(25 + 24))/4 = (-5 ± 7)/4\nSo x = 1/2 or x = -3",
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 mx-auto"
          >
            <Brain className="w-16 h-16 text-blue-600" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EvalAI Pro
            </h2>
            <p className="text-gray-600">Initializing AI systems...</p>
          </div>
          <Progress value={75} className="w-64 mx-auto" />
        </motion.div>
      </div>
    )
  }

  const renderMainContent = () => {
    switch (activeView) {
      case "dashboard":
        if (currentUser?.role === "admin") {
          return <AdminDashboard />
        } else if (currentUser?.role === "student") {
          return <StudentDashboard />
        } else {
          return <StunningDashboard user={currentUser} stats={systemStats} />
        }
      case "upload":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Upload Answer Sheets</h2>
              <p className="text-gray-600">Upload and process answer sheets with advanced OCR</p>
            </div>
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Drop files here or click to upload</h3>
                  <p className="text-gray-600 mb-4">Support for PDF, JPG, PNG files up to 50MB</p>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Select Files
                  </Button>
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
        return <StunningDashboard user={currentUser} stats={systemStats} />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <MainSidebar userRole={currentUser?.role} />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">EvalAI Pro</span>
                  <span className="text-xs text-gray-500">AI Answer Evaluator</span>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-4">
                {/* Connection Status */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                  />
                  <span className="text-xs text-gray-600">{isConnected ? "Connected" : "Disconnected"}</span>
                </div>

                {/* System Status */}
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Activity className="h-3 w-3 mr-1" />
                  System Online
                </Badge>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {currentUser?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">{renderMainContent()}</div>
          </main>

          {/* Footer */}
          <footer className="border-t bg-white/50 backdrop-blur">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>© 2024 EvalAI Pro. All rights reserved.</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>System Uptime: {systemStats.systemUptime}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>Processing Speed: {systemStats.processingSpeed}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>AI Accuracy: {systemStats.aiAccuracy}</span>
                </div>
              </div>
            </div>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
