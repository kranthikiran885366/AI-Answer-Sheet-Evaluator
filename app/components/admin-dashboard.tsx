"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  FileText,
  TrendingUp,
  Settings,
  Database,
  Server,
  Activity,
  AlertTriangle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Upload,
  RefreshCw,
  Shield,
  Cpu,
  HardDrive,
  Wifi,
  Monitor,
  Brain,
  Target,
  Award,
  Eye,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Minus,
  GraduationCap,
  Scan,
} from "lucide-react"

interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalEvaluations: number
  todayEvaluations: number
  systemUptime: string
  averageProcessingTime: number
  accuracyRate: number
  errorRate: number
  revenue: number
  growth: number
}

interface UserStats {
  admins: number
  teachers: number
  students: number
  newUsersToday: number
  activeInstitutions: number
  totalInstitutions: number
}

interface SystemHealth {
  cpu: number
  memory: number
  disk: number
  network: number
  database: string
  redis: string
  mongodb: string
  aiModels: number
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalUsers: 2847,
    activeUsers: 1256,
    totalEvaluations: 15247,
    todayEvaluations: 89,
    systemUptime: "99.9%",
    averageProcessingTime: 2.3,
    accuracyRate: 94.8,
    errorRate: 0.2,
    revenue: 125000,
    growth: 12.5,
  })

  const [userStats, setUserStats] = useState<UserStats>({
    admins: 5,
    teachers: 234,
    students: 2608,
    newUsersToday: 12,
    activeInstitutions: 156,
    totalInstitutions: 189,
  })

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpu: 45,
    memory: 62,
    disk: 38,
    network: 23,
    database: "healthy",
    redis: "healthy",
    mongodb: "healthy",
    aiModels: 15,
  })

  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch("/api/status")
        if (response.ok) {
          const data = await response.json()
          setSystemMetrics((prev) => ({
            ...prev,
            activeUsers: data.active_users || prev.activeUsers,
          }))
        }
      } catch (error) {
        console.log("Using mock data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSystemStatus()
  }, [])

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/status")
      if (response.ok) {
        const data = await response.json()
        setSystemMetrics((prev) => ({
          ...prev,
          activeUsers: data.active_users || prev.activeUsers + Math.floor(Math.random() * 10),
          todayEvaluations: prev.todayEvaluations + Math.floor(Math.random() * 5),
        }))
      }
    } catch (error) {
      console.log("Refresh failed, using mock data")
      setSystemMetrics((prev) => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10),
        todayEvaluations: prev.todayEvaluations + Math.floor(Math.random() * 5),
      }))
    }
    setIsRefreshing(false)
  }

  const recentActivities = [
    {
      id: 1,
      type: "evaluation",
      message: "Batch evaluation completed for Lincoln High School",
      time: "2 minutes ago",
      status: "success",
      user: "System",
      details: "125 papers processed",
    },
    {
      id: 2,
      type: "user",
      message: "New institution registered: Stanford University",
      time: "5 minutes ago",
      status: "info",
      user: "Registration System",
      details: "Premium plan activated",
    },
    {
      id: 3,
      type: "system",
      message: "AI model accuracy improved to 94.8%",
      time: "10 minutes ago",
      status: "success",
      user: "ML Pipeline",
      details: "GPT-4 integration optimized",
    },
    {
      id: 4,
      type: "error",
      message: "OCR processing completed successfully",
      time: "15 minutes ago",
      status: "success",
      user: "OCR Engine",
      details: "Handwriting quality optimized",
    },
    {
      id: 5,
      type: "security",
      message: "Security scan completed successfully",
      time: "20 minutes ago",
      status: "success",
      user: "Security System",
      details: "No vulnerabilities found",
    },
  ]

  const systemAlerts = [
    {
      id: 1,
      type: "info",
      title: "System Status",
      message: "All systems operational and running smoothly",
      priority: "low",
      time: "5 minutes ago",
    },
    {
      id: 2,
      type: "info",
      title: "Scheduled Maintenance",
      message: "System maintenance scheduled for next week at 2 AM UTC",
      priority: "low",
      time: "1 hour ago",
    },
    {
      id: 3,
      type: "success",
      title: "Backup Completed",
      message: "Daily backup completed successfully - 2.4TB archived",
      priority: "low",
      time: "2 hours ago",
    },
    {
      id: 4,
      type: "info",
      title: "License Status",
      message: "AI model license valid until next month",
      priority: "low",
      time: "3 hours ago",
    },
  ]

  const topInstitutions = [
    { name: "Stanford University", users: 1250, evaluations: 15420, plan: "Enterprise" },
    { name: "MIT", users: 980, evaluations: 12340, plan: "Enterprise" },
    { name: "Harvard University", users: 850, evaluations: 9870, plan: "Enterprise" },
    { name: "UC Berkeley", users: 720, evaluations: 8560, plan: "Professional" },
    { name: "Oxford University", users: 650, evaluations: 7890, plan: "Professional" },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "evaluation":
        return <FileText className="h-4 w-4" />
      case "user":
        return <Users className="h-4 w-4" />
      case "system":
        return <Settings className="h-4 w-4" />
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      case "security":
        return <Shield className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50"
      case "warning":
        return "text-orange-600 bg-orange-50"
      case "error":
        return "text-red-600 bg-red-50"
      case "info":
        return "text-green-600 bg-green-50"
      default:
        return "text-green-600 bg-green-50"
    }
  }

  const getHealthColor = (value: number) => {
    if (value < 50) return "text-green-600"
    if (value < 80) return "text-orange-600"
    return "text-red-600"
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="h-4 w-4 text-green-600" />
    if (growth < 0) return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-green-600" />
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-white via-green-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-green-900">Admin Dashboard</h1>
          <p className="text-green-700 mt-2 text-lg">System overview and management controls</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isRefreshing}
            className="shadow-sm bg-white border-green-300 text-green-700 hover:bg-green-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button className="shadow-sm bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm rounded-xl p-1 border border-green-200">
          <TabsTrigger
            value="overview"
            className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            System
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            AI Models
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <Card className="bg-white border border-green-200 shadow-sm hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-900">Total Users</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{systemMetrics.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-green-600 mt-1">
                  <ArrowUp className="h-3 w-3 inline mr-1" />
                  {systemMetrics.growth}% from last month
                </p>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card className="bg-white border border-green-200 shadow-sm hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-900">Active Users</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{systemMetrics.activeUsers.toLocaleString()}</div>
                <p className="text-xs text-green-600 mt-1">Online now</p>
              </CardContent>
            </Card>

            {/* Total Evaluations */}
            <Card className="bg-white border border-green-200 shadow-sm hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-900">Total Evaluations</CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{systemMetrics.totalEvaluations.toLocaleString()}</div>
                <p className="text-xs text-green-600 mt-1">{systemMetrics.todayEvaluations} today</p>
              </CardContent>
            </Card>

            {/* Monthly Revenue */}
            <Card className="bg-white border border-green-200 shadow-sm hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-900">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">${(systemMetrics.revenue / 1000).toFixed(1)}K</div>
                <p className="text-xs text-green-600 mt-1">
                  <ArrowUp className="h-3 w-3 inline mr-1" />
                  15.2% growth
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Performance & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Performance */}
            <Card className="bg-white border border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900">System Performance</CardTitle>
                <CardDescription className="text-green-600">Real-time system metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-green-900">CPU Usage</span>
                    <span className={`text-sm font-semibold ${getHealthColor(systemHealth.cpu)}`}>
                      {systemHealth.cpu}%
                    </span>
                  </div>
                  <Progress value={systemHealth.cpu} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-green-900">Memory Usage</span>
                    <span className={`text-sm font-semibold ${getHealthColor(systemHealth.memory)}`}>
                      {systemHealth.memory}%
                    </span>
                  </div>
                  <Progress value={systemHealth.memory} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-green-900">Disk Usage</span>
                    <span className={`text-sm font-semibold ${getHealthColor(systemHealth.disk)}`}>
                      {systemHealth.disk}%
                    </span>
                  </div>
                  <Progress value={systemHealth.disk} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white border border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900">Recent Activity</CardTitle>
                <CardDescription className="text-green-600">Latest system events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-60 overflow-y-auto">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className={`p-3 rounded-lg ${getStatusColor(activity.status)}`}>
                    <div className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.message}</p>
                        <p className="text-xs opacity-70 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900">Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-900">{userStats.admins}</p>
                <p className="text-sm text-green-600 mt-2">System administrators</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900">Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-900">{userStats.teachers}</p>
                <p className="text-sm text-green-600 mt-2">Active instructors</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-900">{userStats.students}</p>
                <p className="text-sm text-green-600 mt-2">Active learners</p>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-white border border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Top Institutions</CardTitle>
              <CardDescription className="text-green-600">Organizations by activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topInstitutions.map((inst, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">{inst.name}</p>
                      <p className="text-sm text-green-600">{inst.users.toLocaleString()} users</p>
                    </div>
                    <Badge className="bg-green-600 text-white">{inst.plan}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-green-100 text-green-800">{systemHealth.database}</Badge>
                <p className="text-sm text-green-600 mt-2">PostgreSQL connection active</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Redis Cache
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-green-100 text-green-800">{systemHealth.redis}</Badge>
                <p className="text-sm text-green-600 mt-2">Cache layer operational</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-white border border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Evaluation Metrics</CardTitle>
              <CardDescription className="text-green-600">AI accuracy and performance statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-green-900 font-medium mb-2">AI Accuracy Rate</p>
                  <p className="text-3xl font-bold text-green-900">{systemMetrics.accuracyRate}%</p>
                  <Progress value={systemMetrics.accuracyRate} className="mt-2" />
                </div>
                <div>
                  <p className="text-sm text-green-900 font-medium mb-2">Avg Processing Time</p>
                  <p className="text-3xl font-bold text-green-900">{systemMetrics.averageProcessingTime}s</p>
                  <p className="text-sm text-green-600 mt-2">Per document</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Models Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card className="bg-white border border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Models Status
              </CardTitle>
              <CardDescription className="text-green-600">Active AI model instances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "GPT-4", status: "Active", accuracy: 96 },
                  { name: "Claude 3", status: "Active", accuracy: 95 },
                  { name: "OCR Engine", status: "Active", accuracy: 98 },
                  { name: "Custom LLM", status: "Active", accuracy: 92 },
                ].map((model, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">{model.name}</p>
                      <p className="text-sm text-green-600">{model.accuracy}% accuracy</p>
                    </div>
                    <Badge className="bg-green-600 text-white">{model.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-white border border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">System Settings</CardTitle>
              <CardDescription className="text-green-600">Configure system parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-green-900">System Name</Label>
                <Input
                  defaultValue="EvalAI Pro"
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-green-900">Max Upload Size (MB)</Label>
                <Input
                  type="number"
                  defaultValue="50"
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white mt-4">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
