"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AdvancedUploadSection } from "@/app/components/advanced-upload-section"
import { Upload } from "lucide-react"

export default function UploadPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-indigo-50/30 to-white">
        <MainSidebar userRole="teacher" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-slate-200" />
              <h1 className="text-lg font-semibold text-slate-900">Upload Answer Sheets</h1>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  <Upload className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">Upload Answer Sheets</h2>
                <p className="text-slate-500">Upload and process student answer sheets for AI evaluation</p>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-slate-200 bg-gradient-to-br from-indigo-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700">Supported Formats</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-500">
                    PDF, JPG, PNG, TIFF
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-gradient-to-br from-violet-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700">Max File Size</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-500">
                    50 MB per file
                  </CardContent>
                </Card>

                <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700">Processing Time</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-500">
                    ~2–5 seconds per page
                  </CardContent>
                </Card>
              </div>

              {/* Upload Component */}
              <AdvancedUploadSection userRole="teacher" />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
