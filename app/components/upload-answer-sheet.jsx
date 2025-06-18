"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Camera, FileText, Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UploadAnswerSheet({ onEvaluationComplete }) {
  const [uploadMethod, setUploadMethod] = useState("file")
  const [selectedFile, setSelectedFile] = useState(null)
  const [subject, setSubject] = useState("")
  const [examType, setExamType] = useState("")
  const [studentName, setStudentName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState("")
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

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

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const simulateEvaluation = async () => {
    setIsProcessing(true)

    // Simulate OCR processing
    setProcessingStep("Extracting text from answer sheet...")
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate AI analysis
    setProcessingStep("Analyzing answers with AI...")
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Simulate scoring
    setProcessingStep("Calculating scores and generating feedback...")
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate mock evaluation results
    const mockResults = {
      studentName,
      subject,
      examType,
      totalMarks: 100,
      obtainedMarks: 78,
      percentage: 78,
      grade: "B+",
      evaluationDate: new Date().toLocaleDateString(),
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
      confidenceScore: 85,
    }

    setProcessingStep("Evaluation complete!")
    setIsProcessing(false)
    onEvaluationComplete(mockResults)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile || !subject || !examType || !studentName) {
      alert("Please fill all required fields and select a file")
      return
    }
    await simulateEvaluation()
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
          <CardDescription>Upload your answer sheet for AI-powered evaluation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="studentName">Student Name *</Label>
                <Input
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={subject} onValueChange={setSubject} required>
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
                  <Select value={examType} onValueChange={setExamType} required>
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
                <Label htmlFor="file">Select Answer Sheet (PDF, JPG, PNG) *</Label>
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Selected: {selectedFile.name}
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
                  required
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Captured: {selectedFile.name}
                  </p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Start AI Evaluation"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Processing Status */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Evaluation Process</CardTitle>
          <CardDescription>AI-powered evaluation steps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isProcessing && !processingStep && (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Upload an answer sheet to start evaluation</p>
            </div>
          )}

          {isProcessing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>{processingStep}</AlertDescription>
            </Alert>
          )}

          {processingStep === "Evaluation complete!" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Evaluation completed successfully! Check the Results tab.</AlertDescription>
            </Alert>
          )}

          {/* Process Steps */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <span>OCR Text Extraction</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <span>AI Content Analysis</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              <span>Intelligent Scoring</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">4</span>
              </div>
              <span>Feedback Generation</span>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">AI Evaluation Features</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Handwriting recognition (OCR)</li>
              <li>• Content relevance analysis</li>
              <li>• Key point identification</li>
              <li>• Teacher-style feedback</li>
              <li>• Improvement suggestions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
