"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Zap, Activity } from "lucide-react"

export default function AdminPerformancePage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="admin" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Performance Metrics</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Performance Metrics</h2>
                <p className="text-green-700">System performance indicators and optimization metrics</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: "Avg Response Time", value: "245ms", change: "-15ms improvement", icon: Zap },
                  { title: "Request Throughput", value: "1,245/s", change: "+120 req/s", icon: Activity },
                  { title: "Error Rate", value: "0.3%", change: "-0.1%", icon: BarChart3 },
                  { title: "Cache Hit Rate", value: "87.2%", change: "+2.3%", icon: TrendingUp },
                ].map((metric, idx) => (
                  <Card key={idx} className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-900">{metric.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-700">{metric.value}</p>
                      <p className="text-xs text-green-600 mt-1">{metric.change}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Performance Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle>Response Time by Endpoint</CardTitle>
                    <CardDescription>Average response times for API endpoints</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { endpoint: "/api/evaluate", time: "234ms", percentage: 45 },
                      { endpoint: "/api/ocr", time: "567ms", percentage: 78 },
                      { endpoint: "/api/upload", time: "123ms", percentage: 25 },
                      { endpoint: "/api/results", time: "89ms", percentage: 18 },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-green-900 font-medium">{item.endpoint}</span>
                          <span className="text-sm text-green-600">{item.time}</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle>Request Distribution</CardTitle>
                    <CardDescription>Traffic distribution across services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { service: "Evaluation Service", requests: "45%", count: 560 },
                      { service: "OCR Service", requests: "28%", count: 348 },
                      { service: "Upload Service", requests: "18%", count: 224 },
                      { service: "Analytics Service", requests: "9%", count: 112 },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-green-900 font-medium">{item.service}</span>
                          <span className="text-sm text-green-600">{item.requests} ({item.count})</span>
                        </div>
                        <Progress value={parseInt(item.requests)} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Performance */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Service Performance</CardTitle>
                  <CardDescription>Detailed performance metrics by service</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Evaluation Engine",
                        uptime: 99.95,
                        latency: "234ms",
                        throughput: "450/s",
                        errors: 0.1,
                      },
                      {
                        name: "OCR Engine",
                        uptime: 99.88,
                        latency: "567ms",
                        throughput: "280/s",
                        errors: 0.25,
                      },
                      {
                        name: "Database",
                        uptime: 99.99,
                        latency: "45ms",
                        throughput: "2K/s",
                        errors: 0.05,
                      },
                    ].map((service, idx) => (
                      <div key={idx} className="p-4 rounded-lg border border-green-200">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div>
                            <p className="text-xs text-green-600 uppercase font-semibold">Service</p>
                            <p className="text-sm font-medium text-green-900 mt-1">{service.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-green-600 uppercase font-semibold">Uptime</p>
                            <Badge className="mt-1 bg-green-100 text-green-700">{service.uptime}%</Badge>
                          </div>
                          <div>
                            <p className="text-xs text-green-600 uppercase font-semibold">Latency</p>
                            <p className="text-sm font-medium text-green-900 mt-1">{service.latency}</p>
                          </div>
                          <div>
                            <p className="text-xs text-green-600 uppercase font-semibold">Throughput</p>
                            <p className="text-sm font-medium text-green-900 mt-1">{service.throughput}</p>
                          </div>
                          <div>
                            <p className="text-xs text-green-600 uppercase font-semibold">Error Rate</p>
                            <p className="text-sm font-medium text-green-900 mt-1">{service.errors}%</p>
                          </div>
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
