"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, Clock, Award, AlertTriangle, CheckCircle } from "lucide-react"

export default function Analytics() {
  const systemStats = {
    totalEvaluations: 1247,
    totalStudents: 156,
    totalTeachers: 12,
    averageProcessingTime: "2.3 minutes",
    accuracyRate: 94.2,
    timeSaved: "340 hours",
  }

  const subjectPerformance = [
    { subject: "Mathematics", avgScore: 78, totalEvaluations: 245, improvement: "+5.2%" },
    { subject: "Physics", avgScore: 72, totalEvaluations: 198, improvement: "+3.1%" },
    { subject: "Chemistry", avgScore: 81, totalEvaluations: 167, improvement: "+7.8%" },
    { subject: "Biology", avgScore: 85, totalEvaluations: 203, improvement: "+4.5%" },
    { subject: "English", avgScore: 76, totalEvaluations: 189, improvement: "+2.9%" },
  ]

  const recentActivity = [
    {
      type: "evaluation",
      message: "Mathematics quiz evaluated for Grade 10-A",
      time: "2 minutes ago",
      status: "success",
    },
    {
      type: "review",
      message: "Physics exam needs manual review (Low confidence)",
      time: "15 minutes ago",
      status: "warning",
    },
    { type: "evaluation", message: "Chemistry assignment batch completed", time: "1 hour ago", status: "success" },
    { type: "alert", message: "Plagiarism detected in English essay", time: "2 hours ago", status: "error" },
    { type: "evaluation", message: "Biology practical exam evaluated", time: "3 hours ago", status: "success" },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">System Analytics</h2>
        <p className="text-gray-600">Comprehensive insights into AI evaluation performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalEvaluations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across {systemStats.totalTeachers} teachers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.accuracyRate}%</div>
            <p className="text-xs text-muted-foreground">Compared to manual grading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.averageProcessingTime}</div>
            <p className="text-xs text-muted-foreground">Per answer sheet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.timeSaved}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <p className="text-xs text-muted-foreground">Successful evaluations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Performance Analytics Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Performance Overview</CardTitle>
              <CardDescription>Average scores and evaluation statistics by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {subjectPerformance.map((subject) => (
                  <div key={subject.subject} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{subject.subject}</h4>
                        <Badge variant="outline">{subject.totalEvaluations} evaluations</Badge>
                        <Badge variant={subject.improvement.startsWith("+") ? "default" : "secondary"}>
                          {subject.improvement}
                        </Badge>
                      </div>
                      <span className="text-lg font-bold">{subject.avgScore}%</span>
                    </div>
                    <Progress value={subject.avgScore} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { grade: "A+ (90-100%)", count: 89, percentage: 18 },
                    { grade: "A (80-89%)", count: 156, percentage: 32 },
                    { grade: "B+ (70-79%)", count: 134, percentage: 27 },
                    { grade: "B (60-69%)", count: 78, percentage: 16 },
                    { grade: "C+ (50-59%)", count: 34, percentage: 7 },
                  ].map((item) => (
                    <div key={item.grade} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.grade}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.percentage * 3}px` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evaluation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-800">Accuracy Improved</p>
                      <p className="text-sm text-green-600">AI accuracy increased by 2.3%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-blue-800">Processing Speed</p>
                      <p className="text-sm text-blue-600">15% faster than last month</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-purple-800">Student Satisfaction</p>
                      <p className="text-sm text-purple-600">4.8/5 average rating</p>
                    </div>
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Activity Log</CardTitle>
              <CardDescription>Real-time updates on evaluations and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Common Mistakes Identified</CardTitle>
                <CardDescription>AI-detected patterns in student errors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { mistake: "Incomplete mathematical working", frequency: 34, subject: "Mathematics" },
                    { mistake: "Missing key terminology", frequency: 28, subject: "Science" },
                    { mistake: "Grammatical errors", frequency: 22, subject: "English" },
                    { mistake: "Diagram labeling issues", frequency: 19, subject: "Biology" },
                    { mistake: "Formula application errors", frequency: 16, subject: "Physics" },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{item.mistake}</p>
                        <p className="text-xs text-gray-600">{item.subject}</p>
                      </div>
                      <Badge variant="secondary">{item.frequency}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>System-generated improvement suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 text-sm">Focus Areas</h4>
                    <p className="text-blue-700 text-sm">
                      Students need more practice with step-by-step problem solving in Mathematics
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 text-sm">Teaching Strategy</h4>
                    <p className="text-green-700 text-sm">Emphasize diagram drawing and labeling in Biology classes</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 text-sm">Resource Suggestion</h4>
                    <p className="text-purple-700 text-sm">
                      Provide additional grammar exercises for English improvement
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Model Performance</CardTitle>
              <CardDescription>Technical metrics and model accuracy statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">94.2%</div>
                  <div className="text-sm text-gray-600">Overall Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">87.5%</div>
                  <div className="text-sm text-gray-600">OCR Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">91.8%</div>
                  <div className="text-sm text-gray-600">Content Analysis</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
