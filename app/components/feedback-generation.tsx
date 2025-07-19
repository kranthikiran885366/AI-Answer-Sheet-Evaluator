"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
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
  ThumbsDown,
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

export function FeedbackGeneration() {
  const [activeTab, setActiveTab] = useState("generate")
  const [selectedEvaluation, setSelectedEvaluation] = useState("")
  const [feedbackType, setFeedbackType] = useState("comprehensive")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedFeedback, setGeneratedFeedback] = useState<FeedbackData | null>(null)

  // Mock evaluation data
  const mockEvaluations = [
    { id: "evaluation-1", studentName: "John Doe", subject: "Mathematics", score: 85 },
    { id: "evaluation-2", studentName: "Jane Smith", subject: "Physics", score: 92 },
    { id: "evaluation-3", studentName: "Mike Johnson", subject: "Chemistry", score: 78 },
  ]

  const feedbackTypes = [
    {
      value: "comprehensive",
      label: "Comprehensive Feedback",
      description: "Detailed analysis with improvement suggestions",
    },
    { value: "encouraging", label: "Encouraging Feedback", description: "Positive reinforcement focused" },
    { value: "constructive", label: "Constructive Feedback", description: "Specific areas for improvement" },
    { value: "motivational", label: "Motivational Feedback", description: "Inspiring and goal-oriented" },
  ]

  const generateFeedback = async () => {
    if (!selectedEvaluation) return

    setIsGenerating(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock generated feedback
    const mockFeedback: FeedbackData = {
      id: selectedEvaluation,
      studentName: "John Doe",
      subject: "Mathematics",
      score: 85,
      maxScore: 100,
      grade: "B+",
      overallFeedback:
        "You have demonstrated a solid understanding of the mathematical concepts covered in this assessment. Your problem-solving approach shows logical thinking and good computational skills. With some focused practice on the areas highlighted below, you can achieve even better results.",
      strengths: [
        "Strong grasp of algebraic manipulation",
        "Accurate calculations in most problems",
        "Clear presentation of solutions",
        "Good understanding of basic concepts",
      ],
      improvements: [
        "Work on complex word problems",
        "Practice geometric proofs",
        "Improve time management during exams",
        "Review trigonometric identities",
      ],
      suggestions: [
        "Practice 2-3 word problems daily",
        "Use visual aids for geometry problems",
        "Create a study schedule with timed practice sessions",
        "Form a study group with classmates",
      ],
      nextSteps: [
        "Review Chapter 7: Advanced Algebra",
        "Complete practice worksheets 15-18",
        "Schedule a meeting with your teacher",
        "Take the practice test next week",
      ],
      confidence: 94.5,
    }

    setGeneratedFeedback(mockFeedback)
    setIsGenerating(false)
  }

  const exportFeedback = () => {
    if (!generatedFeedback) return

    const feedbackText = `
STUDENT FEEDBACK REPORT

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

Generated with AI Confidence: ${generatedFeedback.confidence}%
    `

    const blob = new Blob([feedbackText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `feedback-${generatedFeedback.studentName.replace(" ", "-")}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Feedback Generation</h2>
        <p className="text-gray-600">Generate personalized, constructive feedback for student evaluations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Feedback</TabsTrigger>
          <TabsTrigger value="templates">Feedback Templates</TabsTrigger>
          <TabsTrigger value="analytics">Feedback Analytics</TabsTrigger>
        </TabsList>

        {/* Generate Feedback Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Generation Controls */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Feedback Settings
                  </CardTitle>
                  <CardDescription>Configure feedback generation parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="evaluation">Select Evaluation</Label>
                    <Select value={selectedEvaluation} onValueChange={setSelectedEvaluation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an evaluation" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockEvaluations.map((evaluation) => (
                          <SelectItem key={evaluation.id} value={evaluation.id}>
                            {evaluation.studentName} - {evaluation.subject} ({evaluation.score}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="feedbackType">Feedback Type</Label>
                    <Select value={feedbackType} onValueChange={setFeedbackType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {feedbackTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={generateFeedback} disabled={!selectedEvaluation || isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <Brain className="mr-2 h-4 w-4 animate-pulse" />
                        Generating Feedback...
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

              {/* Feedback Quality Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Personalization</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Constructiveness</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Clarity</span>
                      <span>98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Actionability</span>
                      <span>89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generated Feedback Display */}
            <div className="lg:col-span-2 space-y-6">
              {isGenerating && (
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center space-y-4">
                      <Brain className="h-16 w-16 text-blue-600 mx-auto animate-pulse" />
                      <div>
                        <h3 className="text-lg font-semibold">Generating Personalized Feedback</h3>
                        <p className="text-gray-600">
                          AI is analyzing the evaluation and creating tailored feedback...
                        </p>
                      </div>
                      <Progress value={66} className="w-full max-w-md mx-auto" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedFeedback && !isGenerating && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Generated Feedback</CardTitle>
                        <CardDescription>
                          For {generatedFeedback.studentName} - {generatedFeedback.subject}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{generatedFeedback.confidence}% Confidence</Badge>
                        <Button variant="outline" onClick={exportFeedback}>
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Score Summary */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {generatedFeedback.score}/{generatedFeedback.maxScore}
                        </div>
                        <div className="text-sm text-blue-800">Overall Score</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold text-blue-600">{generatedFeedback.grade}</div>
                        <div className="text-sm text-blue-800">Grade</div>
                      </div>
                    </div>

                    {/* Overall Feedback */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Overall Feedback
                      </h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-800">{generatedFeedback.overallFeedback}</p>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        Strengths
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {generatedFeedback.strengths.map((strength, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                            <Star className="h-4 w-4 text-green-600" />
                            <span className="text-green-800 text-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Areas for Improvement */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-700">
                        <AlertCircle className="h-4 w-4" />
                        Areas for Improvement
                      </h4>
                      <div className="space-y-2">
                        {generatedFeedback.improvements.map((improvement, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 rounded">
                            <TrendingUp className="h-4 w-4 text-orange-600 mt-0.5" />
                            <span className="text-orange-800 text-sm">{improvement}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-700">
                        <Lightbulb className="h-4 w-4" />
                        Suggestions
                      </h4>
                      <div className="space-y-2">
                        {generatedFeedback.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-purple-50 rounded">
                            <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5" />
                            <span className="text-purple-800 text-sm">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
                        <BookOpen className="h-4 w-4" />
                        Next Steps
                      </h4>
                      <div className="space-y-2">
                        {generatedFeedback.nextSteps.map((step, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-blue-800 text-sm">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Feedback Rating */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Was this feedback helpful?</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Yes
                          </Button>
                          <Button variant="outline" size="sm">
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            No
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!generatedFeedback && !isGenerating && (
                <Card>
                  <CardContent className="p-8">
                    <div className="text-center space-y-4">
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-600">No Feedback Generated</h3>
                        <p className="text-gray-500">Select an evaluation and click "Generate AI Feedback" to start</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbackTypes.map((template) => (
              <Card key={template.value} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.label}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <strong>Best for:</strong> Students who need {template.value} guidance
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">Template</Badge>
                      <Button variant="outline" size="sm">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1,247</div>
                  <div className="text-sm text-gray-600">Feedback Generated</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">94.2%</div>
                  <div className="text-sm text-gray-600">Positive Rating</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">2.3s</div>
                  <div className="text-sm text-gray-600">Avg Generation Time</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">89%</div>
                  <div className="text-sm text-gray-600">Student Engagement</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feedback Effectiveness Over Time</CardTitle>
              <CardDescription>Track how feedback quality improves with AI learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                  <p>Analytics chart would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
