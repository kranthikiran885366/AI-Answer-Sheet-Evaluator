"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, Eye, RotateCcw, BookOpen, TrendingUp, Award, Calendar } from "lucide-react"

export default function StudentPortal() {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock student data
  const studentData = {
    name: "Alex Johnson",
    studentId: "STU2024001",
    class: "Grade 10-A",
    overallGrade: "B+",
    totalEvaluations: 15,
    averageScore: 78,
  }

  const evaluationHistory = [
    {
      id: 1,
      subject: "Mathematics",
      examType: "Unit Test",
      date: "2024-01-15",
      score: 85,
      maxScore: 100,
      grade: "A",
      status: "Completed",
      feedback: "Excellent work! Strong understanding of algebraic concepts.",
    },
    {
      id: 2,
      subject: "Physics",
      examType: "Mid-term",
      date: "2024-01-12",
      score: 72,
      maxScore: 100,
      grade: "B",
      status: "Completed",
      feedback: "Good effort. Focus more on numerical problems and formulas.",
    },
    {
      id: 3,
      subject: "Chemistry",
      examType: "Quiz",
      date: "2024-01-10",
      score: 68,
      maxScore: 80,
      grade: "B",
      status: "Completed",
      feedback: "Understanding is good but need more practice with chemical equations.",
    },
    {
      id: 4,
      subject: "Biology",
      examType: "Assignment",
      date: "2024-01-08",
      score: 92,
      maxScore: 100,
      grade: "A+",
      status: "Completed",
      feedback: "Outstanding! Excellent diagrams and detailed explanations.",
    },
  ]

  const improvementSuggestions = [
    {
      subject: "Physics",
      topic: "Mechanics",
      suggestion: "Practice more numerical problems on Newton's laws",
      resources: ["Khan Academy Physics", "Physics Textbook Ch. 4-6"],
    },
    {
      subject: "Chemistry",
      topic: "Chemical Bonding",
      suggestion: "Review ionic and covalent bonding concepts",
      resources: ["Chemistry Lab Manual", "Online Simulation Tools"],
    },
    {
      subject: "Mathematics",
      topic: "Trigonometry",
      suggestion: "Strengthen understanding of trigonometric identities",
      resources: ["Math Practice Worksheets", "Video Tutorials"],
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

  const filteredHistory = evaluationHistory.filter(
    (item) =>
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.examType.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Portal</h2>
        <p className="text-gray-600">Track your academic progress and get personalized feedback</p>
      </div>

      {/* Student Info Card */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{studentData.name}</CardTitle>
              <CardDescription className="text-base">
                {studentData.studentId} • {studentData.class}
              </CardDescription>
            </div>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-white font-semibold ${getGradeColor(studentData.overallGrade)}`}
            >
              Overall: {studentData.overallGrade}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{studentData.totalEvaluations}</div>
              <div className="text-sm text-gray-600">Total Evaluations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{studentData.averageScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {evaluationHistory.filter((e) => e.grade.includes("A")).length}
              </div>
              <div className="text-sm text-gray-600">A Grades</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">Evaluation History</TabsTrigger>
          <TabsTrigger value="suggestions">Improvement Tips</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

        {/* Evaluation History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by subject or exam type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Cards */}
          <div className="space-y-4">
            {filteredHistory.map((evaluation) => (
              <Card key={evaluation.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {evaluation.subject} - {evaluation.examType}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {evaluation.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-white text-sm font-semibold ${getGradeColor(evaluation.grade)}`}
                      >
                        {evaluation.grade}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
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

                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <h4 className="font-semibold text-blue-800 text-sm mb-1">AI Teacher Feedback:</h4>
                    <p className="text-blue-700 text-sm">{evaluation.feedback}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Resubmit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Improvement Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Personalized Learning Recommendations
              </CardTitle>
              <CardDescription>AI-generated suggestions based on your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {improvementSuggestions.map((suggestion, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{suggestion.subject}</h4>
                        <Badge variant="outline" className="mt-1">
                          {suggestion.topic}
                        </Badge>
                      </div>
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>

                    <p className="text-gray-700 mb-4">{suggestion.suggestion}</p>

                    <div>
                      <h5 className="font-semibold text-sm mb-2">Recommended Resources:</h5>
                      <ul className="space-y-1">
                        {suggestion.resources.map((resource, idx) => (
                          <li key={idx} className="text-sm text-blue-600 hover:underline cursor-pointer">
                            • {resource}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button size="sm">Start Learning</Button>
                      <Button variant="outline" size="sm">
                        Take Practice Quiz
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tracking Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject-wise Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Subject-wise Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Mathematics", "Physics", "Chemistry", "Biology"].map((subject) => {
                    const score = Math.floor(Math.random() * 30 + 60)
                    return (
                      <div key={subject}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{subject}</span>
                          <span>{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-sm">Perfect Score!</p>
                      <p className="text-xs text-gray-600">Biology Assignment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <Award className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-sm">Improvement Streak</p>
                      <p className="text-xs text-gray-600">3 consecutive improvements</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <Award className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-sm">Quick Learner</p>
                      <p className="text-xs text-gray-600">Completed 5 practice quizzes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Trend</CardTitle>
              <CardDescription>Your average scores over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-4 p-4">
                {["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"].map((month, index) => {
                  const height = Math.floor(Math.random() * 60 + 40)
                  return (
                    <div key={month} className="flex flex-col items-center gap-2">
                      <div
                        className="bg-blue-500 rounded-t w-12 flex items-end justify-center text-white text-xs font-semibold pb-1"
                        style={{ height: `${height * 2}px` }}
                      >
                        {height + 20}%
                      </div>
                      <span className="text-xs text-gray-600">{month}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
