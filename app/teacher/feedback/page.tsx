"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send } from "lucide-react"

export default function TeacherFeedbackPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="teacher" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Feedback Generator</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Feedback Generator</h2>
                <p className="text-green-700">Generate and manage student feedback</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Feedback Sent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">156</p>
                    <p className="text-xs text-green-600 mt-1">This semester</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Avg Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">3.2 days</p>
                    <p className="text-xs text-blue-600 mt-1">After submission</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Pending Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">23</p>
                    <p className="text-xs text-purple-600 mt-1">Awaiting feedback</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Feedback */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Recent Submissions Awaiting Feedback</CardTitle>
                  <CardDescription>Students waiting for your feedback</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { student: "Alice Johnson", assignment: "Chapter 3 Quiz", status: "Needs Feedback", days: "2" },
                    { student: "Bob Smith", assignment: "Problem Set", status: "Needs Feedback", days: "1" },
                    { student: "Carol Davis", assignment: "Essay", status: "Waiting", days: "3" },
                    { student: "David Wilson", assignment: "Project", status: "Needs Feedback", days: "4" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-green-200 hover:bg-green-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-green-900">{item.student}</p>
                          <p className="text-sm text-green-600 mt-1">{item.assignment}</p>
                          <p className="text-xs text-green-500 mt-1">Submitted {item.days} days ago</p>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-2">
                          <MessageSquare className="h-3 w-3" />
                          Send Feedback
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Feedback Templates */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Feedback Templates</CardTitle>
                  <CardDescription>Quick templates for common feedback</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Excellent work! Clear understanding of the concepts.",
                    "Good effort. Review the section on [topic] and try again.",
                    "You're on the right track. Focus on [specific area] for improvement.",
                    "Great improvement! Keep up the strong work.",
                  ].map((template, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-green-200 hover:bg-green-50 cursor-pointer">
                      <p className="text-sm text-green-900">{template}</p>
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
