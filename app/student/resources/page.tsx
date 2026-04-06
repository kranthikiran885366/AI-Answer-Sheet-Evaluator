"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { BookOpen, Video, FileText, Download, ExternalLink } from "lucide-react"

export default function StudentResourcesPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="student" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Study Resources</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Study Resources</h2>
                <p className="text-green-700">Personalized learning materials and study aids</p>
              </div>

              {/* Recommended Resources */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Recommended for You</CardTitle>
                  <CardDescription>Resources based on your learning needs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      title: "Word Problem Mastery Guide",
                      type: "Guide",
                      icon: FileText,
                      reason: "Based on your latest feedback",
                    },
                    {
                      title: "Polynomial Functions Video Series",
                      type: "Video",
                      icon: Video,
                      reason: "For your intermediate topics",
                    },
                    {
                      title: "Practice Problem Sets (Intermediate)",
                      type: "Practice",
                      icon: BookOpen,
                      reason: "Matched to your skill level",
                    },
                  ].map((resource, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-green-200 hover:bg-green-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <resource.icon className="h-5 w-5 text-green-700" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-green-900">{resource.title}</p>
                            <p className="text-xs text-green-600 mt-1">{resource.reason}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-green-300 bg-green-50">
                          {resource.type}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                          <Download className="h-3 w-3 mr-1" />
                          Access
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Resource Categories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-green-200 hover:shadow-lg transition">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-green-700" />
                      </div>
                      <CardTitle className="text-green-900">Study Guides</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-700 mb-4">Comprehensive study materials for each topic</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">12 available</Badge>
                  </CardContent>
                </Card>

                <Card className="border-green-200 hover:shadow-lg transition">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Video className="h-6 w-6 text-blue-700" />
                      </div>
                      <CardTitle className="text-green-900">Video Lectures</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-700 mb-4">Watch explanations and worked examples</p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">28 videos</Badge>
                  </CardContent>
                </Card>

                <Card className="border-green-200 hover:shadow-lg transition">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-purple-700" />
                      </div>
                      <CardTitle className="text-green-900">Practice Problems</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-700 mb-4">Practice with instant feedback and solutions</p>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">450 problems</Badge>
                  </CardContent>
                </Card>
              </div>

              {/* By Topic */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Resources by Topic</CardTitle>
                  <CardDescription>Find resources for specific subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { topic: "Linear Equations", guides: 3, videos: 5, problems: 45 },
                      { topic: "Quadratic Equations", guides: 2, videos: 4, problems: 38 },
                      { topic: "Polynomial Functions", guides: 2, videos: 6, problems: 52 },
                      { topic: "Graphing", guides: 1, videos: 3, problems: 31 },
                      { topic: "Word Problems", guides: 3, videos: 7, problems: 68 },
                      { topic: "Systems of Equations", guides: 2, videos: 4, problems: 40 },
                    ].map((topic, idx) => (
                      <div key={idx} className="p-4 rounded-lg border border-green-200 hover:bg-green-50">
                        <p className="font-semibold text-green-900 mb-3">{topic.topic}</p>
                        <div className="space-y-2 text-sm text-green-700 mb-3">
                          <p>📚 {topic.guides} study guide{topic.guides > 1 ? "s" : ""}</p>
                          <p>🎥 {topic.videos} video{topic.videos > 1 ? "s" : ""}</p>
                          <p>✏️ {topic.problems} practice problem{topic.problems > 1 ? "s" : ""}</p>
                        </div>
                        <Button size="sm" variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Browse
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
