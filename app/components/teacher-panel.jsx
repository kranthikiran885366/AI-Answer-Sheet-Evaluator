"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, Eye, Edit, Trash2, Upload } from "lucide-react"

export default function TeacherPanel() {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "Explain the process of photosynthesis and its significance in the ecosystem.",
      subject: "Biology",
      marks: 20,
      keywords: ["photosynthesis", "chlorophyll", "sunlight", "carbon dioxide", "oxygen"],
      modelAnswer: "Photosynthesis is the process by which green plants convert light energy into chemical energy...",
      rubric: "Award 5 marks for definition, 5 marks for process, 5 marks for significance, 5 marks for examples",
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

  const handleAddQuestion = async () => {
    if (!newQuestion.question || !newQuestion.subject || !newQuestion.marks) return

    try {
      const response = await fetch("http://localhost:8000/api/add-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newQuestion,
          marks: Number.parseInt(newQuestion.marks),
          keywords: newQuestion.keywords.split(",").map((k) => k.trim()),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setQuestions([...questions, result])
        setNewQuestion({ question: "", subject: "", marks: "", keywords: "", modelAnswer: "", rubric: "" })
      }
    } catch (error) {
      console.error("Failed to add question:", error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          Teacher Control Panel
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Manage questions, rubrics, and evaluation settings in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add New Question */}
        <Card className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-500" />
              Add New Question
            </CardTitle>
            <CardDescription>Create questions with AI-powered evaluation criteria</CardDescription>
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
                className="bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subject *</Label>
                <Select
                  value={newQuestion.subject}
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, subject: value })}
                >
                  <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
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
                <Label>Max Marks *</Label>
                <Input
                  type="number"
                  value={newQuestion.marks}
                  onChange={(e) => setNewQuestion({ ...newQuestion, marks: e.target.value })}
                  placeholder="20"
                  className="bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50"
                />
              </div>
            </div>

            <div>
              <Label>Keywords (comma separated)</Label>
              <Input
                value={newQuestion.keywords}
                onChange={(e) => setNewQuestion({ ...newQuestion, keywords: e.target.value })}
                placeholder="photosynthesis, chlorophyll, sunlight"
                className="bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50"
              />
            </div>

            <div>
              <Label>Model Answer</Label>
              <Textarea
                value={newQuestion.modelAnswer}
                onChange={(e) => setNewQuestion({ ...newQuestion, modelAnswer: e.target.value })}
                placeholder="Enter the ideal answer..."
                rows={4}
                className="bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50"
              />
            </div>

            <div>
              <Label>Marking Rubric</Label>
              <Textarea
                value={newQuestion.rubric}
                onChange={(e) => setNewQuestion({ ...newQuestion, rubric: e.target.value })}
                placeholder="Award marks for: definition (5), explanation (10), examples (5)"
                rows={3}
                className="bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50"
              />
            </div>

            <Button
              onClick={handleAddQuestion}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              Add Question
            </Button>
          </CardContent>
        </Card>

        {/* Upload Question Paper */}
        <Card className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              Bulk Upload
            </CardTitle>
            <CardDescription>Upload question papers and answer keys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">Drop your question paper here</p>
              <p className="text-sm text-slate-500 mb-4">Supports PDF, DOC, DOCX files</p>
              <Button variant="outline" className="bg-white/50 dark:bg-slate-800/50">
                Choose File
              </Button>
            </div>

            <div>
              <Label>Upload Answer Key (Optional)</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                className="mt-1 bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50"
              />
            </div>

            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
              Process Question Paper
            </Button>

            {/* AI Settings */}
            <div className="space-y-4 pt-4 border-t border-white/20 dark:border-slate-700/50">
              <h4 className="font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                AI Evaluation Settings
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Strictness Level</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lenient">Lenient</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="strict">Strict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Feedback Tone</Label>
                  <Select defaultValue="supportive">
                    <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-slate-700/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supportive">Supportive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Bank */}
      <Card className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 shadow-2xl">
        <CardHeader>
          <CardTitle>Question Bank ({questions.length} questions)</CardTitle>
          <CardDescription>Manage your question repository</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="border border-white/20 dark:border-slate-700/50 rounded-xl p-6 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">{question.question}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      >
                        {question.subject}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                      >
                        {question.marks} marks
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white/50 dark:bg-slate-800/50">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white/50 dark:bg-slate-800/50">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/50 dark:bg-slate-800/50 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  <strong>Keywords:</strong> {question.keywords.join(", ")}
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Rubric:</strong> {question.rubric}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
