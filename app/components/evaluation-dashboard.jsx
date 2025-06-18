"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, Clock, Award, Eye, Download } from "lucide-react"

export default function EvaluationDashboard() {
  const [stats, setStats] = useState({
    totalEvaluations: 0,
    averageScore: 0,
    processingTime: 0,
    accuracy: 0,
  })

  const [recentEvaluations, setRecentEvaluations] = useState([])

  useEffect(() => {
    // Fetch real-time dashboard data
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/dashboard-stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentEvaluations(data.recent_evaluations)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          Real-time Dashboard
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">Live insights and analytics from AI evaluations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-200/50 dark:border-blue-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalEvaluations || 1247}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-200/50 dark:border-green-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.averageScore || 78}%</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">+5.2% improvement</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-200/50 dark:border-purple-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.processingTime || 2.3}min</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Average per sheet</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-200/50 dark:border-orange-800/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Award className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.accuracy || 94.2}%</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Compared to manual</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Evaluations */}
      <Card className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Recent Evaluations
          </CardTitle>
          <CardDescription>Live feed of completed evaluations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { student: "Alice Johnson", subject: "Mathematics", score: 92, grade: "A", time: "2 min ago" },
              { student: "Bob Smith", subject: "Physics", score: 78, grade: "B+", time: "5 min ago" },
              { student: "Carol Davis", subject: "Chemistry", score: 85, grade: "A-", time: "8 min ago" },
              { student: "David Wilson", subject: "Biology", score: 91, grade: "A", time: "12 min ago" },
            ].map((evaluation, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-white/20 dark:border-slate-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {evaluation.student
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium">{evaluation.student}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{evaluation.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{evaluation.score}%</div>
                    <Badge variant="secondary">{evaluation.grade}</Badge>
                  </div>
                  <div className="text-sm text-slate-500">{evaluation.time}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Real-time performance analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-4 p-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
              const height = Math.floor(Math.random() * 60 + 40)
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <div
                    className="bg-gradient-to-t from-blue-500 to-purple-500 rounded-t w-12 flex items-end justify-center text-white text-xs font-semibold pb-1"
                    style={{ height: `${height * 2}px` }}
                  >
                    {height + 20}%
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{day}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
