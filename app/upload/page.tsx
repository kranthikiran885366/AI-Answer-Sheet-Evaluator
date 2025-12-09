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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="teacher" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Upload Answer Sheets</h1>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
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
                <h2 className="text-3xl font-bold text-green-900">Upload Answer Sheets</h2>
                <p className="text-green-700">Upload and process student answer sheets for evaluation</p>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Supported Formats</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-green-700">
                    PDF, JPG, PNG, TIFF
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Max File Size</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-blue-700">
                    50 MB per file
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Processing Time</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-purple-700">
                    ~2-3 seconds per page
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
