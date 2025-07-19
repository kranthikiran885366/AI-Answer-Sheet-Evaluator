"use client"

import { useState } from "react"
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

  const refreshData = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSystemMetrics((prev) => ({
      ...prev,
      activeUsers: prev.activeUsers + Math.floor(Math.random() * 10),
      todayEvaluations: prev.todayEvaluations + Math.floor(Math.random() * 5),
    }))

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
      message: "OCR processing failed for 2 documents",
      time: "15 minutes ago",
      status: "warning",
      user: "OCR Engine",
      details: "Handwriting quality issues",
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
      type: "warning",
      title: "High CPU Usage",
      message: "Server CPU usage is at 85% - consider scaling",
      priority: "medium",
      time: "5 minutes ago",
    },
    {
      id: 2,
      type: "info",
      title: "Scheduled Maintenance",
      message: "System maintenance scheduled for tonight at 2 AM UTC",
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
      type: "warning",
      title: "License Expiring",
      message: "AI model license expires in 7 days",
      priority: "high",
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
        return "text-yellow-600 bg-yellow-50"
      case "error":
        return "text-red-600 bg-red-50"
      case "info":
        return "text-blue-600 bg-blue-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getHealthColor = (value: number) => {
    if (value < 50) return "text-green-600"
    if (value < 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="h-4 w-4 text-green-600" />
    if (growth < 0) return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">System overview and management controls</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={refreshData} disabled={isRefreshing} className="shadow-sm bg-transparent">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button className="shadow-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg">
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg">
            Users
          </TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg">
            System
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg">
            AI Models
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg">
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-professional hover:shadow-professional-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-blue-900">{systemMetrics.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center mt-2 text-sm">
                      {getGrowthIcon(systemMetrics.growth)}
                      <span className="text-green-600 ml-1">+{systemMetrics.growth}% from last month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-professional hover:shadow-professional-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">Active Users</p>
                    <p className="text-3xl font-bold text-green-900">{systemMetrics.activeUsers.toLocaleString()}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-green-600">Online now</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-500 rounded-xl">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-professional hover:shadow-professional-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Total Evaluations</p>
                    <p className="text-3xl font-bold text-purple-900">
                      {systemMetrics.totalEvaluations.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <Clock className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="text-blue-600">{systemMetrics.todayEvaluations} today</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-professional hover:shadow-professional-lg transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 mb-1">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-orange-900">${systemMetrics.revenue.toLocaleString()}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-green-600">+15.2% growth</span>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-500 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-professional border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-blue-600" />
                  System Performance
                </CardTitle>
                <CardDescription>Real-time system health metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">CPU Usage</span>
                    </div>
                    <span className={`text-sm font-semibold ${getHealthColor(systemHealth.cpu)}`}>
                      {systemHealth.cpu}%
                    </span>
                  </div>
                  <Progress value={systemHealth.cpu} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Memory Usage</span>
                    </div>
                    <span className={`text-sm font-semibold ${getHealthColor(systemHealth.memory)}`}>
                      {systemHealth.memory}%
                    </span>
                  </div>
                  <Progress value={systemHealth.memory} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Disk I/O</span>
                    </div>
                    <span className={`text-sm font-semibold ${getHealthColor(systemHealth.disk)}`}>
                      {systemHealth.disk}%
                    </span>
                  </div>
                  <Progress value={systemHealth.disk} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Network</span>
                    </div>
                    <span className={`text-sm font-semibold ${getHealthColor(systemHealth.network)}`}>
                      {systemHealth.network}%
                    </span>
                  </div>
                  <Progress value={systemHealth.network} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">System Uptime</span>
                    <Badge className="bg-green-100 text-green-800">{systemMetrics.systemUptime}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-professional border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest system activities and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">{activity.message}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {activity.time} • {activity.user}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {activity.details}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Alerts */}
          <Card className="shadow-professional border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                System Alerts
              </CardTitle>
              <CardDescription>Important system notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    variant={alert.type === "warning" ? "destructive" : "default"}
                    className="border-l-4"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <div className="flex items-center justify-between">
                      <div>
                        <AlertTitle className="mb-1">{alert.title}</AlertTitle>
                        <AlertDescription>{alert.message}</AlertDescription>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            alert.priority === "high"
                              ? "destructive"
                              : alert.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                          className="mb-1"
                        >
                          {alert.priority}
                        </Badge>
                        <p className="text-xs text-gray-500">{alert.time}</p>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Institutions */}
          <Card className="shadow-professional border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Top Institutions
              </CardTitle>
              <CardDescription>Most active educational institutions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topInstitutions.map((institution, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{institution.name}</h4>
                        <p className="text-sm text-gray-600">
                          {institution.users} users • {institution.evaluations.toLocaleString()} evaluations
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={institution.plan === "Enterprise" ? "default" : "secondary"}
                      className={institution.plan === "Enterprise" ? "bg-purple-100 text-purple-800" : ""}
                    >
                      {institution.plan}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-professional border-0 bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-red-500 rounded-xl w-fit mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-red-900 mb-1">{userStats.admins}</div>
                <div className="text-sm text-red-700 font-medium">Administrators</div>
              </CardContent>
            </Card>

            <Card className="shadow-professional border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-blue-500 rounded-xl w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-900 mb-1">{userStats.teachers}</div>
                <div className="text-sm text-blue-700 font-medium">Teachers</div>
              </CardContent>
            </Card>

            <Card className="shadow-professional border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-500 rounded-xl w-fit mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-900 mb-1">{userStats.students}</div>
                <div className="text-sm text-green-700 font-medium">Students</div>
              </CardContent>
            </Card>

            <Card className="shadow-professional border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-purple-500 rounded-xl w-fit mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-purple-900 mb-1">{userStats.newUsersToday}</div>
                <div className="text-sm text-purple-700 font-medium">New Today</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-professional border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage system users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Users className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Import
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Users
                  </Button>
                </div>

                <div className="border rounded-xl p-8 bg-gray-50">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management Interface</h3>
                    <p className="text-gray-600">
                      Advanced user management table with filtering, sorting, and bulk actions would be displayed here
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-professional border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  Database Status
                </CardTitle>
                <CardDescription>Database connections and health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">PostgreSQL</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">MongoDB</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Redis Cache</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Storage Used</span>
                      <span className="text-gray-600">2.4 TB / 5 TB</span>
                    </div>
                    <Progress value={48} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>48% utilized</span>
                      <span>2.6 TB available</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-professional border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  Server Resources
                </CardTitle>
                <CardDescription>Real-time server performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">CPU Usage</span>
                    <span className={getHealthColor(systemHealth.cpu)}>{systemHealth.cpu}%</span>
                  </div>
                  <Progress value={systemHealth.cpu} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Memory Usage</span>
                    <span className={getHealthColor(systemHealth.memory)}>{systemHealth.memory}%</span>
                  </div>
                  <Progress value={systemHealth.memory} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Disk I/O</span>
                    <span className={getHealthColor(systemHealth.disk)}>{systemHealth.disk}%</span>
                  </div>
                  <Progress value={systemHealth.disk} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Network</span>
                    <span className={getHealthColor(systemHealth.network)}>{systemHealth.network}%</span>
                  </div>
                  <Progress value={systemHealth.network} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-professional border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Controls
              </CardTitle>
              <CardDescription>Manage system operations and maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-3 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200"
                >
                  <Database className="h-8 w-8 text-blue-600" />
                  <span className="font-medium">Backup Database</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-3 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200"
                >
                  <RefreshCw className="h-8 w-8 text-green-600" />
                  <span className="font-medium">Restart Services</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-3 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200"
                >
                  <Settings className="h-8 w-8 text-purple-600" />
                  <span className="font-medium">System Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-professional border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Usage Analytics
                </CardTitle>
                <CardDescription>System usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                    <p className="text-blue-800 font-medium">Usage Analytics Chart</p>
                    <p className="text-sm text-blue-600">Interactive visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-professional border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  User Distribution
                </CardTitle>
                <CardDescription>User role breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="text-green-800 font-medium">Distribution Chart</p>
                    <p className="text-sm text-green-600">User role analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-professional border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-purple-600" />
                  Performance Trends
                </CardTitle>
                <CardDescription>System performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                    <p className="text-purple-800 font-medium">Performance Trends</p>
                    <p className="text-sm text-purple-600">Historical data analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Models Tab */}
        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-professional border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">GPT-4 Turbo</h3>
                <p className="text-sm text-blue-700 mb-4">Advanced language model for evaluation</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accuracy</span>
                    <span className="font-semibold">94.8%</span>
                  </div>
                  <Progress value={94.8} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-professional border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500 rounded-xl">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Claude 3 Opus</h3>
                <p className="text-sm text-green-700 mb-4">Reasoning and analysis model</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accuracy</span>
                    <span className="font-semibold">92.3%</span>
                  </div>
                  <Progress value={92.3} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-professional border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <Scan className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <h3 className="text-lg font-semibold text-purple-900 mb-2">OCR Engine</h3>
                <p className="text-sm text-purple-700 mb-4">Handwriting recognition system</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accuracy</span>
                    <span className="font-semibold">99.2%</span>
                  </div>
                  <Progress value={99.2} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-professional border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Model Performance Metrics
              </CardTitle>
              <CardDescription>Detailed performance analytics for all AI models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-blue-50">
                    <div className="text-2xl font-bold text-blue-900">15</div>
                    <div className="text-sm text-blue-700">Active Models</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50">
                    <div className="text-2xl font-bold text-green-900">94.8%</div>
                    <div className="text-sm text-green-700">Avg Accuracy</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-50">
                    <div className="text-2xl font-bold text-purple-900">2.3s</div>
                    <div className="text-sm text-purple-700">Avg Response</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-orange-50">
                    <div className="text-2xl font-bold text-orange-900">99.8%</div>
                    <div className="text-sm text-orange-700">Uptime</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="shadow-professional border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Configure system-wide settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="max-users" className="text-sm font-medium">
                      Maximum Concurrent Users
                    </Label>
                    <Input id="max-users" type="number" defaultValue="1000" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="session-timeout" className="text-sm font-medium">
                      Session Timeout (minutes)
                    </Label>
                    <Input id="session-timeout" type="number" defaultValue="30" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="backup-frequency" className="text-sm font-medium">
                      Backup Frequency
                    </Label>
                    <Select defaultValue="daily">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="log-level" className="text-sm font-medium">
                      Log Level
                    </Label>
                    <Select defaultValue="info">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="max-file-size" className="text-sm font-medium">
                      Max File Size (MB)
                    </Label>
                    <Input id="max-file-size" type="number" defaultValue="50" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="ai-model" className="text-sm font-medium">
                      Default AI Model
                    </Label>
                    <Select defaultValue="gpt-4">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4 Turbo</SelectItem>
                        <SelectItem value="claude-3">Claude 3 Opus</SelectItem>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-6 border-t">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Save Settings
                </Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
