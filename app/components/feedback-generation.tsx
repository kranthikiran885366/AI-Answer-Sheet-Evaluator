"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Target,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Zap,
  Brain,
  Star,
  ThumbsUp,
  Download,
  Loader2,
  FileText,
  RefreshCw,
} from "lucide-react"

interface FeedbackData {
  id: string
  studentName: string
  subject: string
  score: number
  maxScore: number
  grade: string
  overallFeedback: string
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  nextSteps: string[]
  confidence: number
}

interface EvaluationOption {
  id: string
  studentName: string
  subject: string
  score: number
  maxScore: number
  grade: string
  evaluationDate: string
}

export function FeedbackGeneration() {
  const [activeTab, setActiveTab] = useState("generate")
  const [selectedEvaluation, setSelectedEvaluation] = useState("")
  const [feedbackType, setFeedbackType] = useState("comprehensive")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingEvals, setIsLoadingEvals] = useState(true)
  const [generatedFeedback, setGeneratedFeedback] = useState<FeedbackData | null>(null)
  const [evaluations, setEvaluations] = useState<EvaluationOption[]>([])
  const [error, setError] = useState("")

  const feedbackTypes = [
    { value: "comprehensive", label: "Comprehensive Feedback", description: "Detailed analysis with improvement suggestions" },
    { value: "encouraging", label: "Encouraging Feedback", description: "Positive reinforcement focused" },
    { value: "constructive", label: "Constructive Feedback", description: "Specific areas for improvement" },
    { value: "motivational", label: "Motivational Feedback", description: "Inspiring and goal-oriented" },
  ]

  useEffect(() => {
    fetchEvaluations()
  }, [])

  const fetchEvaluations = async () => {
    setIsLoadingEvals(true)
    try {
      const res = await fetch("/api/feedback/generate")
      if (res.ok) {
        const data = await res.json()
        setEvaluations(data.evaluations || [])
      }
    } catch (err) {
      console.error("Failed to load evaluations")
    } finally {
      setIsLoadingEvals(false)
    }
  }

  const generateFeedback = async () => {
    if (!selectedEvaluation) return
    setIsGenerating(true)
    setError("")
    setGeneratedFeedback(null)

    try {
      const res = await fetch("/api/feedback/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evaluationId: selectedEvaluation, feedbackType }),
      })

      const data = await res.json()

      if (res.ok) {
        setGeneratedFeedback(data.feedback)
      } else {
        setError(data.error || "Failed to generate feedback")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const exportFeedback = () => {
    if (!generatedFeedback) return

    const text = `STUDENT FEEDBACK REPORT
==============================
Student: ${generatedFeedback.studentName}
Subject: ${generatedFeedback.subject}
Score: ${generatedFeedback.score}/${generatedFeedback.maxScore} (${generatedFeedback.grade})

OVERALL FEEDBACK:
${generatedFeedback.overallFeedback}

STRENGTHS:
${generatedFeedback.strengths.map((s) => `• ${s}`).join("\n")}

AREAS FOR IMPROVEMENT:
${generatedFeedback.improvements.map((i) => `• ${i}`).join("\n")}

SUGGESTIONS:
${generatedFeedback.suggestions.map((s) => `• ${s}`).join("\n")}

NEXT STEPS:
${generatedFeedback.nextSteps.map((n) => `• ${n}`).join("\n")}

AI Confidence: ${generatedFeedback.confidence}%
`
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `feedback-${generatedFeedback.studentName.replace(/\s/g, "-")}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">AI Feedback Generation</h2>
          <p className="text-slate-500 mt-1">Generate personalized, constructive feedback for student evaluations</p>
        </div>
        <Button variant="outline" onClick={fetchEvaluations} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100">
          <TabsTrigger value="generate">Generate Feedback</TabsTrigger>
          <TabsTrigger value="templates">Feedback Types</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                    Feedback Settings
                  </CardTitle>
                  <CardDescription>Configure feedback generation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label>Select Evaluation</Label>
                    {isLoadingEvals ? (
                      <div className="flex items-center gap-2 py-2 text-slate-400 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading evaluations...
                      </div>
                    ) : evaluations.length === 0 ? (
                      <div className="py-3 text-center">
                        <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No evaluations available.</p>
                        <p className="text-xs text-slate-400">Upload and evaluate answer sheets first.</p>
                      </div>
                    ) : (
                      <Select value={selectedEvaluation} onValueChange={setSelectedEvaluation}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose an evaluation" />
                        </SelectTrigger>
                        <SelectContent>
                          {evaluations.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.studentName} — {e.subject} ({e.grade}, {Math.round((e.score / e.maxScore) * 100)}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div>
                    <Label>Feedback Style</Label>
                    <Select value={feedbackType} onValueChange={setFeedbackType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {feedbackTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-slate-500">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={generateFeedback}
                    disabled={!selectedEvaluation || isGenerating}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Brain className="mr-2 h-4 w-4 animate-pulse" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Generate AI Feedback
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {generatedFeedback && (
                <Card className="border border-indigo-200 bg-indigo-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 text-sm">
                      <Target className="h-4 w-4 text-indigo-600" />
                      Feedback Quality
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>AI Confidence</span>
                        <span>{generatedFeedback.confidence}%</span>
                      </div>
                      <Progress value={generatedFeedback.confidence} className="h-1.5" />
                    </div>
                    <Button onClick={exportFeedback} variant="outline" size="sm" className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      Export Feedback
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2">
              {!generatedFeedback && !isGenerating && (
                <Card className="border border-slate-200 h-full flex items-center justify-center">
                  <CardContent className="text-center py-16">
                    <Brain className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Ready to Generate</h3>
                    <p className="text-slate-500 text-sm">Select an evaluation and click Generate AI Feedback</p>
                  </CardContent>
                </Card>
              )}

              {isGenerating && (
                <Card className="border border-indigo-200 h-full flex items-center justify-center">
                  <CardContent className="text-center py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Generating Feedback</h3>
                    <p className="text-slate-500 text-sm">AI is analyzing the evaluation and crafting personalized feedback...</p>
                  </CardContent>
                </Card>
              )}

              {generatedFeedback && !isGenerating && (
                <div className="space-y-4">
                  <Card className="border border-slate-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-slate-900">{generatedFeedback.studentName}</CardTitle>
                          <CardDescription>{generatedFeedback.subject} · Grade: {generatedFeedback.grade} · {generatedFeedback.score}/{generatedFeedback.maxScore}</CardDescription>
                        </div>
                        <Badge className="bg-indigo-100 text-indigo-700">
                          <Star className="h-3 w-3 mr-1" />
                          {generatedFeedback.confidence}% confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700">{generatedFeedback.overallFeedback}</p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border border-indigo-100 bg-indigo-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm text-indigo-800">
                          <ThumbsUp className="h-4 w-4" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {generatedFeedback.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-indigo-700">
                              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border border-orange-100 bg-orange-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm text-orange-800">
                          <TrendingUp className="h-4 w-4" />
                          Improvements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {generatedFeedback.improvements.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-orange-700">
                              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border border-blue-100 bg-blue-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm text-blue-800">
                          <Lightbulb className="h-4 w-4" />
                          Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {generatedFeedback.suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                              <span className="font-bold text-blue-500">→</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border border-violet-100 bg-violet-50/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm text-violet-800">
                          <BookOpen className="h-4 w-4" />
                          Next Steps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {generatedFeedback.nextSteps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-violet-700">
                              <span className="font-bold text-violet-500">{i + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbackTypes.map((type) => (
              <Card
                key={type.value}
                className={`border cursor-pointer transition-all ${feedbackType === type.value ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-200"}`}
                onClick={() => { setFeedbackType(type.value); setActiveTab("generate") }}
              >
                <CardHeader>
                  <CardTitle className="text-slate-900 text-base">{type.label}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {feedbackType === type.value && (
                    <Badge className="bg-indigo-100 text-indigo-700">Currently selected</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
