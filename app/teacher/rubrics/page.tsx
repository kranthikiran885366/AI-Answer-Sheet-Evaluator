"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Edit, Copy, Trash2 } from "lucide-react"

export default function TeacherRubricsPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="teacher" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Rubrics</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Rubric Builder</h2>
                <p className="text-green-700">Create and manage grading rubrics</p>
              </div>

              {/* Create Rubric */}
              <Card className="border-green-200">
                <CardContent className="pt-6">
                  <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Rubric
                  </Button>
                </CardContent>
              </Card>

              {/* Rubrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: "Essay Grading",
                    criteria: 5,
                    points: 100,
                    usage: "8 assignments",
                  },
                  {
                    name: "Problem Solving",
                    criteria: 4,
                    points: 50,
                    usage: "5 assignments",
                  },
                  {
                    name: "Class Participation",
                    criteria: 3,
                    points: 20,
                    usage: "3 assignments",
                  },
                  {
                    name: "Project Presentation",
                    criteria: 6,
                    points: 100,
                    usage: "2 assignments",
                  },
                  {
                    name: "Research Paper",
                    criteria: 7,
                    points: 150,
                    usage: "1 assignment",
                  },
                  {
                    name: "Group Work",
                    criteria: 4,
                    points: 40,
                    usage: "4 assignments",
                  },
                ].map((rubric, idx) => (
                  <Card key={idx} className="border-green-200 hover:shadow-lg transition">
                    <CardHeader>
                      <CardTitle className="text-green-900">{rubric.name}</CardTitle>
                      <CardDescription className="text-green-600">
                        {rubric.criteria} criteria • {rubric.points} points
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 rounded-lg bg-green-50">
                        <p className="text-xs text-green-600 mb-1">Used in</p>
                        <Badge variant="outline" className="border-green-300">
                          {rubric.usage}
                        </Badge>
                      </div>

                      <Separator className="bg-green-200" />

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 border-green-200 text-green-700 hover:bg-green-50">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                          <Copy className="h-4 w-4" />
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
