"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Cpu, Download, Trash2, Settings } from "lucide-react"

export default function AdminModelsPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="admin" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">AI Model Hub</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">AI Model Hub</h2>
                <p className="text-green-700">Manage and configure AI models</p>
              </div>

              {/* Model Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-900">Active Models</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-700">15</p>
                    <p className="text-xs text-green-600 mt-1">In production</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-900">Total Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-700">96.8%</p>
                    <p className="text-xs text-blue-600 mt-1">Average performance</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-purple-900">Total Inference Calls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-purple-700">847,234</p>
                    <p className="text-xs text-purple-600 mt-1">This month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Models List */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Available Models</CardTitle>
                  <CardDescription>AI models for evaluation and OCR</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-green-200 hover:bg-green-50">
                          <TableHead className="text-green-900 font-semibold">Model Name</TableHead>
                          <TableHead className="text-green-900 font-semibold">Type</TableHead>
                          <TableHead className="text-green-900 font-semibold">Accuracy</TableHead>
                          <TableHead className="text-green-900 font-semibold">Status</TableHead>
                          <TableHead className="text-green-900 font-semibold">Usage</TableHead>
                          <TableHead className="text-green-900 font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { name: "GPT-4 Evaluator", type: "Evaluation", accuracy: "98.5%", status: "Active", usage: "45,234" },
                          { name: "Claude 3 Evaluator", type: "Evaluation", accuracy: "97.2%", status: "Active", usage: "38,456" },
                          { name: "PaddleOCR", type: "OCR", accuracy: "96.1%", status: "Active", usage: "52,123" },
                          { name: "Tesseract 5", type: "OCR", accuracy: "94.8%", status: "Active", usage: "28,945" },
                          { name: "Custom Model v2", type: "Evaluation", accuracy: "95.3%", status: "Inactive", usage: "0" },
                        ].map((model, idx) => (
                          <TableRow key={idx} className="border-green-200 hover:bg-green-50">
                            <TableCell className="font-medium text-green-900">{model.name}</TableCell>
                            <TableCell className="text-green-700">{model.type}</TableCell>
                            <TableCell className="text-green-700">{model.accuracy}</TableCell>
                            <TableCell>
                              <Badge className={model.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                {model.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-green-700">{model.usage}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                                  <Settings className="h-4 w-4" />
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

              {/* Add Model */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Add New Model</CardTitle>
                  <CardDescription>Deploy a new AI model to the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                      <Cpu className="h-4 w-4" />
                      Deploy Model
                    </Button>
                    <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 gap-2">
                      <Download className="h-4 w-4" />
                      Import Model
                    </Button>
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
