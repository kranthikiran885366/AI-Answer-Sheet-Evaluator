"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Lock, AlertTriangle, CheckCircle, Key, Eye, EyeOff } from "lucide-react"

export default function AdminSecurityPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="admin" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Security Center</h1>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  All Secure
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Security Center</h2>
                <p className="text-green-700">Monitor security, access control, and compliance</p>
              </div>

              {/* Security Score */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Security Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-700">95/100</p>
                    <Badge className="mt-2 bg-green-100 text-green-700">Excellent</Badge>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Active Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">234</p>
                    <p className="text-xs text-blue-600 mt-1">Currently online</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">2FA Enabled</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">89%</p>
                    <p className="text-xs text-purple-600 mt-1">Of admin accounts</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-amber-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-900">SSL/TLS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-amber-700">TLS 1.3</p>
                    <p className="text-xs text-amber-600 mt-1">Grade A+</p>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-green-900">Security Alerts</h3>
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-900">System Secure</AlertTitle>
                  <AlertDescription className="text-green-700">No security issues detected</AlertDescription>
                </Alert>
              </div>

              {/* Access Control */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Access Control</CardTitle>
                  <CardDescription>User roles and permissions management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-green-200 hover:bg-green-50">
                          <TableHead className="text-green-900 font-semibold">Role</TableHead>
                          <TableHead className="text-green-900 font-semibold">Users</TableHead>
                          <TableHead className="text-green-900 font-semibold">Permissions</TableHead>
                          <TableHead className="text-green-900 font-semibold">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { role: "Admin", users: 12, perms: "All", status: "Active" },
                          { role: "Teacher", users: 345, perms: "Write, Read", status: "Active" },
                          { role: "Student", users: 2490, perms: "Read Only", status: "Active" },
                          { role: "Auditor", users: 8, perms: "Audit Read", status: "Active" },
                        ].map((item, idx) => (
                          <TableRow key={idx} className="border-green-200 hover:bg-green-50">
                            <TableCell className="font-medium text-green-900">{item.role}</TableCell>
                            <TableCell className="text-green-700">{item.users}</TableCell>
                            <TableCell className="text-green-700">{item.perms}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-700">{item.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* API Keys */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>API Keys Management</CardTitle>
                  <CardDescription>Active API keys and access tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-green-200 hover:bg-green-50">
                          <TableHead className="text-green-900 font-semibold">Key Name</TableHead>
                          <TableHead className="text-green-900 font-semibold">Created</TableHead>
                          <TableHead className="text-green-900 font-semibold">Last Used</TableHead>
                          <TableHead className="text-green-900 font-semibold">Status</TableHead>
                          <TableHead className="text-green-900 font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { name: "Production API Key", created: "2024-01-01", used: "1 hour ago", status: "Active" },
                          { name: "Staging API Key", created: "2024-02-15", used: "2 days ago", status: "Active" },
                          { name: "Webhook Key", created: "2024-01-20", used: "30 mins ago", status: "Active" },
                        ].map((key, idx) => (
                          <TableRow key={idx} className="border-green-200 hover:bg-green-50">
                            <TableCell className="font-medium text-green-900 flex items-center gap-2">
                              <Key className="h-4 w-4 text-green-600" />
                              {key.name}
                            </TableCell>
                            <TableCell className="text-green-700">{key.created}</TableCell>
                            <TableCell className="text-green-700">{key.used}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-700">{key.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                                Revoke
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Logs */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Recent Audit Logs</CardTitle>
                  <CardDescription>Latest security-related activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { action: "User Login", user: "Dr. Sarah Johnson", time: "1 hour ago", status: "success" },
                      { action: "Settings Modified", user: "System Admin", time: "2 hours ago", status: "success" },
                      { action: "Database Access", user: "Audit User", time: "3 hours ago", status: "success" },
                      { action: "API Key Generated", user: "Integration Service", time: "5 hours ago", status: "success" },
                    ].map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-green-200 hover:bg-green-50">
                        <div>
                          <p className="font-medium text-green-900">{log.action}</p>
                          <p className="text-sm text-green-600">{log.user}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600">{log.time}</span>
                          <Badge className="bg-green-100 text-green-700">Success</Badge>
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
