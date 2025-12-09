"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Users, Plus, Edit, Trash2, Search, BookOpen, Calendar, Users2 } from "lucide-react"

interface Class {
  id: string
  name: string
  code: string
  students: number
  semester: string
  schedule: string
  status: "active" | "archived"
}

export default function TeacherClassesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const classes: Class[] = [
    {
      id: "1",
      name: "Algebra I - Period 1",
      code: "MATH101-P1",
      students: 28,
      semester: "Spring 2024",
      schedule: "MWF 9:00 AM",
      status: "active",
    },
    {
      id: "2",
      name: "Algebra I - Period 2",
      code: "MATH101-P2",
      students: 31,
      semester: "Spring 2024",
      schedule: "MWF 10:30 AM",
      status: "active",
    },
    {
      id: "3",
      name: "Calculus I",
      code: "MATH201",
      students: 24,
      semester: "Spring 2024",
      schedule: "TR 1:00 PM",
      status: "active",
    },
    {
      id: "4",
      name: "Geometry (Fall 2023)",
      code: "MATH050-F23",
      students: 29,
      semester: "Fall 2023",
      schedule: "MWF 2:00 PM",
      status: "archived",
    },
  ]

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchQuery.toLowerCase())
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
              <h1 className="text-lg font-semibold text-green-900">My Classes</h1>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  {filteredClasses.filter(c => c.status === "active").length} Active
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">My Classes</h2>
                <p className="text-green-700">Manage your classes and view student progress</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Active Classes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">3</p>
                    <p className="text-xs text-green-600 mt-1">This semester</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Total Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">83</p>
                    <p className="text-xs text-blue-600 mt-1">Across all classes</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Avg Class Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">27.7</p>
                    <p className="text-xs text-purple-600 mt-1">Students per class</p>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filter */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Find Classes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 flex-wrap">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                        <Input
                          placeholder="Search by class name or code..."
                          className="pl-10 border-green-200 focus:border-green-500"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                      <Plus className="h-4 w-4" />
                      New Class
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Classes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((cls) => (
                  <Card key={cls.id} className="border-green-200 hover:shadow-lg transition">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-green-900">{cls.name}</CardTitle>
                          <CardDescription className="text-green-600 mt-1">{cls.code}</CardDescription>
                        </div>
                        <Badge className={cls.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                          {cls.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <Users2 className="h-4 w-4" />
                          <span>{cls.students} students</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <Calendar className="h-4 w-4" />
                          <span>{cls.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <BookOpen className="h-4 w-4" />
                          <span>{cls.semester}</span>
                        </div>
                      </div>

                      <Separator className="bg-green-200" />

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 border-green-200 text-green-700 hover:bg-green-50">
                          <Users className="h-4 w-4 mr-1" />
                          Students
                        </Button>
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
