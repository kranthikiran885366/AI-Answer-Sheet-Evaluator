"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Search, Download, Eye, RotateCcw, TrendingUp, BookOpen } from "lucide-react"

export default function StudentDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [evaluations, setEvaluations] = useState([])
  const [studentStats, setStudentStats] = useState({
    totalEvaluations: 15,
    averageScore: 78,
    bestSubject: "Biology",
    improvementRate: 12,
  })

  useEffect(() => {
    fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/student-evaluations")
      if (response.ok) {
        const data = await response.json()
        setEvaluations(data.evaluations || mockEvaluations)
      }
    } catch (error) {
      console.error("Failed to fetch student data:", error)
      setEvaluations(mockEvaluations)
    }
  }

  const mockEvaluations = [
    {
      id: 1,
      subject: "Mathematics",
      examType: "Unit Test",
      date: "2024-01-15",
      score: 85,
      maxScore: 100,
      grade: "A",
      feedback: "Excellent work! Strong understanding of algebraic concepts.",
      status: "completed",
    },
    {
      id: 2,
      subject: "Physics",
      examType: "Mid-term",
      date: "2024-01-12",
      score: 72,
      maxScore: 100,
      grade: "B",
      feedback: "Good effort. Focus more on numerical problems and formulas.",
      status: "completed",
    },
    {
      id: 3,
      subject: "Biology",
      examType: "Assignment",
      date: "2024-01-08",
      score: 92,
      maxScore: 100,
      grade: "A+",
      feedback: "Outstanding! Excellent diagrams and detailed explanations.",
      status: "completed",
    },
  ]

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-500"
      case "B+":
      case "B":
        return "bg-blue-500"
      case "C+":
      case "C":
        return "bg-yellow-500"
      default:
        return "bg-red-500"
    }
  }

  const filteredEvaluations = evaluations.filter(
    (item) =>
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.examType.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          Student Portal
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">Track your progress and get personalized insights</p>
      </div>

      {/* Student Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{studentStats.totalEvaluations}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Total Evaluations</div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-200/50 dark:border-green-800/50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{studentStats.averageScore}%</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Average Score</div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-200/50 dark:border-purple-800/50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{studentStats.bestSubject}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Best Subject</div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-200/50 dark:border-orange-800/50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">+{studentStats.improvementRate}%</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Improvement</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search evaluations by subject or exam type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50"
              />
            </div>
            <Button variant="outline" className="bg-white/50 dark:bg-slate-800/50">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation History */}
      <div className="space-y-4">
        {filteredEvaluations.map((evaluation) => (
          <Card
            key={evaluation.id}
            className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {evaluation.subject} - {evaluation.examType}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{evaluation.date}</p>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-semibold ${getGradeColor(evaluation.grade)}`}
                  >
                    {evaluation.grade}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {evaluation.score}/{evaluation.maxScore}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Score</span>
                  <span>{Math.round((evaluation.score / evaluation.maxScore) * 100)}%</span>
                </div>
                <Progress value={(evaluation.score / evaluation.maxScore) * 100} className="h-2" />
              </div>

              <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl mb-4 border border-blue-200/30 dark:border-blue-800/30">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-1">AI Teacher Feedback:</h4>
                <p className="text-blue-700 dark:text-blue-200 text-sm">{evaluation.feedback}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-white/50 dark:bg-slate-800/50">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="bg-white/50 dark:bg-slate-800/50">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="bg-white/50 dark:bg-slate-800/50">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Resubmit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Improvement Suggestions */}
      <Card className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-500" />
            AI Learning Recommendations
          </CardTitle>
          <CardDescription>Personalized suggestions based on your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                subject: "Physics",
                topic: "Mechanics",
                suggestion: "Practice more numerical problems on Newton's laws",
                priority: "High",
              },
              {
                subject: "Chemistry",
                topic: "Chemical Bonding",
                suggestion: "Review ionic and covalent bonding concepts",
                priority: "Medium",
              },
              {
                subject: "Mathematics",
                topic: "Trigonometry",
                suggestion: "Strengthen understanding of trigonometric identities",
                priority: "Low",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/30 dark:border-green-800/30"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300">
                      {item.subject} - {item.topic}
                    </h4>
                    <Badge
                      variant={
                        item.priority === "High" ? "destructive" : item.priority === "Medium" ? "default" : "secondary"
                      }
                      className="mt-1"
                    >
                      {item.priority} Priority
                    </Badge>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-green-700 dark:text-green-200 text-sm mb-3">{item.suggestion}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                    Start Learning
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white/50 dark:bg-slate-800/50">
                    Practice Quiz
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
