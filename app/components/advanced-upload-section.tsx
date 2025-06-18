"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Upload,
  FileText,
  Camera,
  Scan,
  ImageIcon,
  File,
  X,
  Eye,
  Zap,
  Languages,
  Settings,
  Brain,
  Shield,
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { useToast } from "@/components/ui/use-toast"

interface AdvancedUploadSectionProps {
  userRole: "admin" | "teacher" | "student" | null
}

export function AdvancedUploadSection({ userRole }: AdvancedUploadSectionProps) {
  const [uploadMethod, setUploadMethod] = useState("drag-drop")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [processingStatus, setProcessingStatus] = useState<{ [key: string]: string }>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [batchMode, setBatchMode] = useState(false)
  const [autoDetectSettings, setAutoDetectSettings] = useState({
    language: true,
    studentName: true,
    subject: true,
    pageCount: true,
  })

  const [uploadSettings, setUploadSettings] = useState({
    studentName: "",
    subject: "",
    examType: "",
    class: "",
    maxMarks: 100,
    language: "english",
    autoSkewCorrection: true,
    noiseReduction: true,
    blurDetection: true,
    pageSegmentation: true,
    diagramDetection: true,
    tableDetection: true,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const supportedFormats = {
    images: [".jpg", ".jpeg", ".png", ".tiff", ".bmp", ".webp"],
    documents: [".pdf", ".doc", ".docx"],
    archives: [".zip", ".rar"],
  }

  const allSupportedFormats = [...supportedFormats.images, ...supportedFormats.documents, ...supportedFormats.archives]

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      "image/*": supportedFormats.images,
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/zip": [".zip"],
      "application/x-rar-compressed": [".rar"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: handleFileDrop,
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach((rejection) => {
        toast({
          title: "File Rejected",
          description: `${rejection.file.name}: ${rejection.errors[0]?.message}`,
          variant: "destructive",
        })
      })
    },
  })

  function handleFileDrop(acceptedFiles: File[]) {
    const newFiles = [...selectedFiles, ...acceptedFiles]
    setSelectedFiles(newFiles)

    // Generate preview URLs for images
    const newPreviewUrls = acceptedFiles
      .map((file) => {
        if (file.type.startsWith("image/")) {
          return URL.createObjectURL(file)
        }
        return null
      })
      .filter(Boolean) as string[]

    setPreviewUrls([...previewUrls, ...newPreviewUrls])

    // Auto-detect settings if enabled
    if (autoDetectSettings.studentName || autoDetectSettings.subject) {
      detectFileMetadata(acceptedFiles)
    }

    toast({
      title: "Files Added",
      description: `${acceptedFiles.length} file(s) added successfully`,
    })
  }

  const detectFileMetadata = async (files: File[]) => {
    for (const file of files) {
      try {
        // Simulate metadata detection from filename
        const filename = file.name.toLowerCase()

        // Extract student name pattern
        if (autoDetectSettings.studentName) {
          const nameMatch = filename.match(/([a-z]+_[a-z]+)|([a-z]+\s[a-z]+)/i)
          if (nameMatch && !uploadSettings.studentName) {
            setUploadSettings((prev) => ({
              ...prev,
              studentName: nameMatch[0].replace(/[_-]/g, " "),
            }))
          }
        }

        // Extract subject
        if (autoDetectSettings.subject) {
          const subjects = ["math", "physics", "chemistry", "biology", "english", "history"]
          const detectedSubject = subjects.find((subject) => filename.includes(subject))
          if (detectedSubject && !uploadSettings.subject) {
            setUploadSettings((prev) => ({
              ...prev,
              subject: detectedSubject.charAt(0).toUpperCase() + detectedSubject.slice(1),
            }))
          }
        }
      } catch (error) {
        console.error("Metadata detection failed:", error)
      }
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files)
      handleFileDrop(filesArray)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles]
    const removedFile = newFiles.splice(index, 1)[0]
    setSelectedFiles(newFiles)

    // Clean up preview URL
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index])
      const newPreviewUrls = [...previewUrls]
      newPreviewUrls.splice(index, 1)
      setPreviewUrls(newPreviewUrls)
    }

    // Remove from processing status
    const newProcessingStatus = { ...processingStatus }
    delete newProcessingStatus[removedFile.name]
    setProcessingStatus(newProcessingStatus)

    toast({
      title: "File Removed",
      description: `${removedFile.name} has been removed`,
    })
  }

  const preprocessFile = async (file: File) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setProcessingStatus((prev) => ({
          ...prev,
          [file.name]: "Preprocessing completed",
        }))
        resolve()
      }, 1000)
    })
  }

  const processFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to process",
        variant: "destructive",
      })
      return
    }

    if (!uploadSettings.studentName || !uploadSettings.subject) {
      toast({
        title: "Missing Information",
        description: "Please provide student name and subject",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]

        // Update processing status
        setProcessingStatus((prev) => ({
          ...prev,
          [file.name]: "Uploading...",
        }))

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: progress,
          }))
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        setProcessingStatus((prev) => ({
          ...prev,
          [file.name]: "Upload complete",
        }))

        // Preprocessing
        setProcessingStatus((prev) => ({
          ...prev,
          [file.name]: "Preprocessing...",
        }))
        await preprocessFile(file)

        // Page detection and segmentation
        if (uploadSettings.pageSegmentation) {
          setProcessingStatus((prev) => ({
            ...prev,
            [file.name]: "Detecting pages...",
          }))
          await new Promise((resolve) => setTimeout(resolve, 800))
        }

        // Language detection
        if (autoDetectSettings.language) {
          setProcessingStatus((prev) => ({
            ...prev,
            [file.name]: "Detecting language...",
          }))
          await new Promise((resolve) => setTimeout(resolve, 500))
        }

        // Skew correction
        if (uploadSettings.autoSkewCorrection) {
          setProcessingStatus((prev) => ({
            ...prev,
            [file.name]: "Correcting skew...",
          }))
          await new Promise((resolve) => setTimeout(resolve, 600))
        }

        // Noise reduction
        if (uploadSettings.noiseReduction) {
          setProcessingStatus((prev) => ({
            ...prev,
            [file.name]: "Reducing noise...",
          }))
          await new Promise((resolve) => setTimeout(resolve, 700))
        }

        // Blur detection
        if (uploadSettings.blurDetection) {
          setProcessingStatus((prev) => ({
            ...prev,
            [file.name]: "Checking image quality...",
          }))
          await new Promise((resolve) => setTimeout(resolve, 400))
        }

        setProcessingStatus((prev) => ({
          ...prev,
          [file.name]: "Ready for OCR",
        }))
      }

      toast({
        title: "Processing Complete",
        description: `${selectedFiles.length} file(s) processed successfully`,
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "An error occurred during file processing",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />
    if (file.type === "application/pdf") return <FileText className="h-5 w-5" />
    if (file.type.includes("word")) return <File className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const getFileTypeColor = (file: File) => {
    if (file.type.startsWith("image/")) return "bg-green-100 text-green-800"
    if (file.type === "application/pdf") return "bg-red-100 text-red-800"
    if (file.type.includes("word")) return "bg-blue-100 text-blue-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Advanced Script Upload System</h2>
        <p className="text-gray-600">Multi-format support with intelligent preprocessing and auto-detection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Method
              </CardTitle>
              <CardDescription>Choose your preferred upload method</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={uploadMethod} onValueChange={setUploadMethod}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="drag-drop">Drag & Drop</TabsTrigger>
                  <TabsTrigger value="file-browser">File Browser</TabsTrigger>
                  <TabsTrigger value="camera">Camera</TabsTrigger>
                  <TabsTrigger value="batch">Batch Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="drag-drop" className="mt-6">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50"
                        : isDragReject
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {isDragActive ? "Drop files here" : "Drag & drop files here"}
                    </p>
                    <p className="text-gray-600 mb-4">or click to browse files</p>
                    <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                      <Badge variant="outline">PDF</Badge>
                      <Badge variant="outline">JPG/PNG</Badge>
                      <Badge variant="outline">DOC/DOCX</Badge>
                      <Badge variant="outline">ZIP/RAR</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Max file size: 50MB</p>
                  </div>
                </TabsContent>

                <TabsContent value="file-browser" className="mt-6">
                  <div className="space-y-4">
                    <Label htmlFor="file-input">Select Files</Label>
                    <Input
                      id="file-input"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept={allSupportedFormats.join(",")}
                      multiple
                      className="cursor-pointer"
                    />
                    <p className="text-sm text-gray-600">Supported formats: {allSupportedFormats.join(", ")}</p>
                  </div>
                </TabsContent>

                <TabsContent value="camera" className="mt-6">
                  <div className="space-y-4">
                    <Label htmlFor="camera-input">Capture with Camera</Label>
                    <Input
                      id="camera-input"
                      type="file"
                      ref={cameraInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      capture="environment"
                      className="cursor-pointer"
                    />
                    <Alert>
                      <Camera className="h-4 w-4" />
                      <AlertTitle>Camera Capture</AlertTitle>
                      <AlertDescription>Use your device camera to capture answer sheets directly</AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>

                <TabsContent value="batch" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="batch-mode" checked={batchMode} onCheckedChange={setBatchMode} />
                      <Label htmlFor="batch-mode">Enable Batch Processing</Label>
                    </div>
                    {batchMode && (
                      <Alert>
                        <Zap className="h-4 w-4" />
                        <AlertTitle>Batch Mode Enabled</AlertTitle>
                        <AlertDescription>
                          Upload multiple files with automatic processing and organization
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>Provide details for evaluation context</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student-name">Student Name *</Label>
                  <Input
                    id="student-name"
                    value={uploadSettings.studentName}
                    onChange={(e) => setUploadSettings((prev) => ({ ...prev, studentName: e.target.value }))}
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <Label htmlFor="class">Class/Grade</Label>
                  <Select
                    value={uploadSettings.class}
                    onValueChange={(value) => setUploadSettings((prev) => ({ ...prev, class: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grade-6">Grade 6</SelectItem>
                      <SelectItem value="grade-7">Grade 7</SelectItem>
                      <SelectItem value="grade-8">Grade 8</SelectItem>
                      <SelectItem value="grade-9">Grade 9</SelectItem>
                      <SelectItem value="grade-10">Grade 10</SelectItem>
                      <SelectItem value="grade-11">Grade 11</SelectItem>
                      <SelectItem value="grade-12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={uploadSettings.subject}
                    onValueChange={(value) => setUploadSettings((prev) => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Geography">Geography</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="exam-type">Exam Type</Label>
                  <Select
                    value={uploadSettings.examType}
                    onValueChange={(value) => setUploadSettings((prev) => ({ ...prev, examType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit-test">Unit Test</SelectItem>
                      <SelectItem value="midterm">Mid-term Exam</SelectItem>
                      <SelectItem value="final">Final Exam</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="practice">Practice Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="max-marks">Maximum Marks</Label>
                  <Input
                    id="max-marks"
                    type="number"
                    value={uploadSettings.maxMarks}
                    onChange={(e) =>
                      setUploadSettings((prev) => ({ ...prev, maxMarks: Number.parseInt(e.target.value) || 100 }))
                    }
                    placeholder="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Files ({selectedFiles.length})</CardTitle>
                <CardDescription>Review and manage uploaded files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {previewUrls[index] ? (
                          <img
                            src={previewUrls[index] || "/placeholder.svg"}
                            alt={`Preview ${index}`}
                            className="h-16 w-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                            {getFileIcon(file)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <Badge variant="outline" className={getFileTypeColor(file)}>
                            {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                        {uploadProgress[file.name] !== undefined && (
                          <div className="mt-2">
                            <Progress value={uploadProgress[file.name]} className="h-2" />
                          </div>
                        )}

                        {processingStatus[file.name] && (
                          <p className="text-xs text-blue-600 mt-1">{processingStatus[file.name]}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {previewUrls[index] && (
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <Button onClick={processFiles} disabled={isProcessing} className="w-full">
                  {isProcessing ? (
                    <>
                      <Scan className="mr-2 h-4 w-4 animate-spin" />
                      Processing Files...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Process Files for Evaluation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Auto-Detection Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Auto-Detection
              </CardTitle>
              <CardDescription>Intelligent metadata extraction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-language">Language Detection</Label>
                <Switch
                  id="auto-language"
                  checked={autoDetectSettings.language}
                  onCheckedChange={(checked) => setAutoDetectSettings((prev) => ({ ...prev, language: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-student">Student Name</Label>
                <Switch
                  id="auto-student"
                  checked={autoDetectSettings.studentName}
                  onCheckedChange={(checked) => setAutoDetectSettings((prev) => ({ ...prev, studentName: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-subject">Subject Detection</Label>
                <Switch
                  id="auto-subject"
                  checked={autoDetectSettings.subject}
                  onCheckedChange={(checked) => setAutoDetectSettings((prev) => ({ ...prev, subject: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-pages">Page Count</Label>
                <Switch
                  id="auto-pages"
                  checked={autoDetectSettings.pageCount}
                  onCheckedChange={(checked) => setAutoDetectSettings((prev) => ({ ...prev, pageCount: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preprocessing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preprocessing
              </CardTitle>
              <CardDescription>Image enhancement options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="skew-correction">Skew Correction</Label>
                <Switch
                  id="skew-correction"
                  checked={uploadSettings.autoSkewCorrection}
                  onCheckedChange={(checked) => setUploadSettings((prev) => ({ ...prev, autoSkewCorrection: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="noise-reduction">Noise Reduction</Label>
                <Switch
                  id="noise-reduction"
                  checked={uploadSettings.noiseReduction}
                  onCheckedChange={(checked) => setUploadSettings((prev) => ({ ...prev, noiseReduction: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="blur-detection">Blur Detection</Label>
                <Switch
                  id="blur-detection"
                  checked={uploadSettings.blurDetection}
                  onCheckedChange={(checked) => setUploadSettings((prev) => ({ ...prev, blurDetection: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="page-segmentation">Page Segmentation</Label>
                <Switch
                  id="page-segmentation"
                  checked={uploadSettings.pageSegmentation}
                  onCheckedChange={(checked) => setUploadSettings((prev) => ({ ...prev, pageSegmentation: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="diagram-detection">Diagram Detection</Label>
                <Switch
                  id="diagram-detection"
                  checked={uploadSettings.diagramDetection}
                  onCheckedChange={(checked) => setUploadSettings((prev) => ({ ...prev, diagramDetection: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="table-detection">Table Detection</Label>
                <Switch
                  id="table-detection"
                  checked={uploadSettings.tableDetection}
                  onCheckedChange={(checked) => setUploadSettings((prev) => ({ ...prev, tableDetection: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Language Support
              </CardTitle>
              <CardDescription>Multi-language recognition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="primary-language">Primary Language</Label>
                  <Select
                    value={uploadSettings.language}
                    onValueChange={(value) => setUploadSettings((prev) => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="arabic">Arabic</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <Languages className="h-4 w-4" />
                  <AlertTitle>Multi-language Support</AlertTitle>
                  <AlertDescription>Supports 50+ languages with automatic script detection</AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Security & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
              <CardDescription>Data protection settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Secure Processing</AlertTitle>
                  <AlertDescription>
                    All files are encrypted and processed securely. Data is automatically deleted after evaluation.
                  </AlertDescription>
                </Alert>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>• End-to-end encryption</p>
                  <p>• GDPR compliant</p>
                  <p>• No data retention</p>
                  <p>• Audit trail logging</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
