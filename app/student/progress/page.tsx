"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Award } from "lucide-react"

export default function StudentProgressPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="student" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Progress Tracking</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Your Academic Progress</h2>
                <p className="text-green-700">Track your learning progress throughout the semester</p>
              </div>

              {/* Overall Progress */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Overall Grade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-700">A-</p>
                    <p className="text-xs text-green-600 mt-2">87.5% (Excellent)</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Semester Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">78%</p>
                    <Progress value={78} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                      <div>
                        <p className="text-sm font-bold text-purple-700">Improving</p>
                        <p className="text-xs text-purple-600">+2.3% from last month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subject Progress */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Progress by Topic</CardTitle>
                  <CardDescription>Your mastery level for each topic</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { topic: "Linear Equations", mastery: 95, level: "Expert" },
                    { topic: "Quadratic Equations", mastery: 87, level: "Advanced" },
                    { topic: "Polynomial Functions", mastery: 78, level: "Intermediate" },
                    { topic: "Graphing", mastery: 72, level: "Intermediate" },
                    { topic: "Word Problems", mastery: 62, level: "Developing" },
                    { topic: "Systems of Equations", mastery: 85, level: "Advanced" },
                  ].map((subject, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium text-green-900">{subject.topic}</span>
                          <Badge variant="outline" className="ml-2 text-xs border-green-300 bg-green-50">
                            {subject.level}
                          </Badge>
                        </div>
                        <span className="text-sm text-green-600 font-semibold">{subject.mastery}%</span>
                      </div>
                      <Progress value={subject.mastery} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Achievements & Milestones</CardTitle>
                  <CardDescription>Your academic accomplishments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { achievement: "Perfect Score", icon: "🏆", description: "Scored 100% on Quiz 2" },
                    { achievement: "Consistent Performer", icon: "📈", description: "Maintained A grade for 3 weeks" },
                    { achievement: "Quick Learner", icon: "⚡", description: "Mastered a topic in record time" },
                    { achievement: "Improvement Champion", icon: "🎯", description: "Improved 15% from first to latest exam" },
                  ].map((achievement, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-green-200 hover:bg-green-50">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <p className="font-semibold text-green-900">{achievement.achievement}</p>
                          <p className="text-sm text-green-600 mt-1">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Monthly Breakdown */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>Your grades month by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { month: "January", grade: 82, trend: "→" },
                      { month: "February", grade: 85, trend: "↑" },
                      { month: "March", grade: 87.5, trend: "↑" },
                    ].map((monthly, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-green-200 hover:bg-green-50">
                        <p className="font-medium text-green-900">{monthly.month}</p>
                        <div className="flex items-center gap-3">
                          <Progress value={monthly.grade} className="w-32 h-2" />
                          <div className="text-right min-w-20">
                            <p className="font-bold text-green-700">{monthly.grade}%</p>
                            <p className="text-sm text-green-600">{monthly.trend}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
