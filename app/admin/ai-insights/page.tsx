"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react"

export default function AdminAIInsightsPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="admin" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">AI Insights</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">AI Insights & Recommendations</h2>
                <p className="text-green-700">Intelligent insights and optimization recommendations</p>
              </div>

              {/* Key Insights */}
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <Lightbulb className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-900">Performance Improvement Opportunity</AlertTitle>
                  <AlertDescription className="text-green-700">
                    OCR Model v2 is showing 2.3% accuracy improvement over v1. Consider migrating 10% of traffic to validate production readiness.
                  </AlertDescription>
                </Alert>

                <Alert className="border-blue-200 bg-blue-50">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-900">Usage Trend Analysis</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Evaluation API usage shows consistent 12% month-over-month growth. Recommend optimizing infrastructure capacity.
                  </AlertDescription>
                </Alert>

                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-900">Model Drift Detected</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Tesseract 5 model accuracy has declined 1.2% in the last 7 days. Recommend retraining with latest data.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Recommended Actions */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Recommended Actions</CardTitle>
                  <CardDescription>AI-generated recommendations for system optimization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      title: "Scale Evaluation Service",
                      description: "Add 2 more GPU instances to handle 15% increased traffic load",
                      priority: "High",
                      impact: "+23% throughput",
                    },
                    {
                      title: "Optimize Cache Strategy",
                      description: "Implement smart caching for frequently evaluated questions",
                      priority: "Medium",
                      impact: "-18% latency",
                    },
                    {
                      title: "Update OCR Models",
                      description: "Deploy latest OCR models showing 2.3% accuracy improvement",
                      priority: "High",
                      impact: "+2.3% accuracy",
                    },
                    {
                      title: "Implement Rate Limiting",
                      description: "Add rate limiting to prevent abuse and protect service stability",
                      priority: "Medium",
                      impact: "Stability +5%",
                    },
                  ].map((action, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-green-200 hover:bg-green-50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-green-900">{action.title}</h4>
                        <Badge className={action.priority === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}>
                          {action.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-green-700 mb-2">{action.description}</p>
                      <Badge variant="outline" className="border-green-300 bg-green-50">{action.impact}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Trend Analysis */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Trend Analysis</CardTitle>
                  <CardDescription>Key trends observed in system behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">User Growth Trajectory</h4>
                    <p className="text-sm text-green-700 mb-3">User base growing at 12.5% MoM with peak activity on weekdays (9 AM - 5 PM)</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-green-300 bg-green-50">+12.5% MoM</Badge>
                      <Badge variant="outline" className="border-blue-300 bg-blue-50">Accelerating</Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Model Confidence Scores</h4>
                    <p className="text-sm text-green-700 mb-3">Average confidence score across all models: 94.7%, with stable trend over last 30 days</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-green-300 bg-green-50">94.7% avg</Badge>
                      <Badge variant="outline" className="border-blue-300 bg-blue-50">Stable</Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Error Rate Patterns</h4>
                    <p className="text-sm text-green-700 mb-3">Error rate lowest on Tuesday-Thursday (0.2%), highest on Monday (0.4%)</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-green-300 bg-green-50">0.3% avg</Badge>
                      <Badge variant="outline" className="border-blue-300 bg-blue-50">Improving</Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Response Time Optimization</h4>
                    <p className="text-sm text-green-700 mb-3">Caching improvements have reduced avg response time by 32ms (12% improvement)</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-green-300 bg-green-50">-32ms</Badge>
                      <Badge variant="outline" className="border-blue-300 bg-blue-50">-12%</Badge>
                    </div>
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
