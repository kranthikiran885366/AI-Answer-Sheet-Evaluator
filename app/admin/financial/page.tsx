"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingUp } from "lucide-react"

export default function AdminFinancialPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="admin" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Financial Reports</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Financial Reports</h2>
                <p className="text-green-700">Revenue, costs, and financial metrics</p>
              </div>

              {/* Financial Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">$124,567</p>
                    <p className="text-xs text-green-600 mt-1">+18% from last month</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Operating Costs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">$45,234</p>
                    <p className="text-xs text-blue-600 mt-1">-5% from last month</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Gross Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">$79,333</p>
                    <p className="text-xs text-purple-600 mt-1">63.6% margin</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-amber-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-900">Customer LTV</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-amber-700">$1,245</p>
                    <p className="text-xs text-amber-600 mt-1">Average per user</p>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle>Revenue by Service</CardTitle>
                    <CardDescription>Revenue distribution</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { service: "Evaluation API", revenue: "$67,500", percentage: 54 },
                      { service: "OCR API", revenue: "$31,234", percentage: 25 },
                      { service: "Premium Support", revenue: "$18,567", percentage: 15 },
                      { service: "White Label", revenue: "$7,266", percentage: 6 },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-green-900 font-medium">{item.service}</span>
                          <span className="text-sm text-green-600">{item.revenue}</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                    <CardDescription>Operating expenses</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { item: "Infrastructure", cost: "$18,234", percentage: 40 },
                      { item: "Personnel", cost: "$16,745", percentage: 37 },
                      { item: "Third-party Services", cost: "$7,234", percentage: 16 },
                      { item: "Operations", cost: "$3,021", percentage: 7 },
                    ].map((expense, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-green-900 font-medium">{expense.item}</span>
                          <span className="text-sm text-green-600">{expense.cost}</span>
                        </div>
                        <Progress value={expense.percentage} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trend */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Monthly Trend</CardTitle>
                  <CardDescription>6-month financial trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { month: "September", revenue: "$98,234", profit: "$58,234" },
                      { month: "October", revenue: "$105,567", profit: "$62,456" },
                      { month: "November", revenue: "$112,345", profit: "$71,234" },
                      { month: "December", revenue: "$124,567", profit: "$79,333" },
                      { month: "January", revenue: "$118,900", profit: "$75,000" },
                      { month: "February", revenue: "$135,678", profit: "$82,100" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-green-200 hover:bg-green-50">
                        <p className="font-medium text-green-900">{item.month}</p>
                        <div className="flex gap-4">
                          <Badge variant="outline" className="border-green-300 bg-green-50">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {item.revenue}
                          </Badge>
                          <Badge variant="outline" className="border-blue-300 bg-blue-50">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {item.profit}
                          </Badge>
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
