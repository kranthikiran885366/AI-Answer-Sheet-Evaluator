"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { BarChart3 } from "lucide-react"

export default function AdminModelPerformancePage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="admin" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Model Performance</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Model Performance Metrics</h2>
                <p className="text-green-700">Detailed performance analysis of AI models</p>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Avg Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">96.8%</p>
                    <p className="text-xs text-green-600 mt-1">All models</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Precision</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">94.5%</p>
                    <p className="text-xs text-blue-600 mt-1">Positive predictions</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Recall</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">95.2%</p>
                    <p className="text-xs text-purple-600 mt-1">True positives found</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">F1 Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">94.8%</p>
                    <p className="text-xs text-blue-600 mt-1">Harmonic mean</p>
                  </CardContent>
                </Card>
              </div>

              {/* Model Comparison */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Model Comparison</CardTitle>
                  <CardDescription>Performance comparison of all active models</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { name: "GPT-4 Evaluator", accuracy: 98.5, precision: 97.2, recall: 96.8, f1: 97.0 },
                    { name: "Claude 3 Evaluator", accuracy: 97.2, precision: 95.8, recall: 96.5, f1: 96.1 },
                    { name: "PaddleOCR", accuracy: 96.1, precision: 94.2, recall: 95.8, f1: 95.0 },
                    { name: "Tesseract 5", accuracy: 94.8, precision: 92.5, recall: 94.2, f1: 93.3 },
                  ].map((model, idx) => (
                    <div key={idx} className="space-y-3">
                      <h4 className="font-semibold text-green-900">{model.name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Accuracy", value: model.accuracy },
                          { label: "Precision", value: model.precision },
                          { label: "Recall", value: model.recall },
                          { label: "F1 Score", value: model.f1 },
                        ].map((metric, mIdx) => (
                          <div key={mIdx}>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-green-600">{metric.label}</span>
                              <span className="text-xs font-medium text-green-900">{metric.value}%</span>
                            </div>
                            <Progress value={metric.value} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Confusion Matrix */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Error Analysis</CardTitle>
                  <CardDescription>Common error patterns and false predictions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { type: "True Positives", count: 8453, percentage: 94.2 },
                    { type: "True Negatives", count: 1234, percentage: 98.7 },
                    { type: "False Positives", count: 67, percentage: 0.8 },
                    { type: "False Negatives", count: 156, percentage: 1.3 },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-green-900 font-medium">{item.type}</span>
                        <span className="text-sm text-green-600">{item.count}</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
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
