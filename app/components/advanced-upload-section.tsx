"use client"

import { Progress } from "@/components/ui/progress"

import { AlertDescription } from "@/components/ui/alert"

import { Alert } from "@/components/ui/alert"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Camera, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWebSocket } from "@/components/websocket-provider"

export function AdvancedUploadSection({ userRole }) {
  const [uploadMethod, setUploadMethod] = useState("file")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [subject, setSubject] = useState("")
  const [examType, setExamType] = useState("")
  const [studentName, setStudentName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [metadata, setMetadata] = useState({
    studentName: "",
    subject: "",
    examType: "",
  })

  const { toast } = useToast()
  const { sendMessage } = useWebSocket()

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
    "Geography",
    "Computer Science",
    "Economics",
  ]

  const examTypes = ["Unit Test", "Mid-term Exam", "Final Exam", "Quiz", "Assignment", "Practice Test"]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setMetadata((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFiles.length === 0 || !metadata.subject || !metadata.examType || !metadata.studentName) {
      toast({
        title: "Error",
        description: "Please fill all required fields and select at least one file",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setUploadProgress(0)
    setUploadError("")

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append("files", file)
      })
      formData.append("metadata", JSON.stringify(metadata))

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/upload-answer-sheet`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to upload answer sheets")
      }

      const responseData = await response.json()
      console.log("Upload successful:", responseData)

      toast({
        title: "Success",
        description: "Answer sheets uploaded successfully!",
      })

      // Send WebSocket message
      sendMessage({
        type: "new_submission",
        data: {
          student: metadata.studentName,
          subject: metadata.subject,
        },
      })

      // Reset form
      setSelectedFiles([])
      setMetadata({
        studentName: "",
        subject: "",
        examType: "",
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = ""
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      setUploadError(error.message || "Upload failed")
      toast({
        title: "Error",
        description: error.message || "Failed to upload answer sheets",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Upload Form */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Answer Sheet Upload
          </CardTitle>
          <CardDescription>Upload your answer sheets for AI-powered evaluation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="studentName">Student Name *</Label>
                <Input
                  id="studentName"
                  name="studentName"
                  value={metadata.studentName}
                  onChange={handleMetadataChange}
                  placeholder="Enter student name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    name="subject"
                    value={metadata.subject}
                    onValueChange={(value) => handleMetadataChange({ target: { name: "subject", value } as any })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="examType">Exam Type *</Label>
                  <Select
                    name="examType"
                    value={metadata.examType}
                    onValueChange={(value) => handleMetadataChange({ target: { name: "examType", value } as any })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Upload Method Selection */}
            <div className="space-y-4">
              <Label>Upload Method</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={uploadMethod === "file" ? "default" : "outline"}
                  onClick={() => setUploadMethod("file")}
                  className="h-20 flex-col gap-2"
                >
                  <Upload className="h-6 w-6" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={uploadMethod === "camera" ? "default" : "outline"}
                  onClick={() => setUploadMethod("camera")}
                  className="h-20 flex-col gap-2"
                >
                  <Camera className="h-6 w-6" />
                  Camera Scan
                </Button>
              </div>
            </div>

            {/* File Upload */}
            {uploadMethod === "file" && (
              <div className="space-y-2">
                <Label htmlFor="file">Select Answer Sheets (PDF, JPG, PNG) *</Label>
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  required
                />
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Selected {selectedFiles.length} file(s)
                  </p>
                )}
              </div>
            )}

            {/* Camera Upload */}
            {uploadMethod === "camera" && (
              <div className="space-y-2">
                <Label htmlFor="camera">Capture Answer Sheet *</Label>
                <Input
                  id="camera"
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  capture="environment"
                  multiple
                  required
                />
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Captured {selectedFiles.length} image(s)
                  </p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                "Start AI Evaluation"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Upload Status */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Upload Status</CardTitle>
          <CardDescription>Track the progress of your answer sheet uploads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {!isProcessing && selectedFiles.length === 0 && !uploadError && (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select answer sheets to start evaluation</p>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-4">
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Uploading answer sheets...</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-3" />
              </div>
            </div>
          )}

          {!isProcessing && selectedFiles.length > 0 && !uploadError && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Answer sheets uploaded successfully! Check the Results tab.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
