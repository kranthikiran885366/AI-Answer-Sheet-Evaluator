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
import { FeedbackGeneration } from "@/app/components/feedback-generation"
import { useWebSocket } from "@/components/websocket-provider"
import { Brain, Upload, Activity, LogIn } from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  username: string
  email: string
  role: "admin" | "teacher" | "student"
  institution: string
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeView, setActiveView] = useState("dashboard")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null)

  const { isConnected } = useWebSocket()

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setCurrentUser(data.user)
      } else {
        localStorage.removeItem("auth_token")
      }
    } catch (err) {
      console.error("Failed to fetch user:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    setCurrentUser(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-4"
        >
          <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <p className="text-indigo-700">Initializing dashboard...</p>
          <Progress value={70} className="w-56 mx-auto" />
        </motion.div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-sm"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">EvalAI Pro</h2>
            <p className="text-slate-500 mt-2">Sign in to access your dashboard</p>
          </div>
          <div className="space-y-3">
            <Button
              asChild
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              <Link href="/">
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </Button>
            <p className="text-xs text-slate-400">
              Demo: admin/admin123 · teacher/teacher123 · student/student123
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  const renderMainContent = () => {
    switch (activeView) {
      case "dashboard":
        if (currentUser.role === "admin" || currentUser.role === "teacher") return <AdminDashboard />
        if (currentUser.role === "student") return <StudentDashboard />
        return <AdminDashboard />
      case "upload":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Upload Answer Sheets</h2>
              <p className="text-gray-600">Upload and process answer sheets with AI evaluation</p>
            </div>
            <Card className="max-w-2xl mx-auto border border-slate-200">
              <CardContent className="p-8 text-center">
                <Upload className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Use the dedicated Upload page for full AI evaluation</p>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Link href="/upload">Go to Upload Page</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      case "ocr":
        return <OCRProcessingEngine />
      case "evaluation":
        return <AIEvaluationEngine />
      case "results":
        return selectedResultId
          ? <EvaluationResults sessionId={selectedResultId} />
          : (
            <div className="text-center py-16">
              <p className="text-slate-500">Select an evaluation to view its results.</p>
            </div>
          )
      case "rubrics":
        return <RubricManagement userRole={currentUser.role} />
      case "feedback":
        return <FeedbackGeneration />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-indigo-50/30 to-white">
        <MainSidebar userRole={currentUser.role} />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-slate-200" />

              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">EvalAI Pro</span>
                  <span className="text-xs text-slate-500">AI Answer Evaluator</span>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-indigo-500 animate-pulse" : "bg-slate-300"}`} />
                  <span className="text-xs text-slate-500">{isConnected ? "Connected" : "Offline"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-red-600"
                  >
                    Sign out
                  </Button>
                </div>

                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  <Activity className="h-3 w-3 mr-1" />
                  Online
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
