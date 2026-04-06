"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Users,
  FileText,
  TrendingUp,
  Settings,
  Database,
  Server,
  Activity,
  Clock,
  BarChart3,
  Download,
  RefreshCw,
  Shield,
  Cpu,
  Brain,
  ArrowUp,
  Loader2,
  Eye,
} from "lucide-react"

interface DashboardData {
  totalEvaluations: number
  completedEvaluations: number
  pendingEvaluations: number
  averageScore: number
  subjectStats: Array<{ subject: string; count: number; averageScore: number }>
  gradeDistribution: Record<string, number>
  recentEvaluations: Array<{
    sessionId: string
    studentName: string
    subject: string
    examType: string
    score: number
    grade: string
    evaluationDate: string
    aiProvider: string
  }>
  aiProviders: Record<string, number>
  system: {
    cpu: number
    memory: number
    uptime: string
    platform: string
    cpuCount: number
  }
  aiProvider: {
    openai: boolean
    gemini: boolean
    anthropic: boolean
    active: string
  }
  timestamp: string
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    try {
      const res = await fetch("/api/dashboard-stats")
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(), 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const getHealthColor = (value: number) => {
    if (value < 50) return "text-indigo-600"
    if (value < 80) return "text-orange-600"
    return "text-red-600"
  }

  const gradeColor = (grade: string) => {
    if (["A+", "A"].includes(grade)) return "bg-indigo-100 text-indigo-700"
    if (["B+", "B"].includes(grade)) return "bg-blue-100 text-blue-700"
    if (["C+", "C"].includes(grade)) return "bg-orange-100 text-orange-700"
    return "bg-red-100 text-red-700"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-slate-500">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  const sys = data?.system
  const ai = data?.aiProvider
  const maxSubjectCount = Math.max(...(data?.subjectStats || []).map((s) => s.count), 1)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">
            System overview and management
            {lastUpdated && (
              <span className="ml-2 text-xs">· Updated {lastUpdated.toLocaleTimeString()}</span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            Evaluations
          </TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            System
          </TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            AI Models
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-indigo-100 bg-indigo-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Total Evaluations</CardTitle>
                <FileText className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-700">{data?.totalEvaluations ?? 0}</div>
                <p className="text-xs text-slate-500 mt-1">All completed evaluations</p>
              </CardContent>
            </Card>

            <Card className="border border-blue-100 bg-blue-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{data?.averageScore ?? 0}%</div>
                <p className="text-xs text-slate-500 mt-1">Across all evaluations</p>
              </CardContent>
            </Card>

            <Card className="border border-violet-100 bg-violet-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Pending</CardTitle>
                <Clock className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-700">{data?.pendingEvaluations ?? 0}</div>
                <p className="text-xs text-slate-500 mt-1">In queue or processing</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-slate-50/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">AI Provider</CardTitle>
                <Brain className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-base font-bold text-slate-800 truncate">{ai?.active ?? "Demo Mode"}</div>
                <p className="text-xs text-slate-500 mt-1">Active evaluation engine</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">System Performance</CardTitle>
                <CardDescription>Real-time system metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sys ? (
                  <>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-700">CPU Usage</span>
                        <span className={`text-sm font-semibold ${getHealthColor(sys.cpu)}`}>{sys.cpu}%</span>
                      </div>
                      <Progress value={sys.cpu} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-700">Memory Usage</span>
                        <span className={`text-sm font-semibold ${getHealthColor(sys.memory)}`}>{sys.memory}%</span>
                      </div>
                      <Progress value={sys.memory} className="h-2" />
                    </div>
                    <div className="pt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Uptime</p>
                        <p className="font-semibold text-slate-800">{sys.uptime}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">CPU Cores</p>
                        <p className="font-semibold text-slate-800">{sys.cpuCount}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm">System metrics unavailable</p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Recent Evaluations</CardTitle>
                <CardDescription>Latest completed evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                {!data?.recentEvaluations?.length ? (
                  <div className="text-center py-6">
                    <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No evaluations yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {data.recentEvaluations.map((e, i) => (
                      <div key={e.sessionId || i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{e.studentName}</p>
                          <p className="text-xs text-slate-500">{e.subject}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`text-xs ${gradeColor(e.grade)}`}>{e.grade}</Badge>
                          <span className="text-sm font-medium text-slate-700">{e.score}%</span>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/results/${e.sessionId}`}><Eye className="h-3 w-3" /></a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="evaluations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Subject Breakdown</CardTitle>
                <CardDescription>Evaluations by subject area</CardDescription>
              </CardHeader>
              <CardContent>
                {!data?.subjectStats?.length ? (
                  <p className="text-slate-400 text-sm text-center py-6">No subject data yet</p>
                ) : (
                  <div className="space-y-4">
                    {data.subjectStats.map((s) => (
                      <div key={s.subject}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-800">{s.subject}</span>
                          <span className="text-slate-500">{s.count} · avg {s.averageScore}%</span>
                        </div>
                        <Progress value={(s.count / maxSubjectCount) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900">Grade Distribution</CardTitle>
                <CardDescription>Grade breakdown across all evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                {!data?.gradeDistribution || !Object.keys(data.gradeDistribution).length ? (
                  <p className="text-slate-400 text-sm text-center py-6">No grade data yet</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(data.gradeDistribution)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([grade, count]) => (
                        <div key={grade} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-800">{grade}</span>
                          <span className="text-slate-500">{count}</span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Cpu className="h-5 w-5 text-indigo-600" />
                  Resource Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sys ? (
                  <>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>CPU</span>
                        <span className={getHealthColor(sys.cpu)}>{sys.cpu}%</span>
                      </div>
                      <Progress value={sys.cpu} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Memory</span>
                        <span className={getHealthColor(sys.memory)}>{sys.memory}%</span>
                      </div>
                      <Progress value={sys.memory} className="h-2" />
                    </div>
                    <div className="pt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Platform</span>
                        <span className="font-medium text-slate-800 capitalize">{sys.platform}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">CPU Cores</span>
                        <span className="font-medium text-slate-800">{sys.cpuCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Uptime</span>
                        <span className="font-medium text-slate-800">{sys.uptime}</span>
                      </div>
                    </div>
                  </>
                ) : <p className="text-slate-400 text-sm">Loading...</p>}
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Database className="h-5 w-5 text-indigo-600" />
                  Storage Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-indigo-800">File Storage</span>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-700">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Sessions Stored</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">{data?.totalEvaluations ?? 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg border border-violet-100">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-medium text-violet-800">Auth System</span>
                  </div>
                  <Badge className="bg-violet-100 text-violet-700">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Brain className="h-5 w-5 text-indigo-600" />
                AI Provider Status
              </CardTitle>
              <CardDescription>Connected AI models for evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "OpenAI GPT-4o", key: "openai", description: "Vision OCR + Intelligent evaluation" },
                  { name: "Google Gemini Flash", key: "gemini", description: "Fast AI evaluation" },
                  { name: "Anthropic Claude", key: "anthropic", description: "Advanced reasoning" },
                ].map((provider) => (
                  <div key={provider.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">{provider.name}</p>
                      <p className="text-xs text-slate-500">{provider.description}</p>
                    </div>
                    <Badge
                      className={
                        ai?.[provider.key as keyof typeof ai]
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-500"
                      }
                    >
                      {ai?.[provider.key as keyof typeof ai] ? "Connected" : "Not configured"}
                    </Badge>
                  </div>
                ))}

                {data?.aiProviders && Object.keys(data.aiProviders).length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-3">Evaluations by Provider</p>
                    {Object.entries(data.aiProviders).map(([provider, count]) => (
                      <div key={provider} className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600 capitalize">{provider}</span>
                        <span className="font-medium text-slate-800">{count} evaluations</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">System Settings</CardTitle>
              <CardDescription>Configure system parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>System Name</Label>
                <Input defaultValue="EvalAI Pro" className="border-slate-300" />
              </div>
              <div className="space-y-2">
                <Label>Max Upload Size (MB)</Label>
                <Input type="number" defaultValue="50" className="border-slate-300" />
              </div>
              <div className="space-y-2">
                <Label>Default AI Provider</Label>
                <Input defaultValue={ai?.active ?? "Demo Mode"} className="border-slate-300" readOnly />
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white mt-4">Save Settings</Button>
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>
              To enable real AI evaluation, add <strong>OPENAI_API_KEY</strong> or <strong>GEMINI_API_KEY</strong> to your environment secrets. Currently running: <strong>{ai?.active ?? "Demo Mode"}</strong>.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}
