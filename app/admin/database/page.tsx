"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Database, HardDrive, Zap, RefreshCw, Download, Trash2 } from "lucide-react"

export default function AdminDatabasePage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="admin" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Database Administration</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Database Administration</h2>
                <p className="text-green-700">Database status, maintenance, and management tools</p>
              </div>

              {/* Database Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Total Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">2,847,592</p>
                    <p className="text-xs text-green-600 mt-1">+145K this month</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Database Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">85.3 GB</p>
                    <p className="text-xs text-blue-600 mt-1">56% of allocated space</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Query Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">98.7%</p>
                    <p className="text-xs text-purple-600 mt-1">Average optimization</p>
                  </CardContent>
                </Card>
              </div>

              {/* Storage Space */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                  <CardDescription>Database storage allocation and usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-green-900">Total Allocated Space</span>
                      <span className="text-sm font-medium text-green-700">152 GB / 200 GB</span>
                    </div>
                    <Progress value={76} className="h-3" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {[
                      { name: "User Data", size: "24.5 GB", percentage: 29 },
                      { name: "Evaluation Results", size: "38.2 GB", percentage: 45 },
                      { name: "File Storage", size: "22.6 GB", percentage: 26 },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 rounded-lg border border-green-200">
                        <p className="font-medium text-green-900">{item.name}</p>
                        <p className="text-sm text-green-600 mt-1">{item.size}</p>
                        <Progress value={item.percentage} className="mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Database Tables */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Database Tables</CardTitle>
                  <CardDescription>Overview of main database tables and their sizes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-green-200 hover:bg-green-50">
                          <TableHead className="text-green-900 font-semibold">Table Name</TableHead>
                          <TableHead className="text-green-900 font-semibold">Records</TableHead>
                          <TableHead className="text-green-900 font-semibold">Size</TableHead>
                          <TableHead className="text-green-900 font-semibold">Last Backup</TableHead>
                          <TableHead className="text-green-900 font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { name: "users", records: "2,847", size: "125 MB", backup: "2 hours ago" },
                          { name: "evaluations", records: "15,247", size: "1.2 GB", backup: "1 hour ago" },
                          { name: "results", records: "45,892", size: "3.5 GB", backup: "30 mins ago" },
                          { name: "rubrics", records: "1,245", size: "45 MB", backup: "1 day ago" },
                          { name: "audit_logs", records: "127,456", size: "2.1 GB", backup: "15 mins ago" },
                        ].map((table, idx) => (
                          <TableRow key={idx} className="border-green-200 hover:bg-green-50">
                            <TableCell className="font-medium text-green-900">{table.name}</TableCell>
                            <TableCell className="text-green-700">{table.records}</TableCell>
                            <TableCell className="text-green-700">{table.size}</TableCell>
                            <TableCell className="text-green-700 text-sm">{table.backup}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50">
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Database Maintenance</CardTitle>
                  <CardDescription>Maintenance operations and optimization tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Optimize Tables", desc: "Optimize and rebuild indexes", btn: "Optimize" },
                      { name: "Vacuum Database", desc: "Clean up deleted data and free space", btn: "Vacuum" },
                      { name: "Full Backup", desc: "Create complete database backup", btn: "Backup" },
                      { name: "Check Integrity", desc: "Verify database consistency and health", btn: "Check" },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 rounded-lg border border-green-200 flex items-start justify-between">
                        <div>
                          <p className="font-medium text-green-900">{item.name}</p>
                          <p className="text-sm text-green-600 mt-1">{item.desc}</p>
                        </div>
                        <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                          {item.btn}
                        </Button>
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
