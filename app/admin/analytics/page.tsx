"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Activity, BarChart3, Users, FileText, Zap } from "lucide-react"

export default function AdminAnalyticsPage() {
  const analyticsData = [
    {
      title: "Total Evaluations",
      value: "15,247",
      change: "+23% from last month",
      icon: FileText,
      color: "bg-green-100 text-green-700",
      bgColor: "from-green-50 to-white",
    },
    {
      title: "Processing Speed",
      value: "2.3s avg",
      change: "-0.4s improvement",
      icon: Zap,
      color: "bg-blue-100 text-blue-700",
      bgColor: "from-blue-50 to-white",
    },
    {
      title: "Active Students",
      value: "2,847",
      change: "+12% from last month",
      icon: Users,
      color: "bg-purple-100 text-purple-700",
      bgColor: "from-purple-50 to-white",
    },
    {
      title: "AI Accuracy",
      value: "96.8%",
      change: "+1.2% improvement",
      icon: Activity,
      color: "bg-blue-100 text-blue-700",
      bgColor: "from-blue-50 to-white",
    },
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
              <h1 className="text-lg font-semibold text-green-900">System Analytics</h1>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <Activity className="h-3 w-3 mr-1" />
                  Real-time
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">System Analytics</h2>
                <p className="text-green-700">Usage and performance analytics for your institution</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analyticsData.map((metric, index) => (
                  <Card key={index} className={`border-green-200 bg-gradient-to-br ${metric.bgColor}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium text-green-900">{metric.title}</CardTitle>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metric.color}`}>
                          <metric.icon className="h-4 w-4" />
                        </div>
                      </div>
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
                    <CardTitle>Evaluation Distribution</CardTitle>
                    <CardDescription>Evaluations by subject area</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      { name: "Mathematics", value: 3847, percentage: 25 },
                      { name: "Science", value: 3254, percentage: 21 },
                      { name: "English", value: 2891, percentage: 19 },
                      { name: "History", value: 2456, percentage: 16 },
                      { name: "Other", value: 2799, percentage: 19 },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-green-900">{item.name}</span>
                          <span className="text-sm text-green-600">{item.value.toLocaleString()}</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>System performance over time</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      { name: "Uptime", value: 99.9 },
                      { name: "Accuracy", value: 96.8 },
                      { name: "Success Rate", value: 98.2 },
                      { name: "User Satisfaction", value: 94.5 },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-green-900">{item.name}</span>
                          <span className="text-sm font-bold text-green-700">{item.value}%</span>
                        </div>
                        <Progress value={item.value} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Statistics */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>Detailed breakdown of system usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-green-900">Daily Activity</h4>
                      {[
                        { day: "Monday", logins: 1247 },
                        { day: "Tuesday", logins: 1389 },
                        { day: "Wednesday", logins: 1156 },
                        { day: "Thursday", logins: 1423 },
                        { day: "Friday", logins: 1589 },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm text-green-700">{item.day}</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {item.logins.toLocaleString()}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-green-900">Device Types</h4>
                      {[
                        { type: "Desktop", percentage: 58 },
                        { type: "Mobile", percentage: 32 },
                        { type: "Tablet", percentage: 10 },
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-green-700">{item.type}</span>
                            <span className="text-sm font-medium text-green-900">{item.percentage}%</span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-green-900">Geographic Location</h4>
                      {[
                        { location: "United States", percentage: 65 },
                        { location: "Europe", percentage: 20 },
                        { location: "Asia", percentage: 15 },
                      ].map((item, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-green-700">{item.location}</span>
                            <span className="text-sm font-medium text-green-900">{item.percentage}%</span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      ))}
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
