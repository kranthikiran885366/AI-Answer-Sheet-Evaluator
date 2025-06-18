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
import { Upload, FileText, Loader2, CheckCircle, Scan, Brain } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useDropzone } from "react-dropzone"

interface UploadSectionProps {
  onEvaluationComplete: (data: any) => void
}

export function UploadSection({ onEvaluationComplete }: UploadSectionProps) {
  const [uploadMethod, setUploadMethod] = useState("file")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [formData, setFormData] = useState({
    studentName: "",
    subject: "",
    examType: "",
    class: "",
    evaluationMode: "auto",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState("")
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

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
  const classes = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"]
  const evaluationModes = [
    { value: "auto", label: "Fully Automatic" },
    { value: "assisted", label: "AI-Assisted Manual" },
    { value: "hybrid", label: "Hybrid (AI + Teacher Review)" },
  ]

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    onDrop: (acceptedFiles) => {
      const newFiles = [...selectedFiles, ...acceptedFiles]
      setSelectedFiles(newFiles)

      // Generate preview URLs
      const newPreviewUrls = acceptedFiles.map((file) => URL.createObjectURL(file))
      setPreviewUrls([...previewUrls, ...newPreviewUrls])
    },
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files)
      setSelectedFiles([...selectedFiles, ...filesArray])

      // Generate preview URLs
      const newPreviewUrls = filesArray.map((file) => URL.createObjectURL(file))
      setPreviewUrls([...previewUrls, ...newPreviewUrls])
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    setSelectedFiles(newFiles)

    const newPreviewUrls = [...previewUrls]
    URL.revokeObjectURL(newPreviewUrls[index])
    newPreviewUrls.splice(index, 1)
    setPreviewUrls(newPreviewUrls)
  }

  const simulateOCRAndEvaluation = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      })
      return
    }

    if (!formData.studentName || !formData.subject || !formData.examType) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setProgress(0)

    // Simulate file upload
    setProcessingStep("Uploading files...")
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setProgress(15)

    // Simulate OCR processing
    setProcessingStep("Performing OCR text extraction...")
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setProgress(40)

    // Simulate preprocessing
    setProcessingStep("Preprocessing and normalizing content...")
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setProgress(60)

    // Simulate AI analysis
    setProcessingStep("Analyzing with AI evaluation models...")
    await new Promise((resolve) => setTimeout(resolve, 2500))
    setProgress(85)

    // Simulate scoring and feedback generation
    setProcessingStep("Generating scores and feedback...")
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setProgress(100)

    // Generate mock evaluation results
    const mockResults = {
      studentName: formData.studentName,
      subject: formData.subject,
      examType: formData.examType,
      class: formData.class,
      totalMarks: 100,
      obtainedMarks: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      percentage: 0,
      grade: "",
      evaluationDate: new Date().toLocaleDateString(),
      confidenceScore: Math.floor(Math.random() * 10) + 90, // Random confidence between 90-100
      questions: [
        {
          id: 1,
          question: "Explain the concept of photosynthesis and its importance in the ecosystem.",
          studentAnswer:
            "Photosynthesis is the process by which plants make food using sunlight, water, and carbon dioxide. It produces oxygen which is important for all living things.",
          maxMarks: 20,
          obtainedMarks: 16,
          feedback:
            "Good basic understanding! You correctly identified the key components and importance. However, you could have mentioned chlorophyll's role and the chemical equation for a complete answer.",
          keyPointsCovered: ["Basic process", "Importance to ecosystem"],
          keyPointsMissed: ["Role of chlorophyll", "Chemical equation", "Light and dark reactions"],
          suggestions:
            "Include more scientific details and the chemical equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
        },
        {
          id: 2,
          question: "Solve: 2x + 5 = 15. Show your working.",
          studentAnswer: "2x + 5 = 15\n2x = 15 - 5\n2x = 10\nx = 5",
          maxMarks: 15,
          obtainedMarks: 15,
          feedback: "Excellent! Perfect solution with clear step-by-step working. Well done!",
          keyPointsCovered: ["Correct method", "All steps shown", "Correct answer"],
          keyPointsMissed: [],
          suggestions: "Perfect answer! Keep up the good work.",
        },
        {
          id: 3,
          question: "Describe the water cycle and its stages.",
          studentAnswer: "Water evaporates from oceans and becomes clouds. Then it rains.",
          maxMarks: 25,
          obtainedMarks: 12,
          feedback:
            "You have the basic idea but your answer lacks detail. You mentioned evaporation and precipitation but missed several important stages.",
          keyPointsCovered: ["Evaporation", "Precipitation"],
          keyPointsMissed: ["Condensation", "Collection", "Transpiration", "Detailed explanation"],
          suggestions:
            "Include all stages: Evaporation → Condensation → Precipitation → Collection. Also mention transpiration from plants.",
        },
      ],
      overallFeedback:
        "Good effort! You show understanding of basic concepts but could improve by providing more detailed explanations and including scientific terminology. Focus on covering all key points in your answers.",
      strengths: ["Clear handwriting", "Logical thinking", "Basic concept understanding"],
      improvements: ["Add more scientific details", "Include diagrams where applicable", "Cover all key points"],
    }

    // Calculate percentage and grade
    mockResults.percentage = Math.round((mockResults.obtainedMarks / mockResults.totalMarks) * 100)

    if (mockResults.percentage >= 90) mockResults.grade = "A+"
    else if (mockResults.percentage >= 80) mockResults.grade = "A"
    else if (mockResults.percentage >= 70) mockResults.grade = "B+"
    else if (mockResults.percentage >= 60) mockResults.grade = "B"
    else if (mockResults.percentage >= 50) mockResults.grade = "C"
    else mockResults.grade = "D"

    setProcessingStep("Evaluation complete!")
    setIsProcessing(false)

    // Clean up preview URLs
    previewUrls.forEach((url) => URL.revokeObjectURL(url))

    // Pass results to parent component
    onEvaluationComplete(mockResults)
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Answer Sheet Upload
            </CardTitle>
            <CardDescription>Upload answer sheets for AI-powered evaluation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Student Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="studentName">Student Name *</Label>
                <Input
                  id="studentName"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="Enter student name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="examType">Exam Type *</Label>
                  <Select
                    value={formData.examType}
                    onValueChange={(value) => setFormData({ ...formData, examType: value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class">Class/Grade</Label>
                  <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="evaluationMode">Evaluation Mode</Label>
                  <Select
                    value={formData.evaluationMode}
                    onValueChange={(value) => setFormData({ ...formData, evaluationMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {evaluationModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
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
              <Tabs defaultValue="file" onValueChange={setUploadMethod}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="file">File Upload</TabsTrigger>
                  <TabsTrigger value="camera">Camera Scan</TabsTrigger>
                  <TabsTrigger value="drag">Drag & Drop</TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Select Answer Sheet (PDF, JPG, PNG) *</Label>
                    <Input
                      id="file"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                    />
                  </div>
                </TabsContent>

                <TabsContent value="camera" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="camera">Capture Answer Sheet *</Label>
                    <Input
                      id="camera"
                      type="file"
                      ref={cameraInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      capture="environment"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="drag" className="space-y-4 pt-4">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      {isDragActive ? "Drop the files here" : "Drag & drop files here, or click to select files"}
                    </p>
                    <p className="text-xs text-muted-foreground">Supports PDF, JPG, PNG files</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({selectedFiles.length})</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                      {previewUrls[index] && file.type.startsWith("image/") ? (
                        <img
                          src={previewUrls[index] || "/placeholder.svg"}
                          alt={`Preview ${index}`}
                          className="h-12 w-12 object-cover rounded-md"
                        />
                      ) : (
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={simulateOCRAndEvaluation}
              className="w-full"
              disabled={isProcessing || selectedFiles.length === 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Start AI Evaluation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Processing Status */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Process</CardTitle>
            <CardDescription>AI-powered evaluation steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isProcessing && !processingStep && (
              <div className="text-center py-12">
                <Scan className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Upload an answer sheet to start evaluation</p>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-4">
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertTitle>Processing</AlertTitle>
                  <AlertDescription>{processingStep}</AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            )}

            {processingStep === "Evaluation complete!" && (
              <Alert variant="success">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Evaluation completed successfully! Check the Results tab.</AlertDescription>
              </Alert>
            )}

            {/* Process Steps */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Evaluation Process</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      processingStep === "Uploading files..." || processingStep === "Evaluation complete!"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="font-semibold">1</span>
                  </div>
                  <span>File Upload & Validation</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      processingStep === "Performing OCR text extraction..." ||
                      processingStep === "Evaluation complete!"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="font-semibold">2</span>
                  </div>
                  <span>OCR Text Extraction</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      processingStep === "Preprocessing and normalizing content..." ||
                      processingStep === "Evaluation complete!"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="font-semibold">3</span>
                  </div>
                  <span>Content Preprocessing</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      processingStep === "Analyzing with AI evaluation models..." ||
                      processingStep === "Evaluation complete!"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="font-semibold">4</span>
                  </div>
                  <span>AI Content Analysis</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      processingStep === "Generating scores and feedback..." ||
                      processingStep === "Evaluation complete!"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="font-semibold">5</span>
                  </div>
                  <span>Scoring & Feedback Generation</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">AI Evaluation Features</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Advanced handwriting recognition (OCR)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Semantic understanding of answers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Rubric-based scoring system
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Personalized feedback generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Continuous learning from teacher corrections
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
