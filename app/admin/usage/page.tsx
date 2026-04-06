"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { PieChart } from "lucide-react"

export default function AdminUsagePage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="admin" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Usage Statistics</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Usage Statistics</h2>
                <p className="text-green-700">System usage and resource consumption analytics</p>
              </div>

              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Total API Calls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">1,247,583</p>
                    <p className="text-xs text-green-600 mt-1">This month</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Storage Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">85.3 GB</p>
                    <p className="text-xs text-blue-600 mt-1">56% of quota</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Bandwidth Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">2.4 TB</p>
                    <p className="text-xs text-purple-600 mt-1">This month</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Compute Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">342 hrs</p>
                    <p className="text-xs text-blue-600 mt-1">This month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle>API Usage by Type</CardTitle>
                    <CardDescription>Distribution of API calls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { type: "Evaluation API", usage: "45%", calls: 561231 },
                      { type: "OCR API", usage: "28%", calls: 349328 },
                      { type: "Upload API", usage: "18%", calls: 224565 },
                      { type: "Analytics API", usage: "9%", calls: 112282 },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-green-900 font-medium">{item.type}</span>
                          <span className="text-sm text-green-600">{item.calls.toLocaleString()}</span>
                        </div>
                        <Progress value={parseInt(item.usage)} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle>Resource Consumption</CardTitle>
                    <CardDescription>Resource usage breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { resource: "CPU Time", usage: 34, percentage: "34%" },
                      { resource: "Memory", usage: 56, percentage: "56%" },
                      { resource: "Storage", usage: 42, percentage: "42%" },
                      { resource: "Bandwidth", usage: 28, percentage: "28%" },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-green-900 font-medium">{item.resource}</span>
                          <span className="text-sm text-green-600">{item.percentage}</span>
                        </div>
                        <Progress value={item.usage} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Daily Usage */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Daily Usage Trends</CardTitle>
                  <CardDescription>Last 7 days of usage data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { day: "Monday", calls: 185234, trend: "↑" },
                      { day: "Tuesday", calls: 198456, trend: "↑" },
                      { day: "Wednesday", calls: 172345, trend: "↓" },
                      { day: "Thursday", calls: 203456, trend: "↑" },
                      { day: "Friday", calls: 215678, trend: "↑" },
                      { day: "Saturday", calls: 145234, trend: "↓" },
                      { day: "Sunday", calls: 127345, trend: "↓" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-green-200 hover:bg-green-50">
                        <div>
                          <p className="font-medium text-green-900">{item.day}</p>
                          <p className="text-sm text-green-600">{item.calls.toLocaleString()} API calls</p>
                        </div>
                        <Badge variant="outline" className={item.trend === "↑" ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}>
                          {item.trend} {Math.floor(Math.random() * 20 + 5)}%
                        </Badge>
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
