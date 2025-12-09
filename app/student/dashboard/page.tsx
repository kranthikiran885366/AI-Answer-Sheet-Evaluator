"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileText, Bell, TrendingUp, Calendar, BookOpen, Zap, AlertCircle, CheckCircle } from "lucide-react"

export default function StudentDashboardPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="student" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">My Dashboard</h1>
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-green-700 hover:bg-green-50">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Welcome Section */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Welcome back, Alex!</h2>
                <p className="text-green-700">Here's your learning overview for today</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Current Grade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-700">A-</p>
                    <p className="text-xs text-green-600 mt-1">87.5%</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Pending Work</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-blue-700">2</p>
                    <p className="text-xs text-blue-600 mt-1">Submissions due</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Semester Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-purple-700">78%</p>
                    <p className="text-xs text-purple-600 mt-1">Complete</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-amber-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-900">Streak</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-amber-700">12</p>
                    <p className="text-xs text-amber-600 mt-1">Days learning</p>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts & Notifications */}
              <div className="space-y-3">
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-900">Upcoming Deadline</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Problem Set 6 due tomorrow at 11:59 PM - 2 problems remaining
                  </AlertDescription>
                </Alert>

                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-900">Great Progress!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    You've improved by 2.3% this month. Keep up the excellent work!
                  </AlertDescription>
                </Alert>
              </div>

              {/* Recent Activity & Upcoming */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Submissions */}
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle>Recent Evaluations</CardTitle>
                    <CardDescription>Your latest graded work</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { assignment: "Chapter 3 Quiz", score: 98, date: "2 days ago" },
                      { assignment: "Problem Set 5", score: 87, date: "1 week ago" },
                      { assignment: "Essay: Math in Nature", score: 92, date: "2 weeks ago" },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-green-200 hover:bg-green-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="font-medium text-green-900 text-sm">{item.assignment}</p>
                              <p className="text-xs text-green-600">{item.date}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">{item.score}%</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Upcoming Assignments */}
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle>Upcoming Due Dates</CardTitle>
                    <CardDescription>Your next deadlines</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { assignment: "Problem Set 6", due: "Tomorrow, 11:59 PM", priority: "high" },
                      { assignment: "Chapter 4 Quiz", due: "Friday, 5:00 PM", priority: "medium" },
                      { assignment: "Final Project", due: "2 weeks", priority: "medium" },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-green-200 hover:bg-green-50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-green-900 text-sm">{item.assignment}</p>
                          <Badge
                            variant="outline"
                            className={
                              item.priority === "high"
                                ? "border-red-300 bg-red-50 text-red-700"
                                : "border-amber-300 bg-amber-50 text-amber-700"
                            }
                          >
                            {item.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Calendar className="h-3 w-3" />
                          {item.due}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Learning Progress */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Topic Mastery</CardTitle>
                  <CardDescription>Your progress on key topics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { topic: "Linear Equations", mastery: 95 },
                    { topic: "Quadratic Equations", mastery: 87 },
                    { topic: "Polynomial Functions", mastery: 78 },
                  ].map((topic, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-green-900 font-medium">{topic.topic}</span>
                        <span className="text-sm text-green-600">{topic.mastery}%</span>
                      </div>
                      <Progress value={topic.mastery} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="flex gap-3 flex-wrap">
                <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                  <FileText className="h-4 w-4" />
                  View Evaluations
                </Button>
                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 gap-2">
                  <BookOpen className="h-4 w-4" />
                  Study Resources
                </Button>
                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 gap-2">
                  <TrendingUp className="h-4 w-4" />
                  View Progress
                </Button>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
