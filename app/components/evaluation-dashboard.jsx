"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Clock, Award, Eye, RefreshCw, Loader2, FileText } from "lucide-react"

export default function EvaluationDashboard() {
  const [stats, setStats] = useState(null)
  const [recentEvaluations, setRecentEvaluations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchDashboardData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    try {
      const res = await fetch("/api/dashboard-stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        setRecentEvaluations(data.recentEvaluations || [])
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(() => fetchDashboardData(), 30000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  const gradeColor = (grade) => {
    if (["A+", "A"].includes(grade)) return "bg-indigo-100 text-indigo-700"
    if (["B+", "B"].includes(grade)) return "bg-blue-100 text-blue-700"
    if (["C+", "C"].includes(grade)) return "bg-orange-100 text-orange-700"
    return "bg-red-100 text-red-700"
  }

  const subjectStats = stats?.subjectStats || []
  const maxCount = Math.max(...subjectStats.map((s) => s.count), 1)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Real-time Dashboard</h2>
          <p className="text-slate-500 mt-1">
            Live insights from AI evaluations
            {lastUpdated && (
              <span className="ml-2 text-xs">· Updated {lastUpdated.toLocaleTimeString()}</span>
            )}
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchDashboardData(true)} disabled={isRefreshing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-indigo-100 bg-indigo-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Evaluations</CardTitle>
            <BarChart3 className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {stats?.totalEvaluations ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">All completed evaluations</p>
          </CardContent>
        </Card>

        <Card className="border border-blue-100 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.averageScore ?? 0}%
            </div>
            <p className="text-xs text-slate-500 mt-1">Across all evaluations</p>
          </CardContent>
        </Card>

        <Card className="border border-violet-100 bg-violet-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Pending</CardTitle>
            <Clock className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">
              {stats?.pendingEvaluations ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">In queue or processing</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 bg-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">AI Provider</CardTitle>
            <Award className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-700 truncate">
              {stats?.aiProvider?.active ?? "Demo Mode"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Current evaluation engine</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Recent Evaluations</CardTitle>
            <CardDescription>Latest completed evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvaluations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No evaluations yet.</p>
                <p className="text-slate-400 text-xs mt-1">Upload answer sheets to see results here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {recentEvaluations.map((evaluation, i) => (
                  <div
                    key={evaluation.sessionId || i}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {(evaluation.studentName || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{evaluation.studentName}</p>
                        <p className="text-xs text-slate-500">{evaluation.subject} · {evaluation.examType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">{evaluation.score}%</div>
                        <Badge variant="secondary" className={`text-xs ${gradeColor(evaluation.grade)}`}>
                          {evaluation.grade}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/results/${evaluation.sessionId}`}>
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Subject Distribution</CardTitle>
            <CardDescription>Evaluations by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectStats.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No data yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {subjectStats.map((s, i) => (
                  <div key={s.subject}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 font-medium">{s.subject}</span>
                      <span className="text-slate-500">{s.count} eval{s.count !== 1 ? "s" : ""} · avg {s.averageScore}%</span>
                    </div>
                    <Progress value={(s.count / maxCount) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stats?.gradeDistribution && Object.keys(stats.gradeDistribution).length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Grade Distribution</CardTitle>
            <CardDescription>Breakdown of grades across all evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.gradeDistribution)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([grade, count]) => (
                  <div key={grade} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className={`inline-block w-2 h-2 rounded-full ${gradeColor(grade).split(" ")[0]}`} />
                    <span className="font-semibold text-slate-800">{grade}</span>
                    <span className="text-slate-500 text-sm">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
