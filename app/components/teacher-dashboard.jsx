"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Upload, Settings, FileText, Edit, Trash2, Eye } from "lucide-react"

export default function TeacherDashboard() {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "Explain the concept of photosynthesis and its importance in the ecosystem.",
      subject: "Biology",
      marks: 20,
      keywords: ["photosynthesis", "chlorophyll", "sunlight", "carbon dioxide", "oxygen"],
      modelAnswer:
        "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll...",
      rubric:
        "Award 5 marks for definition, 5 marks for process explanation, 5 marks for importance, 5 marks for examples",
    },
    {
      id: 2,
      question: "Solve: 2x + 5 = 15. Show your working.",
      subject: "Mathematics",
      marks: 15,
      keywords: ["equation", "solve", "working", "steps"],
      modelAnswer: "2x + 5 = 15\n2x = 15 - 5\n2x = 10\nx = 5",
      rubric: "Award 3 marks for correct method, 7 marks for working steps, 5 marks for correct answer",
    },
  ])

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    subject: "",
    marks: "",
    keywords: "",
    modelAnswer: "",
    rubric: "",
  })

  const [evaluationSettings, setEvaluationSettings] = useState({
    strictness: "medium",
    feedbackTone: "supportive",
    includeGrammarCheck: true,
    plagiarismCheck: true,
  })

  const handleAddQuestion = () => {
    if (newQuestion.question && newQuestion.subject && newQuestion.marks) {
      const question = {
        id: questions.length + 1,
        ...newQuestion,
        marks: Number.parseInt(newQuestion.marks),
        keywords: newQuestion.keywords.split(",").map((k) => k.trim()),
      }
      setQuestions([...questions, question])
      setNewQuestion({
        question: "",
        subject: "",
        marks: "",
        keywords: "",
        modelAnswer: "",
        rubric: "",
      })
    }
  }

  const handleDeleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h2>
        <p className="text-gray-600">Manage questions, rubrics, and evaluation settings</p>
      </div>

      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="questions">Questions & Rubrics</TabsTrigger>
          <TabsTrigger value="settings">Evaluation Settings</TabsTrigger>
          <TabsTrigger value="analytics">Class Analytics</TabsTrigger>
          <TabsTrigger value="reviews">Manual Reviews</TabsTrigger>
        </TabsList>

        {/* Questions & Rubrics Tab */}
        <TabsContent value="questions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add New Question */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Question
                </CardTitle>
                <CardDescription>Create questions with model answers and marking rubrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="question">Question *</Label>
                  <Textarea
                    id="question"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    placeholder="Enter the question..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Select
                      value={newQuestion.subject}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, subject: value })}
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
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="marks">Max Marks *</Label>
                    <Input
                      id="marks"
                      type="number"
                      value={newQuestion.marks}
                      onChange={(e) => setNewQuestion({ ...newQuestion, marks: e.target.value })}
                      placeholder="20"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="keywords">Key Words (comma separated)</Label>
                  <Input
                    id="keywords"
                    value={newQuestion.keywords}
                    onChange={(e) => setNewQuestion({ ...newQuestion, keywords: e.target.value })}
                    placeholder="photosynthesis, chlorophyll, sunlight"
                  />
                </div>

                <div>
                  <Label htmlFor="modelAnswer">Model Answer</Label>
                  <Textarea
                    id="modelAnswer"
                    value={newQuestion.modelAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, modelAnswer: e.target.value })}
                    placeholder="Enter the ideal answer..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="rubric">Marking Rubric</Label>
                  <Textarea
                    id="rubric"
                    value={newQuestion.rubric}
                    onChange={(e) => setNewQuestion({ ...newQuestion, rubric: e.target.value })}
                    placeholder="Award marks for: definition (5), explanation (10), examples (5)"
                    rows={3}
                  />
                </div>

                <Button onClick={handleAddQuestion} className="w-full">
                  Add Question
                </Button>
              </CardContent>
            </Card>

            {/* Upload Question Paper */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Question Paper
                </CardTitle>
                <CardDescription>Upload existing question papers with answer keys</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drop your question paper here</p>
                  <p className="text-sm text-gray-500 mb-4">Supports PDF, DOC, DOCX files</p>
                  <Button variant="outline">Choose File</Button>
                </div>

                <Separator />

                <div>
                  <Label>Upload Answer Key (Optional)</Label>
                  <Input type="file" accept=".pdf,.doc,.docx" className="mt-1" />
                </div>

                <Button className="w-full">Process Question Paper</Button>
              </CardContent>
            </Card>
          </div>

          {/* Existing Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Question Bank ({questions.length} questions)</CardTitle>
              <CardDescription>Manage your existing questions and rubrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{question.question}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{question.subject}</Badge>
                          <Badge variant="outline">{question.marks} marks</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteQuestion(question.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Keywords:</strong> {question.keywords.join(", ")}
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Rubric:</strong> {question.rubric}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluation Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI Evaluation Settings
              </CardTitle>
              <CardDescription>Configure how the AI evaluates answer sheets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="strictness">Evaluation Strictness</Label>
                  <Select
                    value={evaluationSettings.strictness}
                    onValueChange={(value) => setEvaluationSettings({ ...evaluationSettings, strictness: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lenient">Lenient - More forgiving</SelectItem>
                      <SelectItem value="medium">Medium - Balanced approach</SelectItem>
                      <SelectItem value="strict">Strict - High standards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="feedbackTone">Feedback Tone</Label>
                  <Select
                    value={evaluationSettings.feedbackTone}
                    onValueChange={(value) => setEvaluationSettings({ ...evaluationSettings, feedbackTone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supportive">Supportive & Encouraging</SelectItem>
                      <SelectItem value="neutral">Neutral & Professional</SelectItem>
                      <SelectItem value="direct">Direct & Concise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Grammar & Language Check</Label>
                    <p className="text-sm text-gray-600">Include grammar evaluation in scoring</p>
                  </div>
                  <Button
                    variant={evaluationSettings.includeGrammarCheck ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setEvaluationSettings({
                        ...evaluationSettings,
                        includeGrammarCheck: !evaluationSettings.includeGrammarCheck,
                      })
                    }
                  >
                    {evaluationSettings.includeGrammarCheck ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Plagiarism Detection</Label>
                    <p className="text-sm text-gray-600">Check for copied content</p>
                  </div>
                  <Button
                    variant={evaluationSettings.plagiarismCheck ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setEvaluationSettings({
                        ...evaluationSettings,
                        plagiarismCheck: !evaluationSettings.plagiarismCheck,
                      })
                    }
                  >
                    {evaluationSettings.plagiarismCheck ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>

              <Button className="w-full">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Class Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Evaluations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">247</div>
                <p className="text-sm text-gray-600">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">78%</div>
                <p className="text-sm text-gray-600">Class average</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">45h</div>
                <p className="text-sm text-gray-600">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Mathematics", "Physics", "Chemistry", "Biology", "English"].map((subject) => (
                  <div key={subject} className="flex items-center justify-between">
                    <span className="font-medium">{subject}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.random() * 40 + 60}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{Math.floor(Math.random() * 20 + 70)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pending Manual Reviews
              </CardTitle>
              <CardDescription>Answer sheets that need teacher review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">John Doe - Mathematics Quiz</h4>
                      <p className="text-sm text-gray-600">AI Confidence: 65% • Needs Review</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                      <Button variant="outline" size="sm">
                        Approve AI Score
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
