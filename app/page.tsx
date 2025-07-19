"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Upload,
  BarChart3,
  FileText,
  Zap,
  Shield,
  TrendingUp,
  BookOpen,
  Scan,
  MessageSquare,
  Award,
  Eye,
  Lock,
} from "lucide-react"

// Import all components
import { AdvancedUploadSection } from "./components/advanced-upload-section"
import { OCRProcessingEngine } from "./components/ocr-processing-engine"
import { AIEvaluationEngine } from "./components/ai-evaluation-engine"
import { RubricManagement } from "./components/rubric-management"
import { FeedbackGeneration } from "./components/feedback-generation"
import { TeacherDashboard } from "./components/teacher-dashboard"
import { StudentPortal } from "./components/student-portal"
import { AdminDashboard } from "./components/admin-dashboard"
import { AnalyticsReports } from "./components/analytics-reports"
import { ContinuousLearning } from "./components/continuous-learning"
import { SecurityCompliance } from "./components/security-compliance"
import { ExplainableAI } from "./components/explainable-ai"
import { PlagiarismDetection } from "./components/plagiarism-detection"
import { BiasDetection } from "./components/bias-detection"
import { useWebSocket } from "@/components/websocket-provider"

export default function AIAnswerEvaluatorApp() {
  const [activeTab, setActiveTab] = useState("upload")
  const [userRole, setUserRole] = useState<"admin" | "teacher" | "student" | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [systemStats, setSystemStats] = useState({
    totalEvaluations: 15247,
    accuracyRate: 94.8,
    activeUsers: 1256,
    processingTime: 2.3,
  })
  const { isConnected } = useWebSocket()

  useEffect(() => {
    // Initialize system
    const initializeSystem = async () => {
      try {
        // Check authentication status
        const authStatus = localStorage.getItem("auth_status")
        const role = localStorage.getItem("user_role")

        if (authStatus === "authenticated" && role) {
          setIsAuthenticated(true)
          setUserRole(role as any)
        }
      } catch (error) {
        console.error("System initialization failed:", error)
      }
    }

    initializeSystem()
  }, [])

  const handleLogin = (role: "admin" | "teacher" | "student") => {
    setUserRole(role)
    setIsAuthenticated(true)
    localStorage.setItem("auth_status", "authenticated")
    localStorage.setItem("user_role", role)
  }

  const handleLogout = () => {
    setUserRole(null)
    setIsAuthenticated(false)
    localStorage.removeItem("auth_status")
    localStorage.removeItem("user_role")
    setActiveTab("upload")
  }

  const features = [
    {
      icon: <Scan className="h-6 w-6" />,
      title: "Advanced OCR Engine",
      description: "Multi-language handwriting recognition with 99.2% accuracy",
      status: "Active",
      color: "bg-green-500",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI Evaluation System",
      description: "Semantic understanding and concept-based grading",
      status: "Active",
      color: "bg-blue-500",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Rubric Management",
      description: "Custom rubrics with step-by-step marking",
      status: "Active",
      color: "bg-purple-500",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Feedback Generation",
      description: "Personalized improvement suggestions",
      status: "Active",
      color: "bg-orange-500",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Plagiarism Detection",
      description: "Advanced similarity detection and bias prevention",
      status: "Active",
      color: "bg-red-500",
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Explainable AI",
      description: "Transparent scoring with detailed justifications",
      status: "Active",
      color: "bg-teal-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">AI Answer Evaluator</h1>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                v2.0 Production
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="capitalize">
                {userRole} Dashboard
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* System Status Bar */}
      <div className="bg-blue-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"} rounded-full`}
                ></div>
                <span>System Online</span>
              </div>
              <span>Evaluations: {systemStats.totalEvaluations.toLocaleString()}</span>
              <span>Accuracy: {systemStats.accuracyRate}%</span>
              <span>Active Users: {systemStats.activeUsers}</span>
              <span>Avg Processing: {systemStats.processingTime}s</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>AI Models: 12 Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${feature.color} text-white`}>{feature.icon}</div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {feature.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Application Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 lg:grid-cols-12">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex items-center gap-2">
              <Scan className="h-4 w-4" />
              OCR
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Eval
            </TabsTrigger>
            <TabsTrigger value="rubrics" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Rubrics
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="explainable" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              XAI
            </TabsTrigger>
            <TabsTrigger value="plagiarism" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Plagiarism
            </TabsTrigger>
            <TabsTrigger value="bias" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Bias Control
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="upload" className="space-y-6">
            <AdvancedUploadSection userRole={userRole} />
          </TabsContent>

          <TabsContent value="ocr" className="space-y-6">
            <OCRProcessingEngine />
          </TabsContent>

          <TabsContent value="evaluation" className="space-y-6">
            <AIEvaluationEngine />
          </TabsContent>

          <TabsContent value="rubrics" className="space-y-6">
            <RubricManagement userRole={userRole} />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <FeedbackGeneration />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            {userRole === "admin" && <AdminDashboard />}
            {userRole === "teacher" && <TeacherDashboard />}
            {userRole === "student" && <StudentPortal />}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsReports userRole={userRole} />
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <ContinuousLearning />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityCompliance />
          </TabsContent>

          <TabsContent value="explainable" className="space-y-6">
            <ExplainableAI />
          </TabsContent>

          <TabsContent value="plagiarism" className="space-y-6">
            <PlagiarismDetection />
          </TabsContent>

          <TabsContent value="bias" className="space-y-6">
            <BiasDetection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
