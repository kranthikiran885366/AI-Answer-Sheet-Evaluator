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
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  FileText,
  Target,
  CheckCircle,
  BookOpen,
  Calculator,
  PenTool,
  Lightbulb,
  Download,
  Upload,
  Eye,
} from "lucide-react"

interface RubricCriterion {
  id: string
  name: string
  description: string
  maxPoints: number
  keywords: string[]
  weight: number
  levels: {
    excellent: { points: number; description: string }
    good: { points: number; description: string }
    satisfactory: { points: number; description: string }
    needsImprovement: { points: number; description: string }
  }
}

interface Rubric {
  id: string
  name: string
  subject: string
  questionType: string
  totalPoints: number
  criteria: RubricCriterion[]
  stepMarking: boolean
  partialCredit: boolean
  created: string
  lastModified: string
}

interface RubricManagementProps {
  userRole: "admin" | "teacher" | "student" | null
}

export function RubricManagement({ userRole }: RubricManagementProps) {
  const [activeTab, setActiveTab] = useState("create")
  const [rubrics, setRubrics] = useState<Rubric[]>([
    {
      id: "rubric-1",
      name: "Photosynthesis Essay Rubric",
      subject: "Biology",
      questionType: "Essay",
      totalPoints: 20,
      stepMarking: false,
      partialCredit: true,
      created: "2024-01-15",
      lastModified: "2024-01-20",
      criteria: [
        {
          id: "crit-1",
          name: "Definition & Process",
          description: "Understanding of photosynthesis definition and basic process",
          maxPoints: 5,
          keywords: ["photosynthesis", "process", "definition", "plants"],
          weight: 25,
          levels: {
            excellent: { points: 5, description: "Clear, accurate definition with detailed process explanation" },
            good: { points: 4, description: "Good definition with adequate process explanation" },
            satisfactory: { points: 3, description: "Basic definition with minimal process details" },
            needsImprovement: { points: 1, description: "Unclear or incorrect definition" },
          },
        },
        {
          id: "crit-2",
          name: "Reactants & Products",
          description: "Identification of reactants and products",
          maxPoints: 5,
          keywords: ["carbon dioxide", "water", "sunlight", "glucose", "oxygen"],
          weight: 25,
          levels: {
            excellent: { points: 5, description: "All reactants and products correctly identified" },
            good: { points: 4, description: "Most reactants and products identified" },
            satisfactory: { points: 3, description: "Some reactants and products identified" },
            needsImprovement: { points: 1, description: "Few or incorrect reactants/products" },
          },
        },
      ],
    },
  ])

  const [currentRubric, setCurrentRubric] = useState<Partial<Rubric>>({
    name: "",
    subject: "",
    questionType: "",
    stepMarking: false,
    partialCredit: true,
    criteria: [],
  })

  const [newCriterion, setNewCriterion] = useState<Partial<RubricCriterion>>({
    name: "",
    description: "",
    maxPoints: 5,
    keywords: [],
    weight: 25,
    levels: {
      excellent: { points: 5, description: "" },
      good: { points: 4, description: "" },
      satisfactory: { points: 3, description: "" },
      needsImprovement: { points: 1, description: "" },
    },
  })

  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography"]
  const questionTypes = ["Short Answer", "Essay", "Mathematical Problem", "Numerical", "Definition", "Explanation"]

  const addCriterion = () => {
    if (!newCriterion.name || !newCriterion.description) return

    const criterion: RubricCriterion = {
      id: `crit-${Date.now()}`,
      name: newCriterion.name!,
      description: newCriterion.description!,
      maxPoints: newCriterion.maxPoints || 5,
      keywords: newCriterion.keywords || [],
      weight: newCriterion.weight || 25,
      levels: newCriterion.levels!,
    }

    setCurrentRubric((prev) => ({
      ...prev,
      criteria: [...(prev.criteria || []), criterion],
    }))

    // Reset form
    setNewCriterion({
      name: "",
      description: "",
      maxPoints: 5,
      keywords: [],
      weight: 25,
      levels: {
        excellent: { points: 5, description: "" },
        good: { points: 4, description: "" },
        satisfactory: { points: 3, description: "" },
        needsImprovement: { points: 1, description: "" },
      },
    })
  }

  const saveRubric = () => {
    if (!currentRubric.name || !currentRubric.subject || !currentRubric.criteria?.length) return

    const totalPoints = currentRubric.criteria.reduce((sum, criterion) => sum + criterion.maxPoints, 0)

    const rubric: Rubric = {
      id: `rubric-${Date.now()}`,
      name: currentRubric.name,
      subject: currentRubric.subject,
      questionType: currentRubric.questionType || "Essay",
      totalPoints,
      stepMarking: currentRubric.stepMarking || false,
      partialCredit: currentRubric.partialCredit || true,
      criteria: currentRubric.criteria,
      created: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
    }

    setRubrics((prev) => [...prev, rubric])

    // Reset form
    setCurrentRubric({
      name: "",
      subject: "",
      questionType: "",
      stepMarking: false,
      partialCredit: true,
      criteria: [],
    })

    setActiveTab("manage")
  }

  const deleteRubric = (id: string) => {
    setRubrics((prev) => prev.filter((rubric) => rubric.id !== id))
  }

  const duplicateRubric = (rubric: Rubric) => {
    const duplicated: Rubric = {
      ...rubric,
      id: `rubric-${Date.now()}`,
      name: `${rubric.name} (Copy)`,
      created: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
    }
    setRubrics((prev) => [...prev, duplicated])
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "Mathematical Problem":
        return <Calculator className="h-4 w-4" />
      case "Essay":
        return <FileText className="h-4 w-4" />
      case "Short Answer":
        return <PenTool className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "Mathematical Problem":
        return "bg-blue-100 text-blue-800"
      case "Essay":
        return "bg-green-100 text-green-800"
      case "Short Answer":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Rubric Management System</h2>
        <p className="text-gray-600">Create and manage custom scoring rubrics with step-by-step marking</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create Rubric</TabsTrigger>
          <TabsTrigger value="manage">Manage Rubrics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Create Rubric Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Rubric Creation Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Rubric Information
                  </CardTitle>
                  <CardDescription>Define the basic properties of your rubric</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rubric-name">Rubric Name *</Label>
                      <Input
                        id="rubric-name"
                        value={currentRubric.name || ""}
                        onChange={(e) => setCurrentRubric((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Photosynthesis Essay Rubric"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Select
                        value={currentRubric.subject || ""}
                        onValueChange={(value) => setCurrentRubric((prev) => ({ ...prev, subject: value }))}
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="question-type">Question Type</Label>
                      <Select
                        value={currentRubric.questionType || ""}
                        onValueChange={(value) => setCurrentRubric((prev) => ({ ...prev, questionType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="step-marking"
                          checked={currentRubric.stepMarking || false}
                          onCheckedChange={(checked) => setCurrentRubric((prev) => ({ ...prev, stepMarking: checked }))}
                        />
                        <Label htmlFor="step-marking">Step-by-step marking</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="partial-credit"
                          checked={currentRubric.partialCredit || false}
                          onCheckedChange={(checked) =>
                            setCurrentRubric((prev) => ({ ...prev, partialCredit: checked }))
                          }
                        />
                        <Label htmlFor="partial-credit">Allow partial credit</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Criterion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Evaluation Criterion
                  </CardTitle>
                  <CardDescription>Define specific criteria for evaluation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="criterion-name">Criterion Name *</Label>
                      <Input
                        id="criterion-name"
                        value={newCriterion.name || ""}
                        onChange={(e) => setNewCriterion((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Definition & Process"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-points">Maximum Points</Label>
                      <Input
                        id="max-points"
                        type="number"
                        value={newCriterion.maxPoints || 5}
                        onChange={(e) =>
                          setNewCriterion((prev) => ({ ...prev, maxPoints: Number.parseInt(e.target.value) || 5 }))
                        }
                        min="1"
                        max="20"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="criterion-description">Description</Label>
                    <Textarea
                      id="criterion-description"
                      value={newCriterion.description || ""}
                      onChange={(e) => setNewCriterion((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this criterion evaluates..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                    <Input
                      id="keywords"
                      value={newCriterion.keywords?.join(", ") || ""}
                      onChange={(e) =>
                        setNewCriterion((prev) => ({
                          ...prev,
                          keywords: e.target.value
                            .split(",")
                            .map((k) => k.trim())
                            .filter((k) => k),
                        }))
                      }
                      placeholder="e.g., photosynthesis, process, definition"
                    />
                  </div>

                  {/* Performance Levels */}
                  <div className="space-y-4">
                    <Label>Performance Levels</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(newCriterion.levels || {}).map(([level, data]) => (
                        <div key={level} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="capitalize font-medium">{level.replace(/([A-Z])/g, " $1")}</Label>
                            <Input
                              type="number"
                              value={data.points}
                              onChange={(e) =>
                                setNewCriterion((prev) => ({
                                  ...prev,
                                  levels: {
                                    ...prev.levels!,
                                    [level]: { ...data, points: Number.parseInt(e.target.value) || 0 },
                                  },
                                }))
                              }
                              className="w-16"
                              min="0"
                              max={newCriterion.maxPoints || 5}
                            />
                          </div>
                          <Textarea
                            value={data.description}
                            onChange={(e) =>
                              setNewCriterion((prev) => ({
                                ...prev,
                                levels: {
                                  ...prev.levels!,
                                  [level]: { ...data, description: e.target.value },
                                },
                              }))
                            }
                            placeholder={`Describe ${level} performance...`}
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={addCriterion} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Criterion
                  </Button>
                </CardContent>
              </Card>

              {/* Current Criteria */}
              {currentRubric.criteria && currentRubric.criteria.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Current Criteria ({currentRubric.criteria.length})</CardTitle>
                    <CardDescription>
                      Total Points: {currentRubric.criteria.reduce((sum, c) => sum + c.maxPoints, 0)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentRubric.criteria.map((criterion, index) => (
                        <div key={criterion.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{criterion.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{criterion.maxPoints} pts</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newCriteria = [...currentRubric.criteria!]
                                  newCriteria.splice(index, 1)
                                  setCurrentRubric((prev) => ({ ...prev, criteria: newCriteria }))
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{criterion.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {criterion.keywords.map((keyword, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <Button onClick={saveRubric} className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save Rubric
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Preview Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Rubric Preview
                  </CardTitle>
                  <CardDescription>Live preview of your rubric</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentRubric.name ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg">{currentRubric.name}</h3>
                        <p className="text-sm text-gray-600">
                          {currentRubric.subject} - {currentRubric.questionType}
                        </p>
                      </div>

                      {currentRubric.criteria && currentRubric.criteria.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-sm font-semibold">
                            Total Points: {currentRubric.criteria.reduce((sum, c) => sum + c.maxPoints, 0)}
                          </div>
                          {currentRubric.criteria.map((criterion) => (
                            <div key={criterion.id} className="border rounded p-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-sm">{criterion.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {criterion.maxPoints} pts
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600">{criterion.description}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {currentRubric.stepMarking && <Badge variant="secondary">Step Marking</Badge>}
                        {currentRubric.partialCredit && <Badge variant="secondary">Partial Credit</Badge>}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Start creating your rubric to see preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Use specific keywords for better AI matching</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Define clear performance levels</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Enable step marking for math problems</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Use partial credit for complex answers</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Manage Rubrics Tab */}
        <TabsContent value="manage" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Saved Rubrics ({rubrics.length})</h3>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rubrics.map((rubric) => (
              <Card key={rubric.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{rubric.name}</h4>
                      <p className="text-sm text-gray-600">{rubric.subject}</p>
                    </div>
                    <Badge variant="outline" className={getQuestionTypeColor(rubric.questionType)}>
                      <div className="flex items-center gap-1">
                        {getQuestionTypeIcon(rubric.questionType)}
                        <span className="text-xs">{rubric.questionType}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Points:</span>
                      <div className="font-semibold">{rubric.totalPoints}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Criteria:</span>
                      <div className="font-semibold">{rubric.criteria.length}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {rubric.stepMarking && (
                      <Badge variant="secondary" className="text-xs">
                        Step Marking
                      </Badge>
                    )}
                    {rubric.partialCredit && (
                      <Badge variant="secondary" className="text-xs">
                        Partial Credit
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    <div>Created: {rubric.created}</div>
                    <div>Modified: {rubric.lastModified}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => duplicateRubric(rubric)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteRubric(rubric.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Rubric Templates</AlertTitle>
            <AlertDescription>Pre-built rubrics for common question types and subjects</AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Essay Writing Rubric", subject: "English", type: "Essay", criteria: 4 },
              { name: "Math Problem Solving", subject: "Mathematics", type: "Mathematical Problem", criteria: 3 },
              { name: "Science Explanation", subject: "Physics", type: "Explanation", criteria: 5 },
              { name: "Short Answer Template", subject: "General", type: "Short Answer", criteria: 2 },
              { name: "Definition Template", subject: "General", type: "Definition", criteria: 3 },
              { name: "Numerical Problem", subject: "Mathematics", type: "Numerical", criteria: 4 },
            ].map((template, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{template.name}</h4>
                    <Badge variant="outline" className={getQuestionTypeColor(template.type)}>
                      {getQuestionTypeIcon(template.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Criteria: </span>
                      <span className="font-semibold">{template.criteria}</span>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      Use Template
                    </Button>
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
                  <div className="text-3xl font-bold text-blue-600">{rubrics.length}</div>
                  <div className="text-sm text-gray-600">Total Rubrics</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {rubrics.reduce((sum, r) => sum + r.criteria.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Criteria</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round(rubrics.reduce((sum, r) => sum + r.totalPoints, 0) / rubrics.length) || 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg Points</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">
                    {new Set(rubrics.map((r) => r.subject)).size}
                  </div>
                  <div className="text-sm text-gray-600">Subjects</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rubric Usage by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjects.map((subject) => {
                  const count = rubrics.filter((r) => r.subject === subject).length
                  const percentage = rubrics.length > 0 ? (count / rubrics.length) * 100 : 0

                  return (
                    <div key={subject} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{subject}</span>
                        <span>
                          {count} rubrics ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
