"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Download, Eye, TrendingUp, BookOpen, Loader2, FileText, RefreshCw } from "lucide-react"

interface Evaluation {
  id: string
  subject: string
  examType: string
  date: string
  score: number
  maxScore: number
  percentage: number
  grade: string
  feedback: string
  strengths: string[]
  improvements: string[]
  status: string
  aiProvider: string
}

interface StudentStats {
  totalEvaluations: number
  averageScore: number
  bestSubject: string
  improvementRate: number
}

export function StudentDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch("/api/student-evaluations")
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data = await res.json()
      setEvaluations(data.evaluations || [])
      setStudentStats(data.stats || null)
    } catch (err: any) {
      setError("Failed to load evaluations. Make sure your answer sheets have been processed.")
    } finally {
      setIsLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-indigo-500"
      case "B+":
      case "B":
        return "bg-blue-500"
      case "C+":
      case "C":
        return "bg-orange-500"
      default:
        return "bg-red-500"
    }
  }

  const filteredEvaluations = evaluations.filter(
    (item) =>
      item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.examType?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-slate-500">Loading your evaluations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Student Portal</h2>
          <p className="text-slate-500 mt-1">Track your progress and get personalized insights</p>
        </div>
        <Button variant="outline" onClick={fetchStudentData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {studentStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border border-indigo-100 bg-indigo-50/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{studentStats.totalEvaluations}</div>
              <div className="text-sm text-slate-600">Total Evaluations</div>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 bg-blue-50/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{studentStats.averageScore}%</div>
              <div className="text-sm text-slate-600">Average Score</div>
            </CardContent>
          </Card>

          <Card className="border border-violet-100 bg-violet-50/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-violet-600 mb-2">{studentStats.bestSubject}</div>
              <div className="text-sm text-slate-600">Best Subject</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 bg-slate-50/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-slate-700 mb-2">
                {studentStats.improvementRate >= 0 ? "+" : ""}{studentStats.improvementRate}%
              </div>
              <div className="text-sm text-slate-600">Score Change</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border border-slate-200">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search evaluations by subject or exam type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredEvaluations.length === 0 ? (
        <Card className="border border-slate-200">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No evaluations yet</h3>
            <p className="text-slate-500 mb-6">Upload answer sheets on the Process page to see your results here.</p>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <a href="/upload">Upload Answer Sheet</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEvaluations.map((evaluation) => (
            <Card key={evaluation.id} className="border border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {evaluation.subject} — {evaluation.examType}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {new Date(evaluation.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {" · "}
                      <span className="capitalize">{evaluation.aiProvider} AI</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-semibold ${getGradeColor(evaluation.grade)}`}
                    >
                      {evaluation.grade}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {evaluation.score}/{evaluation.maxScore}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Score</span>
                    <span className="font-medium">{evaluation.percentage}%</span>
                  </div>
                  <Progress value={evaluation.percentage} className="h-2" />
                </div>

                {evaluation.feedback && (
                  <div className="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-100">
                    <h4 className="font-medium text-indigo-800 text-sm mb-1">AI Feedback:</h4>
                    <p className="text-indigo-700 text-sm">{evaluation.feedback}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/results/${evaluation.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {evaluations.length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              AI Learning Recommendations
            </CardTitle>
            <CardDescription>Generated from your evaluation history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evaluations.slice(0, 3).flatMap((e) => e.improvements || []).slice(0, 3).map((improvement, i) => (
                <div key={i} className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-start justify-between">
                    <p className="text-indigo-800 text-sm font-medium">{improvement}</p>
                    <TrendingUp className="h-4 w-4 text-indigo-500 ml-2 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
