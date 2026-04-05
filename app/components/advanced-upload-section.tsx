"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Camera, FileText, Loader2, CheckCircle, AlertCircle, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useWebSocket } from "@/components/websocket-provider"

interface EvaluationResult {
  sessionId: string
  studentName: string
  subject: string
  examType: string
  obtainedMarks: number
  totalMarks: number
  percentage: number
  grade: string
  confidenceScore: number
  overallFeedback: string
  strengths: string[]
  improvements: string[]
  questions: Array<{
    id: number
    topic: string
    studentAnswer: string
    obtainedMarks: number
    maxMarks: number
    feedback: string
    keyPointsCovered: string[]
    keyPointsMissed: string[]
  }>
}

const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "History", "Geography", "Computer Science", "Economics", "Literature",
]

const examTypes = ["Unit Test", "Mid-term Exam", "Final Exam", "Quiz", "Assignment", "Practice Test"]

export function AdvancedUploadSection({ userRole }: { userRole?: string }) {
  const [uploadMethod, setUploadMethod] = useState<"file" | "camera">("file")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [metadata, setMetadata] = useState({ studentName: "", subject: "", examType: "", rubric: "" })
  const [isUploading, setIsUploading] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [progressSteps, setProgressSteps] = useState<Array<{ step: string; message: string; progress: number }>>([])
  const [overallProgress, setOverallProgress] = useState(0)
  const [error, setError] = useState("")
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { subscribeToProgress } = useWebSocket()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(Array.from(e.target.files || []))
    setResult(null)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFiles.length || !metadata.studentName || !metadata.subject || !metadata.examType) {
      toast({ title: "Missing fields", description: "Fill all required fields and select a file.", variant: "destructive" })
      return
    }

    setError("")
    setResult(null)
    setProgressSteps([])
    setOverallProgress(0)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFiles[0])
      formData.append("studentName", metadata.studentName)
      formData.append("subject", metadata.subject)
      formData.append("examType", metadata.examType)
      formData.append("rubric", metadata.rubric)

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed")

      const { sessionId } = uploadData
      setIsUploading(false)
      setIsEvaluating(true)

      subscribeToProgress(
        sessionId,
        (update: { step: string; message: string; progress: number }) => {
          setProgressSteps((prev) => [...prev, update])
          setOverallProgress(update.progress)
        },
        async () => {
          const evalRes = await fetch("/api/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          })
          const evalData = await evalRes.json()

          if (!evalRes.ok) throw new Error(evalData.error || "Evaluation failed")

          setResult(evalData.result)
          setIsEvaluating(false)
          toast({ title: "Evaluation complete!", description: `${metadata.studentName} scored ${evalData.result.percentage}% (${evalData.result.grade})` })
        }
      )

      const evalRes = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
      const evalData = await evalRes.json()
      if (!evalRes.ok) throw new Error(evalData.error || "Evaluation failed")
      setResult(evalData.result)
      setIsEvaluating(false)

    } catch (err: any) {
      setError(err.message)
      setIsUploading(false)
      setIsEvaluating(false)
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const isProcessing = isUploading || isEvaluating

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5 text-indigo-600" />
              Answer Sheet Upload
            </CardTitle>
            <CardDescription>Upload an answer sheet for AI evaluation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="studentName" className="text-slate-700">Student Name *</Label>
                <Input
                  id="studentName"
                  value={metadata.studentName}
                  onChange={(e) => setMetadata((p) => ({ ...p, studentName: e.target.value }))}
                  placeholder="e.g. Jane Smith"
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700">Subject *</Label>
                  <Select value={metadata.subject} onValueChange={(v) => setMetadata((p) => ({ ...p, subject: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-700">Exam Type *</Label>
                  <Select value={metadata.examType} onValueChange={(v) => setMetadata((p) => ({ ...p, examType: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-slate-700">Custom Rubric (optional)</Label>
                <Textarea
                  value={metadata.rubric}
                  onChange={(e) => setMetadata((p) => ({ ...p, rubric: e.target.value }))}
                  placeholder="Describe your marking scheme, e.g. Q1 (20 marks): student must mention..."
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                {(["file", "camera"] as const).map((m) => (
                  <Button
                    key={m}
                    type="button"
                    variant={uploadMethod === m ? "default" : "outline"}
                    onClick={() => setUploadMethod(m)}
                    className={`flex-1 h-14 flex-col gap-1 text-xs ${uploadMethod === m ? "bg-indigo-600 hover:bg-indigo-700" : "border-slate-200"}`}
                  >
                    {m === "file" ? <Upload className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                    {m === "file" ? "Upload File" : "Camera Scan"}
                  </Button>
                ))}
              </div>

              <div>
                <Label className="text-slate-700">Answer Sheet * (PDF, JPG, PNG — max 50MB)</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.tiff"
                  capture={uploadMethod === "camera" ? "environment" : undefined}
                  onChange={handleFileSelect}
                  className="mt-1 cursor-pointer"
                  required
                />
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-indigo-600 flex items-center gap-1 mt-1">
                    <CheckCircle className="h-4 w-4" />
                    {selectedFiles[0].name} ({(selectedFiles[0].size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isUploading ? "Uploading..." : "Evaluating..."}</>
                ) : (
                  <><Zap className="mr-2 h-4 w-4" /> Start AI Evaluation</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Processing Status */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Processing Status</CardTitle>
            <CardDescription>Real-time evaluation progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isProcessing && !result && !error && (
              <div className="text-center py-12">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <FileText className="h-7 w-7 text-indigo-400" />
                </div>
                <p className="text-slate-500 text-sm">Upload an answer sheet to begin AI evaluation</p>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {progressSteps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                      {s.message}
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                      Processing...
                    </div>
                  )}
                </div>
              </div>
            )}

            {result && !isProcessing && (
              <Alert className="border-indigo-200 bg-indigo-50">
                <CheckCircle className="h-4 w-4 text-indigo-600" />
                <AlertDescription className="text-indigo-800">
                  Evaluation complete! <strong>{result.studentName}</strong> scored <strong>{result.obtainedMarks}/{result.totalMarks}</strong> ({result.grade}).
                  Scroll down to view the full report.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Result */}
      {result && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Evaluation Report</CardTitle>
            <CardDescription>{result.studentName} · {result.subject} · {result.examType}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Score", value: `${result.obtainedMarks}/${result.totalMarks}` },
                { label: "Percentage", value: `${result.percentage}%` },
                { label: "Grade", value: result.grade },
                { label: "AI Confidence", value: `${result.confidenceScore}%` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center bg-slate-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <p className="text-sm font-medium text-indigo-900 mb-1">Overall Feedback</p>
              <p className="text-sm text-indigo-800">{result.overallFeedback}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Strengths</p>
                <ul className="space-y-1">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Areas for Improvement</p>
                <ul className="space-y-1">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {result.questions?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Question-by-Question Breakdown</p>
                <div className="space-y-3">
                  {result.questions.map((q) => (
                    <div key={q.id} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-800">Q{q.id}: {q.topic}</p>
                        <span className="text-sm font-semibold text-indigo-600">{q.obtainedMarks}/{q.maxMarks}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{q.feedback}</p>
                      <Progress value={(q.obtainedMarks / q.maxMarks) * 100} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
