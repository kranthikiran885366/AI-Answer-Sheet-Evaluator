"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lightbulb, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"

export default function StudentFeedbackPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="student" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Feedback & Insights</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Feedback & Insights</h2>
                <p className="text-green-700">AI-generated feedback and learning insights</p>
              </div>

              {/* AI Feedback */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Latest AI Feedback</CardTitle>
                  <CardDescription>From your most recent evaluation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-900">Strengths</AlertTitle>
                    <AlertDescription className="text-green-700 mt-2">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Excellent understanding of algebraic concepts</li>
                        <li>Clear and well-organized solutions</li>
                        <li>Strong mathematical reasoning and logic</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">Areas for Improvement</AlertTitle>
                    <AlertDescription className="text-blue-700 mt-2">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Show intermediate steps more clearly</li>
                        <li>Double-check final answers for accuracy</li>
                        <li>Practice more complex word problems</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-blue-200 bg-blue-50">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">Recommendations</AlertTitle>
                    <AlertDescription className="text-blue-700 mt-2">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Review Module 3 on quadratic equations</li>
                        <li>Practice sample problems at the end of Chapter 4</li>
                        <li>Attend office hours to discuss complex problems</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Learning Pattern Insights */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Learning Pattern Insights</CardTitle>
                  <CardDescription>AI analysis of your learning patterns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      insight: "You perform best on problems involving algebraic manipulation",
                      confidence: 95,
                    },
                    {
                      insight: "Your scores improve when you review material the day before",
                      confidence: 87,
                    },
                    {
                      insight: "You struggle with application problems but excel at computational tasks",
                      confidence: 92,
                    },
                    {
                      insight: "Your attention to detail has improved significantly over the semester",
                      confidence: 88,
                    },
                  ].map((insight, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-green-900">{insight.insight}</p>
                        <Badge className="bg-green-100 text-green-700">{insight.confidence}% confidence</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Progress Recommendations */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Personalized Learning Path</CardTitle>
                  <CardDescription>Recommended steps for continued improvement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { step: 1, task: "Master word problem translation", difficulty: "Medium" },
                    { step: 2, task: "Practice systems of equations", difficulty: "Medium" },
                    { step: 3, task: "Study polynomial functions", difficulty: "Hard" },
                    { step: 4, task: "Review graphing techniques", difficulty: "Easy" },
                  ].map((rec, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-green-200 hover:bg-green-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold flex items-center justify-center">
                            {rec.step}
                          </div>
                          <p className="font-medium text-green-900">{rec.task}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            rec.difficulty === "Easy"
                              ? "border-green-300 bg-green-50"
                              : rec.difficulty === "Medium"
                                ? "border-amber-300 bg-amber-50"
                                : "border-red-300 bg-red-50"
                          }
                        >
                          {rec.difficulty}
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
