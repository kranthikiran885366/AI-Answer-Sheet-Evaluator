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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Mail, Phone, Edit, Trash2, Plus } from "lucide-react"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  class: string
  joinDate: string
  status: "active" | "inactive"
  avgGrade: string
}

export default function TeacherStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [classFilter, setClassFilter] = useState("all")

  const students: Student[] = [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice.j@student.edu",
      phone: "(555) 001-1001",
      class: "MATH101-P1",
      joinDate: "2024-01-15",
      status: "active",
      avgGrade: "A",
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob.smith@student.edu",
      phone: "(555) 001-1002",
      class: "MATH101-P1",
      joinDate: "2024-01-15",
      status: "active",
      avgGrade: "B+",
    },
    {
      id: "3",
      name: "Carol Davis",
      email: "carol.d@student.edu",
      phone: "(555) 001-1003",
      class: "MATH101-P2",
      joinDate: "2024-01-16",
      status: "active",
      avgGrade: "A-",
    },
    {
      id: "4",
      name: "David Wilson",
      email: "david.w@student.edu",
      phone: "(555) 001-1004",
      class: "MATH201",
      joinDate: "2024-01-17",
      status: "active",
      avgGrade: "B",
    },
  ]

  const filteredStudents = students.filter(student =>
    (student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (classFilter === "all" || student.class === classFilter)
  )

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="teacher" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Student Roster</h1>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  {filteredStudents.length} Students
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Student Roster</h2>
                <p className="text-green-700">Manage and view student information</p>
              </div>

              {/* Search and Filters */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Find Students</CardTitle>
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
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-40 border-green-200">
                        <SelectValue placeholder="Filter by class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="MATH101-P1">Algebra I - P1</SelectItem>
                        <SelectItem value="MATH101-P2">Algebra I - P2</SelectItem>
                        <SelectItem value="MATH201">Calculus I</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                      <Plus className="h-4 w-4" />
                      Add Student
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Students Table */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Students</CardTitle>
                  <CardDescription>All enrolled students across your classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-green-200 hover:bg-green-50">
                          <TableHead className="text-green-900 font-semibold">Name</TableHead>
                          <TableHead className="text-green-900 font-semibold">Email</TableHead>
                          <TableHead className="text-green-900 font-semibold">Class</TableHead>
                          <TableHead className="text-green-900 font-semibold">Status</TableHead>
                          <TableHead className="text-green-900 font-semibold">Grade</TableHead>
                          <TableHead className="text-green-900 font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.id} className="border-green-200 hover:bg-green-50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={`/placeholder.svg?name=${student.name}`} />
                                  <AvatarFallback className="bg-green-100 text-green-700">
                                    {student.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-green-900">{student.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-green-700">{student.email}</TableCell>
                            <TableCell className="text-green-700">{student.class}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-700">{student.status}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-green-900">{student.avgGrade}</TableCell>
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
