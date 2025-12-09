"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Search, Plus, Edit, Trash2, Shield, Mail, Calendar, Activity } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "teacher" | "student"
  institution: string
  status: "active" | "inactive"
  joinDate: string
  lastActive: string
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const mockUsers: User[] = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@evalai.pro",
      role: "admin",
      institution: "EvalAI Pro",
      status: "active",
      joinDate: "2024-01-01",
      lastActive: "2 minutes ago",
    },
    {
      id: "2",
      name: "Prof. Michael Chen",
      email: "michael.chen@school.edu",
      role: "teacher",
      institution: "Lincoln High School",
      status: "active",
      joinDate: "2024-02-15",
      lastActive: "30 minutes ago",
    },
    {
      id: "3",
      name: "Alex Smith",
      email: "alex.smith@student.edu",
      role: "student",
      institution: "Lincoln High School",
      status: "active",
      joinDate: "2024-03-10",
      lastActive: "1 hour ago",
    },
    {
      id: "4",
      name: "Emily Rodriguez",
      email: "emily.rodriguez@school.edu",
      role: "teacher",
      institution: "Harvard University",
      status: "inactive",
      joinDate: "2024-01-20",
      lastActive: "2 days ago",
    },
    {
      id: "5",
      name: "James Wilson",
      email: "james.wilson@student.edu",
      role: "student",
      institution: "Lincoln High School",
      status: "active",
      joinDate: "2024-03-15",
      lastActive: "5 minutes ago",
    },
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700"
      case "teacher":
        return "bg-blue-100 text-blue-700"
      case "student":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="admin" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">User Management</h1>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <Activity className="h-3 w-3 mr-1" />
                  {filteredUsers.length} Users
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">User Management</h2>
                <p className="text-green-700">Manage users, roles, and permissions across the platform</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">2,847</p>
                    <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">1,256</p>
                    <p className="text-xs text-blue-600 mt-1">Currently online</p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Administrators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">12</p>
                    <p className="text-xs text-purple-600 mt-1">System admins</p>
                  </CardContent>
                </Card>

                <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-900">Inactive</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-amber-700">45</p>
                    <p className="text-xs text-amber-600 mt-1">Last 30 days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Find Users</CardTitle>
                  <CardDescription>Search and filter users by name, email, or role</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                        <Input
                          placeholder="Search by name or email..."
                          className="pl-10 border-green-200 focus:border-green-500"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-40 border-green-200">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                      <Plus className="h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>All registered users in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-green-200 hover:bg-green-50">
                          <TableHead className="text-green-900 font-semibold">Name</TableHead>
                          <TableHead className="text-green-900 font-semibold">Email</TableHead>
                          <TableHead className="text-green-900 font-semibold">Role</TableHead>
                          <TableHead className="text-green-900 font-semibold">Institution</TableHead>
                          <TableHead className="text-green-900 font-semibold">Status</TableHead>
                          <TableHead className="text-green-900 font-semibold">Last Active</TableHead>
                          <TableHead className="text-green-900 font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id} className="border-green-200 hover:bg-green-50">
                            <TableCell className="font-medium text-green-900">{user.name}</TableCell>
                            <TableCell className="text-green-700">{user.email}</TableCell>
                            <TableCell>
                              <Badge className={getRoleColor(user.role)}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-green-700">{user.institution}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={user.status === "active"
                                  ? "border-green-300 bg-green-50 text-green-700"
                                  : "border-gray-300 bg-gray-50 text-gray-700"
                                }
                              >
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-green-700 text-sm">{user.lastActive}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
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
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
