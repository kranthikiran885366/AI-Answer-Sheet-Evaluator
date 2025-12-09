"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Target, Play, Pause } from "lucide-react"

export default function AdminTrainingPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="admin" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Training Pipeline</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Training Pipeline</h2>
                <p className="text-green-700">Manage model training jobs and pipelines</p>
              </div>

              {/* Training Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Total Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">127</p>
                    <p className="text-xs text-green-600 mt-1">Completed this month</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Active Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">3</p>
                    <p className="text-xs text-blue-600 mt-1">Currently running</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">98.4%</p>
                    <p className="text-xs text-purple-600 mt-1">Job completion rate</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-amber-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-900">Avg Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-amber-700">4.5 hrs</p>
                    <p className="text-xs text-amber-600 mt-1">Per training job</p>
                  </CardContent>
                </Card>
              </div>

              {/* Active Training Jobs */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Active Training Jobs</CardTitle>
                  <CardDescription>Currently running training jobs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Model Evaluation v3", progress: 75, eta: "2 hours", status: "running" },
                    { name: "OCR Model Fine-tune", progress: 45, eta: "4 hours", status: "running" },
                    { name: "Custom Rubric Model", progress: 25, eta: "6 hours", status: "running" },
                  ].map((job, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-green-900">{job.name}</p>
                          <p className="text-sm text-green-600 mt-1">ETA: {job.eta}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">
                          <Pause className="h-3 w-3 mr-1" />
                          Running
                        </Badge>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                      <p className="text-xs text-green-600 mt-2">{job.progress}% complete</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Jobs */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Recent Training Jobs</CardTitle>
                  <CardDescription>Last completed training jobs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Evaluation Model v2.5", status: "Completed", duration: "4h 32m", accuracy: "97.8%" },
                    { name: "OCR Enhancement", status: "Completed", duration: "3h 15m", accuracy: "96.5%" },
                    { name: "Rubric Optimizer", status: "Completed", duration: "5h 48m", accuracy: "95.2%" },
                    { name: "Custom Model Training", status: "Failed", duration: "2h 10m", accuracy: "N/A" },
                  ].map((job, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-green-200 hover:bg-green-50">
                      <div>
                        <p className="font-medium text-green-900">{job.name}</p>
                        <p className="text-sm text-green-600">Duration: {job.duration}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-green-300 bg-green-50">
                          {job.accuracy}
                        </Badge>
                        <Badge className={job.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Start New Training */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Start New Training Job</CardTitle>
                  <CardDescription>Create and start a new model training job</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Play className="h-4 w-4" />
                    Start Training Job
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
