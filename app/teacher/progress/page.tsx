"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown } from "lucide-react"

export default function TeacherProgressPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="teacher" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Student Progress</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Student Progress Tracking</h2>
                <p className="text-green-700">Monitor individual and class progress trends</p>
              </div>

              {/* Class Progress */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Class Progress Overview</CardTitle>
                  <CardDescription>Overall progress metrics by class</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { class: "MATH101-P1", completion: 92, avgGrade: 87.4, trend: "up" },
                    { class: "MATH101-P2", completion: 88, avgGrade: 85.2, trend: "up" },
                    { class: "MATH201", completion: 75, avgGrade: 82.1, trend: "down" },
                  ].map((cls, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-green-900">{cls.class}</h4>
                        <div className="flex items-center gap-2">
                          {cls.trend === "up" ? (
                            <Badge variant="outline" className="border-green-300 bg-green-50">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Improving
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-300 bg-amber-50">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Declining
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-green-900">Assignment Completion</span>
                          <span className="text-green-600">{cls.completion}%</span>
                        </div>
                        <Progress value={cls.completion} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-green-900">Average Grade</span>
                          <span className="text-green-600">{cls.avgGrade}%</span>
                        </div>
                        <Progress value={cls.avgGrade} className="h-2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Individual Student Progress */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Top 5 Improving Students</CardTitle>
                  <CardDescription>Students showing the most improvement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Emma Wilson", improvement: "+8.5%", from: "78%", to: "86.5%" },
                    { name: "Frank Miller", improvement: "+6.2%", from: "81%", to: "87.2%" },
                    { name: "Grace Lee", improvement: "+5.8%", from: "82%", to: "87.8%" },
                    { name: "Henry Brown", improvement: "+4.3%", from: "73%", to: "77.3%" },
                    { name: "Iris Chen", improvement: "+3.9%", from: "84%", to: "87.9%" },
                  ].map((student, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-green-200 hover:bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-green-900">{student.name}</p>
                        <Badge className="bg-green-100 text-green-700">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {student.improvement}
                        </Badge>
                      </div>
                      <p className="text-sm text-green-600">
                        {student.from} → {student.to}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* At-Risk Students */}
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader>
                  <CardTitle>Students Needing Support</CardTitle>
                  <CardDescription>Students showing declining or low progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "James Thompson", decline: "-5.2%", current: "72%" },
                    { name: "Kevin White", decline: "-2.1%", current: "68%" },
                  ].map((student, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-amber-200 bg-white">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-green-900">{student.name}</p>
                        <Badge variant="outline" className="border-amber-300 bg-amber-100">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {student.decline}
                        </Badge>
                      </div>
                      <p className="text-sm text-green-600 mt-1">Current: {student.current}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
