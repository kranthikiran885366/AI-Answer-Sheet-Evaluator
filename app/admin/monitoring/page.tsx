"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Activity, Server, Database, Cpu, HardDrive, Wifi, AlertTriangle, CheckCircle } from "lucide-react"

export default function AdminMonitoringPage() {
  const systemStatus = [
    { name: "API Server", status: "online", uptime: "99.99%", latency: "45ms", icon: Server },
    { name: "Database", status: "online", uptime: "99.95%", latency: "12ms", icon: Database },
    { name: "Cache Server", status: "online", uptime: "99.92%", latency: "8ms", icon: Activity },
    { name: "Message Queue", status: "online", uptime: "99.88%", latency: "23ms", icon: Wifi },
  ]

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="admin" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Server Monitoring</h1>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <Activity className="h-3 w-3 mr-1" />
                  All Systems Operational
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Server Monitoring</h2>
                <p className="text-green-700">Real-time monitoring of system health and performance</p>
              </div>

              {/* System Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700 flex items-center gap-2">
                      <CheckCircle className="h-6 w-6" />
                      Healthy
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">CPU Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">34%</p>
                    <Progress value={34} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">56%</p>
                    <Progress value={56} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-amber-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-900">Disk Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-amber-700">42%</p>
                    <Progress value={42} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Service Status */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Service Status</CardTitle>
                  <CardDescription>Status of core system services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemStatus.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-green-200 hover:bg-green-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <service.icon className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                          <p className="font-medium text-green-900">{service.name}</p>
                          <div className="flex gap-4 text-xs text-green-600 mt-1">
                            <span>Latency: {service.latency}</span>
                            <span>Uptime: {service.uptime}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Resource Usage */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                  <CardDescription>Current resource usage by service</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-green-900">By Service</h4>
                      {[
                        { service: "API Server", usage: 28 },
                        { service: "Database", usage: 45 },
                        { service: "Cache Server", usage: 18 },
                        { service: "Workers", usage: 35 },
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-green-900">{item.service}</span>
                            <span className="text-sm font-medium text-green-700">{item.usage}%</span>
                          </div>
                          <Progress value={item.usage} className="h-2" />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-green-900">By Resource Type</h4>
                      {[
                        { resource: "CPU", usage: 34 },
                        { resource: "Memory", usage: 56 },
                        { resource: "Disk", usage: 42 },
                        { resource: "Network", usage: 15 },
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-green-900">{item.resource}</span>
                            <span className="text-sm font-medium text-green-700">{item.usage}%</span>
                          </div>
                          <Progress value={item.usage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>Recent system alerts and notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-900">All Systems Operational</AlertTitle>
                    <AlertDescription className="text-green-700">No critical alerts at this time</AlertDescription>
                  </Alert>

                  <Alert className="border-blue-200 bg-blue-50">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">Regular Maintenance Scheduled</AlertTitle>
                    <AlertDescription className="text-blue-700">Database maintenance scheduled for tonight at 2:00 AM</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
