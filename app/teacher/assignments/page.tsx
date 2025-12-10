"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function TeacherAssignmentsPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="teacher" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Assignments</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Assignment Tracker</h2>
                <p className="text-green-700">Create, manage, and grade assignments</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Total Assignments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">12</p>
                    <p className="text-xs text-green-600 mt-1">This semester</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Pending Grading</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">34</p>
                    <p className="text-xs text-blue-600 mt-1">Submissions to grade</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Graded</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">78</p>
                    <p className="text-xs text-purple-600 mt-1">Completed</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Due Soon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">3</p>
                    <p className="text-xs text-blue-600 mt-1">In next 7 days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Create Assignment */}
              <Card className="border-green-200">
                <CardContent className="pt-6">
                  <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Assignment
                  </Button>
                </CardContent>
              </Card>

              {/* Assignments List */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Active Assignments</CardTitle>
                  <CardDescription>Your current assignments and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-green-200 hover:bg-green-50">
                          <TableHead className="text-green-900 font-semibold">Assignment</TableHead>
                          <TableHead className="text-green-900 font-semibold">Class</TableHead>
                          <TableHead className="text-green-900 font-semibold">Due Date</TableHead>
                          <TableHead className="text-green-900 font-semibold">Submissions</TableHead>
                          <TableHead className="text-green-900 font-semibold">Status</TableHead>
                          <TableHead className="text-green-900 font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { name: "Chapter 3 Quiz", class: "MATH101-P1", due: "2024-03-22", submissions: "28/28", status: "Graded" },
                          { name: "Algebra Problem Set", class: "MATH101-P2", due: "2024-03-25", submissions: "29/31", status: "In Progress" },
                          { name: "Midterm Exam", class: "MATH201", due: "2024-03-28", submissions: "18/24", status: "Open" },
                          { name: "Essay: Math in Nature", class: "MATH101-P1", due: "2024-03-30", submissions: "25/28", status: "Open" },
                        ].map((assignment, idx) => (
                          <TableRow key={idx} className="border-green-200 hover:bg-green-50">
                            <TableCell className="font-medium text-green-900">{assignment.name}</TableCell>
                            <TableCell className="text-green-700">{assignment.class}</TableCell>
                            <TableCell className="text-green-700">{assignment.due}</TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm text-green-900">{assignment.submissions}</div>
                                <Progress
                                  value={
                                    (parseInt(assignment.submissions.split("/")[0]) /
                                      parseInt(assignment.submissions.split("/")[1])) *
                                    100
                                  }
                                  className="h-2"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  assignment.status === "Graded"
                                    ? "bg-green-100 text-green-700"
                                    : assignment.status === "In Progress"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-amber-100 text-amber-700"
                                }
                              >
                                {assignment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50">
                                  <Edit className="h-4 w-4" />
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
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
