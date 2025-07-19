"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Cpu } from "lucide-react"

export default function AdminDashboard() {
  const metrics = [
    { label: "Total Evaluations", value: "15 247", icon: Cpu, color: "bg-blue-500" },
    { label: "Active Users", value: "1 256", icon: Users, color: "bg-green-500" },
    { label: "Model Accuracy", value: "94.8 %", icon: TrendingUp, color: "bg-purple-500" },
  ]

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex items-center justify-between">
              <span className="font-medium">{label}</span>
              <Badge className={`${color} text-white`}>{value}</Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-6">
              <Icon className="h-12 w-12 text-gray-400" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
