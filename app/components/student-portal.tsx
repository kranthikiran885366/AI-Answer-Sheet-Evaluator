"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { FileText, TrendingUp, Award, CheckCircle, BookOpen, Target, Star, Download } from "lucide-react"

export function StudentPortal() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const studentStats = {
    totalEvaluations: 24,
    averageScore: 82.5,
    bestSubject: "Mathematics",
    improvementRate: 15.2,
  }

  const recentResults = [
    {
      id: 1,
      subject: "Mathematics",
      score: 85,
      grade: "B+",
      date: "2024-01-15",
      feedback: "Good understanding of concepts",
    },
    {
      id: 2,
      subject: "Physics",
      score: 92,
      grade: "A",
      date: "2024-01-12",
      feedback: "Excellent problem-solving skills",
    },
    { id: 3, subject: "Chemistry", score: 78, grade: "B", date: "2024-01-10", feedback: "Need to work on equations" },
  ]

  const subjectProgress = [
    { subject: "Mathematics", score: 85, progress: 85, trend: "up" },
    { subject: "Physics", score: 92, progress: 92, trend: "up" },
    { subject: "Chemistry", score: 78, progress: 78, trend: "down" },
    { subject: "Biology", score: 88, progress: 88, trend: "up" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Student Portal</h2>
          <p className="text-gray-600">Track your academic progress and performance</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
                <p className="text-3xl font-bold text-blue-600">{studentStats.totalEvaluations}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-green-600">{studentStats.averageScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best Subject</p>
                <p className="text-xl font-bold text-purple-600">{studentStats.bestSubject}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Improvement</p>
                <p className="text-3xl font-bold text-orange-600">+{studentStats.improvementRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Results</CardTitle>
                <CardDescription>Your latest evaluation results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentResults.slice(0, 3).map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{result.subject}</p>
                        <p className="text-sm text-gray-600">{result.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{result.score}%</p>
                        <Badge variant="secondary">{result.grade}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>Your performance across subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectProgress.map((subject) => (
                    <div key={subject.subject} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{subject.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{subject.score}%</span>
                          <TrendingUp
                            className={`h-4 w-4 ${subject.trend === "up" ? "text-green-600" : "text-red-600"}`}
                          />
                        </div>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Results</CardTitle>
              <CardDescription>Complete history of your evaluations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentResults.map((result) => (
                  <div key={result.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{result.subject}</h4>
                        <p className="text-sm text-gray-600">{result.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{result.score}%</div>
                        <Badge className="mt-1">{result.grade}</Badge>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">{result.feedback}</p>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Track your improvement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {subjectProgress.map((subject) => (
                  <div key={subject.subject} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{subject.subject}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{subject.score}%</span>
                        <div className={`p-1 rounded-full ${subject.trend === "up" ? "bg-green-100" : "bg-red-100"}`}>
                          <TrendingUp
                            className={`h-4 w-4 ${subject.trend === "up" ? "text-green-600" : "text-red-600 rotate-180"}`}
                          />
                        </div>
                      </div>
                    </div>
                    <Progress value={subject.progress} className="h-3" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Beginner</span>
                      <span>Advanced</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Your academic milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="font-medium">Top Performer</p>
                    <p className="text-sm text-gray-600">Scored 90%+ in Mathematics</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Target className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">Consistent Learner</p>
                    <p className="text-sm text-gray-600">5 evaluations completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Improving Fast</p>
                    <p className="text-sm text-gray-600">15% improvement this month</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-medium">Subject Master</p>
                    <p className="text-sm text-gray-600">Excelling in Physics</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Feedback</CardTitle>
              <CardDescription>AI-generated insights to help you improve</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{result.subject}</h4>
                      <Badge variant="outline">{result.grade}</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm text-blue-800">{result.feedback}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Read
                        </Button>
                        <Button variant="outline" size="sm">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Study Resources
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
