"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, TrendingUp } from "lucide-react"

export default function TeacherGradesPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="teacher" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Grade Analytics</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Grade Analytics</h2>
                <p className="text-green-700">Analyze grades, trends, and student performance</p>
              </div>

              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Class Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">87.4%</p>
                    <p className="text-xs text-green-600 mt-1">+2.3% from last exam</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Highest Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">98%</p>
                    <p className="text-xs text-blue-600 mt-1">Alice Johnson</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Lowest Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">62%</p>
                    <p className="text-xs text-purple-600 mt-1">Needs improvement</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-amber-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-900">Pass Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-amber-700">94.2%</p>
                    <p className="text-xs text-amber-600 mt-1">Students passing</p>
                  </CardContent>
                </Card>
              </div>

              {/* Grade Distribution */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>Distribution of grades across all students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { grade: "A (90-100%)", count: 12, percentage: 42 },
                    { grade: "B (80-89%)", count: 14, percentage: 48 },
                    { grade: "C (70-79%)", count: 2, percentage: 7 },
                    { grade: "D (60-69%)", count: 1, percentage: 3 },
                    { grade: "F (< 60%)", count: 0, percentage: 0 },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-green-900 font-medium">{item.grade}</span>
                        <span className="text-sm text-green-600">{item.count} students</span>
                      </div>
                      <Progress value={item.percentage} className="h-3" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Student Performance */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Your best performing students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-green-200 hover:bg-green-50">
                          <TableHead className="text-green-900 font-semibold">Student</TableHead>
                          <TableHead className="text-green-900 font-semibold">Current Grade</TableHead>
                          <TableHead className="text-green-900 font-semibold">Trend</TableHead>
                          <TableHead className="text-green-900 font-semibold">Performance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { name: "Alice Johnson", grade: 98, trend: "↑", performance: "Excellent" },
                          { name: "Emma Wilson", grade: 96, trend: "→", performance: "Excellent" },
                          { name: "Carol Davis", grade: 94, trend: "↑", performance: "Excellent" },
                          { name: "Frank Miller", grade: 92, trend: "↓", performance: "Very Good" },
                          { name: "Grace Lee", grade: 89, trend: "→", performance: "Very Good" },
                        ].map((student, idx) => (
                          <TableRow key={idx} className="border-green-200 hover:bg-green-50">
                            <TableCell className="font-medium text-green-900">{student.name}</TableCell>
                            <TableCell className="text-green-700">{student.grade}%</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-green-300 bg-green-50">
                                {student.trend} Stable
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-700">{student.performance}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Needs Improvement */}
              <Card className="border-amber-200 bg-amber-50/30">
                <CardHeader>
                  <CardTitle>Students Needing Support</CardTitle>
                  <CardDescription>Students with grades below 75%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "David Wilson", grade: 72, subject: "Algebra Fundamentals" },
                      { name: "Henry Brown", grade: 68, subject: "Problem Solving" },
                    ].map((student, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-amber-200 bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-900">{student.name}</p>
                            <p className="text-sm text-green-600">Struggling with: {student.subject}</p>
                          </div>
                          <Badge variant="outline" className="border-amber-300 bg-amber-100">
                            {student.grade}%
                          </Badge>
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
