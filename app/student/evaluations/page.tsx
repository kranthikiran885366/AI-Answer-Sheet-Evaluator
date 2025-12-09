"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Download, FileText } from "lucide-react"

export default function StudentEvaluationsPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="student" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">My Evaluations</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">My Evaluations</h2>
                <p className="text-green-700">View your graded papers and evaluation results</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Avg Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">87.5%</p>
                    <p className="text-xs text-green-600 mt-1">Excellent</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Papers Evaluated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">12</p>
                    <p className="text-xs text-blue-600 mt-1">This semester</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Latest Grade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">A</p>
                    <p className="text-xs text-purple-600 mt-1">Quiz 3</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-amber-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-900">Pending Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-amber-700">2</p>
                    <p className="text-xs text-amber-600 mt-1">Awaiting</p>
                  </CardContent>
                </Card>
              </div>

              {/* Evaluations Table */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Your Evaluated Papers</CardTitle>
                  <CardDescription>All your graded submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-green-200 hover:bg-green-50">
                          <TableHead className="text-green-900 font-semibold">Assignment</TableHead>
                          <TableHead className="text-green-900 font-semibold">Score</TableHead>
                          <TableHead className="text-green-900 font-semibold">Grade</TableHead>
                          <TableHead className="text-green-900 font-semibold">Confidence</TableHead>
                          <TableHead className="text-green-900 font-semibold">Date</TableHead>
                          <TableHead className="text-green-900 font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { assignment: "Chapter 3 Quiz", score: 98, grade: "A+", confidence: 99, date: "2024-03-20" },
                          { assignment: "Problem Set 5", score: 87, grade: "B+", confidence: 94, date: "2024-03-18" },
                          { assignment: "Essay: Math in Nature", score: 92, grade: "A-", confidence: 96, date: "2024-03-15" },
                          { assignment: "Exam 1", score: 85, grade: "B", confidence: 92, date: "2024-03-10" },
                          { assignment: "Problem Set 4", score: 88, grade: "B+", confidence: 95, date: "2024-03-05" },
                        ].map((evaluation, idx) => (
                          <TableRow key={idx} className="border-green-200 hover:bg-green-50">
                            <TableCell className="font-medium text-green-900">{evaluation.assignment}</TableCell>
                            <TableCell className="text-green-700">{evaluation.score}%</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-700">{evaluation.grade}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-green-700">{evaluation.confidence}%</span>
                                <Progress value={evaluation.confidence} className="w-16 h-2" />
                              </div>
                            </TableCell>
                            <TableCell className="text-green-700 text-sm">{evaluation.date}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Evaluations */}
              <Card className="border-amber-200 bg-amber-50/30">
                <CardHeader>
                  <CardTitle>Pending Evaluations</CardTitle>
                  <CardDescription>Papers waiting for evaluation feedback</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { assignment: "Problem Set 6", submitted: "2024-03-22", status: "Under Review" },
                    { assignment: "Final Project", submitted: "2024-03-21", status: "Queued" },
                  ].map((pending, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-amber-200 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-900">{pending.assignment}</p>
                          <p className="text-sm text-green-600">Submitted: {pending.submitted}</p>
                        </div>
                        <Badge variant="outline" className="border-amber-300 bg-amber-100">
                          {pending.status}
                        </Badge>
                      </div>
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
