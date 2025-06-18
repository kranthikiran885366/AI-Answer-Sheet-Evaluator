"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Share,
  RotateCcw,
  FileText,
  Printer,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
} from "lucide-react"

interface EvaluationResultsProps {
  data: any
}

export function EvaluationResults({ data }: EvaluationResultsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [feedbackRatings, setFeedbackRatings] = useState<Record<number, "helpful" | "unhelpful" | null>>({})

  if (!data) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No evaluation results to display. Please upload an answer sheet first.
          </p>
        </CardContent>
      </Card>
    )
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-500 text-white"
      case "B+":
      case "B":
        return "bg-blue-500 text-white"
      case "C+":
      case "C":
        return "bg-yellow-500 text-white"
      default:
        return "bg-red-500 text-white"
    }
  }

  const rateFeedback = (questionId: number, rating: "helpful" | "unhelpful") => {
    setFeedbackRatings((prev) => ({
      ...prev,
      [questionId]: rating,
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Evaluation Results</h2>
        <p className="text-muted-foreground">AI-powered assessment with detailed feedback</p>
      </div>

      {/* Summary Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-muted/50">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{data.studentName}</CardTitle>
              <CardDescription className="text-base">
                {data.subject} • {data.examType} • {data.evaluationDate}
              </CardDescription>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full font-semibold ${getGradeColor(data.grade)}`}
              >
                Grade: {data.grade}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{data.obtainedMarks}</div>
              <div className="text-sm text-muted-foreground">out of {data.totalMarks}</div>
              <div className="text-xs text-muted-foreground">Total Marks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{data.percentage}%</div>
              <div className="text-xs text-muted-foreground">Percentage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{data.confidenceScore}%</div>
              <div className="text-xs text-muted-foreground">AI Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{data.questions.length}</div>
              <div className="text-xs text-muted-foreground">Questions</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Performance</span>
              <span>{data.percentage}%</span>
            </div>
            <Progress value={data.percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Share className="h-4 w-4" />
          Share Results
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Report
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Resubmit Answer
        </Button>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {data.strengths.map((strength: string, idx: number) => (
                      <li key={idx} className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-1">
                    {data.improvements.map((improvement: string, idx: number) => (
                      <li key={idx} className="text-sm text-orange-600 flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Overall Feedback</h4>
                <Alert>
                  <AlertDescription>{data.overallFeedback}</AlertDescription>
                </Alert>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Question Performance</h4>
                <div className="space-y-3">
                  {data.questions.map((question: any) => (
                    <div key={question.id} className="flex items-center gap-4">
                      <div className="w-8 text-center">
                        <span className="text-sm font-medium">Q{question.id}</span>
                      </div>
                      <div className="flex-1">
                        <Progress value={(question.obtainedMarks / question.maxMarks) * 100} className="h-2" />
                      </div>
                      <div className="w-16 text-right">
                        <span className="text-sm font-medium">
                          {question.obtainedMarks}/{question.maxMarks}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Analysis Tab */}
        <TabsContent value="detailed" className="space-y-4 pt-4">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Question-wise Analysis</h3>
            {data.questions.map((question: any, index: number) => (
              <Card key={question.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    <Badge variant={question.obtainedMarks === question.maxMarks ? "default" : "secondary"}>
                      {question.obtainedMarks}/{question.maxMarks} marks
                    </Badge>
                  </div>
                  <CardDescription className="text-base font-medium">{question.question}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Student Answer */}
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">Your Answer:</h4>
                    <div className="bg-muted p-3 rounded-lg border">
                      <p className="whitespace-pre-line text-sm">{question.studentAnswer}</p>
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">AI Teacher Feedback:</h4>
                    <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg border border-blue-200 dark:border-blue-900">
                      <p className="text-sm text-blue-800 dark:text-blue-300">{question.feedback}</p>
                    </div>
                  </div>

                  {/* Key Points Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-green-700 dark:text-green-500 mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Points Covered
                      </h4>
                      <ul className="space-y-1">
                        {question.keyPointsCovered.map((point: string, idx: number) => (
                          <li key={idx} className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                            <CheckCircle className="h-3 w-3" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-red-700 dark:text-red-500 mb-2 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Points Missed
                      </h4>
                      <ul className="space-y-1">
                        {question.keyPointsMissed.map((point: string, idx: number) => (
                          <li key={idx} className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <XCircle className="h-3 w-3" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h4 className="font-semibold text-sm text-purple-700 dark:text-purple-500 mb-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Suggestions for Improvement
                    </h4>
                    <div className="bg-purple-50 dark:bg-purple-950/50 p-3 rounded-lg border border-purple-200 dark:border-purple-900">
                      <p className="text-sm text-purple-800 dark:text-purple-300">{question.suggestions}</p>
                    </div>
                  </div>

                  {/* Progress Bar for this question */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Question Score</span>
                      <span>{Math.round((question.obtainedMarks / question.maxMarks) * 100)}%</span>
                    </div>
                    <Progress value={(question.obtainedMarks / question.maxMarks) * 100} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Was this feedback helpful?</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={feedbackRatings[question.id] === "helpful" ? "text-green-600" : ""}
                      onClick={() => rateFeedback(question.id, "helpful")}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Yes
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={feedbackRatings[question.id] === "unhelpful" ? "text-red-600" : ""}
                      onClick={() => rateFeedback(question.id, "unhelpful")}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      No
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Ask for clarification
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Improvement Plan</CardTitle>
              <CardDescription>Personalized recommendations based on your performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  {data.overallFeedback}
                </AlertDescription>
              </Alert>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="strengths">
                  <AccordionTrigger className="text-green-700 dark:text-green-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Your Strengths
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {data.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium">{strength}</p>
                            <p className="text-sm text-muted-foreground">
                              Continue to build on this strength in future assignments.
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="improvements">
                  <AccordionTrigger className="text-orange-700 dark:text-orange-500">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Areas for Improvement
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {data.improvements.map((improvement: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                          <div>
                            <p className="font-medium">{improvement}</p>
                            <p className="text-sm text-muted-foreground">
                              Focus on this area to improve your overall performance.
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="resources">
                  <AccordionTrigger className="text-blue-700 dark:text-blue-500">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Recommended Resources
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <BookIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Chapter 4: Advanced Concepts</p>
                          <p className="text-sm text-muted-foreground">
                            Review this chapter to strengthen your understanding of key concepts.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <LinkIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Online Practice Exercises</p>
                          <p className="text-sm text-muted-foreground">
                            Complete these exercises to reinforce your learning.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <VideoIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Video Tutorials</p>
                          <p className="text-sm text-muted-foreground">
                            Watch these tutorials for visual explanations of difficult concepts.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold mb-2">Next Steps</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                      1
                    </div>
                    <p>Review the detailed feedback for each question</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                      2
                    </div>
                    <p>Focus on improving the areas highlighted in the feedback</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                      3
                    </div>
                    <p>Practice similar questions to reinforce your learning</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                      4
                    </div>
                    <p>Schedule a follow-up with your teacher if needed</p>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}

function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function VideoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  )
}
