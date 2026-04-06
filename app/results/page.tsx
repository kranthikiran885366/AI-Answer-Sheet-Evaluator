"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { EvaluationResults } from "@/app/components/evaluation-results"
import { BarChart3 } from "lucide-react"

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

export default function ResultsPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="teacher" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Evaluation Results</h1>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Details
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Evaluation Results</h2>
                <p className="text-green-700">Detailed analysis and feedback for evaluated submissions</p>
              </div>

              {/* Results Component */}
              <EvaluationResults data={mockEvaluationData} />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
