"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Brain,
  Zap,
  CheckCircle,
  Settings,
  Target,
  TrendingUp,
  MessageSquare,
  Award,
  BarChart3,
  Lightbulb,
  BookOpen,
  Calculator,
  PenTool,
  FileText,
} from "lucide-react"

interface EvaluationResult {
  id: string
  studentAnswer: string
  modelAnswer: string
  score: number
  maxScore: number
  percentage: number
  grade: string
  confidence: number
  evaluationMethod: string
  processingTime: number
  feedback: {
    overall: string
    strengths: string[]
    improvements: string[]
    suggestions: string[]
  }
  rubricBreakdown: {
    [criterion: string]: {
      score: number
      maxScore: number
      feedback: string
    }
  }
  conceptAnalysis: {
    covered: string[]
    missed: string[]
    partial: string[]
  }
  semanticSimilarity: number
  grammarScore?: number
  structureScore: number
}

export function AIEvaluationEngine() {
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [currentStep, setCurrentStep] = useState("")
  const [progress, setProgress] = useState(0)
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([])
  const [selectedModel, setSelectedModel] = useState("multi-model-consensus")
  const [evaluationSettings, setEvaluationSettings] = useState({
    semanticAnalysis: true,
    conceptMapping: true,
    grammarCheck: true,
    structureAnalysis: true,
    rubricBased: true,
    comparativeAnalysis: true,
    biasDetection: true,
    explainableAI: true,
    strictnessLevel: 70,
    creativityWeight: 30,
    accuracyWeight: 70,
  })

  const aiModels = [
    {
      id: "gpt-4",
      name: "GPT-4 Turbo",
      accuracy: 96,
      speed: "Medium",
      specialty: "General evaluation",
      provider: "OpenAI",
    },
    {
      id: "claude-3",
      name: "Claude 3 Opus",
      accuracy: 95,
      speed: "Medium",
      specialty: "Detailed analysis",
      provider: "Anthropic",
    },
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      accuracy: 94,
      speed: "Fast",
      specialty: "Multi-modal",
      provider: "Google",
    },
    {
      id: "bert-large",
      name: "BERT Large",
      accuracy: 89,
      speed: "Fast",
      specialty: "Semantic similarity",
      provider: "Local",
    },
    {
      id: "custom-evaluator",
      name: "Custom Evaluator",
      accuracy: 92,
      speed: "Fast",
      specialty: "Subject-specific",
      provider: "Local",
    },
    {
      id: "multi-model-consensus",
      name: "Multi-Model Consensus",
      accuracy: 98,
      speed: "Slow",
      specialty: "Highest accuracy",
      provider: "Ensemble",
    },
  ]

  const evaluationSteps = [
    { name: "Text Preprocessing", description: "Cleaning and normalizing text" },
    { name: "Semantic Analysis", description: "Understanding meaning and context" },
    { name: "Concept Mapping", description: "Identifying key concepts" },
    { name: "Model Answer Comparison", description: "Comparing with reference answers" },
    { name: "Rubric Application", description: "Applying scoring rubrics" },
    { name: "Grammar Analysis", description: "Checking language quality" },
    { name: "Structure Evaluation", description: "Assessing answer organization" },
    { name: "Bias Detection", description: "Checking for evaluation bias" },
    { name: "Confidence Calculation", description: "Computing confidence scores" },
    { name: "Feedback Generation", description: "Creating personalized feedback" },
    { name: "Quality Assurance", description: "Validating results" },
    { name: "Report Generation", description: "Finalizing evaluation report" },
  ]

  const startEvaluation = async () => {
    setIsEvaluating(true)
    setProgress(0)
    setEvaluationResults([])

    try {
      for (let i = 0; i < evaluationSteps.length; i++) {
        const step = evaluationSteps[i]
        setCurrentStep(step.description)

        // Simulate processing time based on step complexity
        const stepDuration = step.name.includes("Multi-Model")
          ? 4000
          : step.name.includes("Semantic")
            ? 3000
            : step.name.includes("Concept")
              ? 2500
              : 1500

        await new Promise((resolve) => setTimeout(resolve, stepDuration))
        setProgress(((i + 1) / evaluationSteps.length) * 100)
      }

      // Generate mock evaluation results
      const mockResults: EvaluationResult[] = [
        {
          id: "eval-1",
          studentAnswer:
            "Photosynthesis is the process by which plants make food using sunlight, water, and carbon dioxide. It produces oxygen which is important for all living things. Plants use chlorophyll to capture light energy and convert it into chemical energy.",
          modelAnswer:
            "Photosynthesis is the biological process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. During this process, plants convert carbon dioxide from the air and water from the soil into glucose using light energy. Oxygen is released as a byproduct. The process occurs in two main stages: light-dependent reactions (in thylakoids) and light-independent reactions (Calvin cycle in stroma). This process is crucial for life on Earth as it produces oxygen for respiration and serves as the primary source of energy for most ecosystems.",
          score: 16,
          maxScore: 20,
          percentage: 80,
          grade: "B+",
          confidence: 94.5,
          evaluationMethod: "Multi-Model Consensus",
          processingTime: 3.2,
          feedback: {
            overall:
              "Good understanding of photosynthesis demonstrated. You correctly identified the key components and mentioned chlorophyll's role. However, your answer could be more comprehensive by including the two stages of photosynthesis and more details about the chemical equation.",
            strengths: [
              "Correctly identified main reactants and products",
              "Mentioned chlorophyll's role",
              "Understood the importance to ecosystem",
            ],
            improvements: [
              "Include the two stages of photosynthesis",
              "Mention the chemical equation",
              "Provide more scientific detail",
            ],
            suggestions: [
              "Study the light-dependent and light-independent reactions",
              "Learn the chemical equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
              "Practice explaining biological processes with more scientific terminology",
            ],
          },
          rubricBreakdown: {
            "Definition & Process": {
              score: 4,
              maxScore: 5,
              feedback: "Good basic definition, could be more precise",
            },
            "Reactants & Products": {
              score: 5,
              maxScore: 5,
              feedback: "Correctly identified all main components",
            },
            "Importance/Function": {
              score: 4,
              maxScore: 5,
              feedback: "Good understanding of ecological importance",
            },
            "Scientific Detail": {
              score: 3,
              maxScore: 5,
              feedback: "Lacks detail about stages and mechanisms",
            },
          },
          conceptAnalysis: {
            covered: ["photosynthesis", "sunlight", "water", "carbon dioxide", "oxygen", "chlorophyll", "plants"],
            missed: [
              "light-dependent reactions",
              "Calvin cycle",
              "glucose",
              "chemical equation",
              "thylakoids",
              "stroma",
            ],
            partial: ["energy conversion", "biological process"],
          },
          semanticSimilarity: 0.78,
          grammarScore: 92,
          structureScore: 85,
        },
        {
          id: "eval-2",
          studentAnswer: "2x + 5 = 15\n2x = 15 - 5\n2x = 10\nx = 5\n\nTherefore, x = 5",
          modelAnswer:
            "2x + 5 = 15\nSubtract 5 from both sides:\n2x = 15 - 5\n2x = 10\nDivide both sides by 2:\nx = 10 ÷ 2\nx = 5\n\nVerification: 2(5) + 5 = 10 + 5 = 15 ✓",
          score: 14,
          maxScore: 15,
          percentage: 93.3,
          grade: "A",
          confidence: 98.2,
          evaluationMethod: "Mathematical Evaluator",
          processingTime: 1.8,
          feedback: {
            overall:
              "Excellent mathematical solution! You followed the correct algebraic steps and arrived at the right answer. Your working is clear and logical.",
            strengths: [
              "Correct algebraic method",
              "Clear step-by-step working",
              "Correct final answer",
              "Good mathematical notation",
            ],
            improvements: ["Could include verification step"],
            suggestions: [
              "Always verify your answer by substituting back into the original equation",
              "Consider adding brief explanations for each step",
            ],
          },
          rubricBreakdown: {
            Method: {
              score: 5,
              maxScore: 5,
              feedback: "Perfect algebraic approach",
            },
            Working: {
              score: 5,
              maxScore: 5,
              feedback: "All steps shown clearly",
            },
            Answer: {
              score: 4,
              maxScore: 5,
              feedback: "Correct answer, missing verification",
            },
          },
          conceptAnalysis: {
            covered: ["linear equation", "algebraic manipulation", "isolation of variable", "arithmetic"],
            missed: ["verification", "checking"],
            partial: [],
          },
          semanticSimilarity: 0.95,
          grammarScore: 95,
          structureScore: 90,
        },
      ]

      setEvaluationResults(mockResults)
      setCurrentStep("Evaluation completed successfully!")
    } catch (error) {
      setCurrentStep("Evaluation failed")
      console.error("Evaluation error:", error)
    } finally {
      setIsEvaluating(false)
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-500 text-white"
      case "A-":
      case "B+":
        return "bg-blue-500 text-white"
      case "B":
      case "B-":
        return "bg-yellow-500 text-white"
      case "C+":
      case "C":
        return "bg-orange-500 text-white"
      default:
        return "bg-red-500 text-white"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Evaluation Engine</h2>
        <p className="text-gray-600">Advanced semantic analysis with multi-model consensus and explainable AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Evaluation Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Model Selection
              </CardTitle>
              <CardDescription>Choose the optimal AI model for evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiModels.map((model) => (
                  <div
                    key={model.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedModel === model.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedModel(model.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{model.name}</h4>
                      <Badge variant="outline">{model.accuracy}% accuracy</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{model.specialty}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Provider: {model.provider}</span>
                      <span className="text-gray-500">Speed: {model.speed}</span>
                      {selectedModel === model.id && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Evaluation Status
              </CardTitle>
              <CardDescription>Real-time AI evaluation progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEvaluating && evaluationResults.length === 0 && (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Ready to evaluate student answers</p>
                  <Button onClick={startEvaluation} className="px-8">
                    <Zap className="mr-2 h-4 w-4" />
                    Start AI Evaluation
                  </Button>
                </div>
              )}

              {isEvaluating && (
                <div className="space-y-4">
                  <Alert>
                    <Brain className="h-4 w-4 animate-pulse" />
                    <AlertTitle>AI Evaluation in Progress</AlertTitle>
                    <AlertDescription>{currentStep}</AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Evaluation Steps</h4>
                    <div className="space-y-1">
                      {evaluationSteps.map((step, index) => {
                        const stepProgress = (progress / 100) * evaluationSteps.length
                        const isCompleted = stepProgress > index
                        const isCurrent = Math.floor(stepProgress) === index

                        return (
                          <div
                            key={index}
                            className={`flex items-center gap-2 text-sm p-2 rounded ${
                              isCompleted
                                ? "bg-green-50 text-green-800"
                                : isCurrent
                                  ? "bg-blue-50 text-blue-800"
                                  : "text-gray-500"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : isCurrent ? (
                              <Brain className="h-4 w-4 animate-pulse text-blue-600" />
                            ) : (
                              <div className="h-4 w-4 border border-gray-300 rounded-full" />
                            )}
                            <span>{step.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {evaluationResults.length > 0 && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Evaluation Complete</AlertTitle>
                    <AlertDescription>
                      Successfully evaluated {evaluationResults.length} answer(s) with high confidence
                    </AlertDescription>
                  </Alert>

                  <Button onClick={startEvaluation} variant="outline" className="w-full">
                    <Target className="mr-2 h-4 w-4" />
                    Evaluate New Answers
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evaluation Results */}
          {evaluationResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Evaluation Results
                </CardTitle>
                <CardDescription>Detailed AI evaluation with feedback and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="detailed">Detailed</TabsTrigger>
                    <TabsTrigger value="rubric">Rubric</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {evaluationResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Badge className={getGradeColor(result.grade)}>{result.grade}</Badge>
                            <span className="text-2xl font-bold">
                              {result.score}/{result.maxScore}
                            </span>
                            <span className="text-gray-500">({result.percentage}%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{result.confidence}% confidence</Badge>
                            <Badge variant="secondary">{result.processingTime}s</Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {Math.round(result.semanticSimilarity * 100)}%
                            </div>
                            <div className="text-sm text-blue-800">Semantic Similarity</div>
                          </div>
                          {result.grammarScore && (
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">{result.grammarScore}%</div>
                              <div className="text-sm text-green-800">Grammar Score</div>
                            </div>
                          )}
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{result.structureScore}%</div>
                            <div className="text-sm text-purple-800">Structure Score</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-green-800 mb-2">Strengths:</h4>
                            <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                              {result.feedback.strengths.map((strength, index) => (
                                <li key={index}>{strength}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-orange-800 mb-2">Areas for Improvement:</h4>
                            <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                              {result.feedback.improvements.map((improvement, index) => (
                                <li key={index}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="detailed" className="space-y-4">
                    {evaluationResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-6 space-y-6">
                        <div>
                          <h4 className="font-semibold mb-3">Student Answer:</h4>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <pre className="whitespace-pre-wrap text-sm font-mono">{result.studentAnswer}</pre>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Model Answer:</h4>
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <pre className="whitespace-pre-wrap text-sm font-mono">{result.modelAnswer}</pre>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Overall Feedback:</h4>
                          <div className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm">{result.feedback.overall}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Suggestions for Improvement:</h4>
                          <div className="space-y-2">
                            {result.feedback.suggestions.map((suggestion, index) => (
                              <div key={index} className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                                <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5" />
                                <p className="text-sm text-purple-800">{suggestion}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="rubric" className="space-y-4">
                    {evaluationResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-6">
                        <h4 className="font-semibold mb-4">Rubric Breakdown</h4>
                        <div className="space-y-4">
                          {Object.entries(result.rubricBreakdown).map(([criterion, details]) => (
                            <div key={criterion} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{criterion}</h5>
                                <Badge variant="outline">
                                  {details.score}/{details.maxScore}
                                </Badge>
                              </div>
                              <Progress value={(details.score / details.maxScore) * 100} className="h-2 mb-2" />
                              <p className="text-sm text-gray-600">{details.feedback}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    {evaluationResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-6 space-y-6">
                        <div>
                          <h4 className="font-semibold mb-4">Concept Analysis</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h5 className="font-medium text-green-800 mb-2">Concepts Covered</h5>
                              <div className="space-y-1">
                                {result.conceptAnalysis.covered.map((concept, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-green-100 text-green-800 mr-1 mb-1"
                                  >
                                    {concept}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-red-800 mb-2">Concepts Missed</h5>
                              <div className="space-y-1">
                                {result.conceptAnalysis.missed.map((concept, index) => (
                                  <Badge key={index} variant="secondary" className="bg-red-100 text-red-800 mr-1 mb-1">
                                    {concept}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-medium text-yellow-800 mb-2">Partially Covered</h5>
                              <div className="space-y-1">
                                {result.conceptAnalysis.partial.map((concept, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-yellow-100 text-yellow-800 mr-1 mb-1"
                                  >
                                    {concept}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-4">Evaluation Metrics</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 border rounded-lg">
                              <div className="text-lg font-bold">{result.confidence}%</div>
                              <div className="text-xs text-gray-600">AI Confidence</div>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <div className="text-lg font-bold">{Math.round(result.semanticSimilarity * 100)}%</div>
                              <div className="text-xs text-gray-600">Semantic Match</div>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <div className="text-lg font-bold">{result.structureScore}%</div>
                              <div className="text-xs text-gray-600">Structure</div>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <div className="text-lg font-bold">{result.processingTime}s</div>
                              <div className="text-xs text-gray-600">Process Time</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Evaluation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Evaluation Settings
              </CardTitle>
              <CardDescription>Configure AI evaluation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="semantic-analysis">Semantic Analysis</Label>
                <Switch
                  id="semantic-analysis"
                  checked={evaluationSettings.semanticAnalysis}
                  onCheckedChange={(checked) =>
                    setEvaluationSettings((prev) => ({ ...prev, semanticAnalysis: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="concept-mapping">Concept Mapping</Label>
                <Switch
                  id="concept-mapping"
                  checked={evaluationSettings.conceptMapping}
                  onCheckedChange={(checked) => setEvaluationSettings((prev) => ({ ...prev, conceptMapping: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="grammar-check">Grammar Check</Label>
                <Switch
                  id="grammar-check"
                  checked={evaluationSettings.grammarCheck}
                  onCheckedChange={(checked) => setEvaluationSettings((prev) => ({ ...prev, grammarCheck: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="structure-analysis">Structure Analysis</Label>
                <Switch
                  id="structure-analysis"
                  checked={evaluationSettings.structureAnalysis}
                  onCheckedChange={(checked) =>
                    setEvaluationSettings((prev) => ({ ...prev, structureAnalysis: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="rubric-based">Rubric-Based Scoring</Label>
                <Switch
                  id="rubric-based"
                  checked={evaluationSettings.rubricBased}
                  onCheckedChange={(checked) => setEvaluationSettings((prev) => ({ ...prev, rubricBased: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="bias-detection">Bias Detection</Label>
                <Switch
                  id="bias-detection"
                  checked={evaluationSettings.biasDetection}
                  onCheckedChange={(checked) => setEvaluationSettings((prev) => ({ ...prev, biasDetection: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="explainable-ai">Explainable AI</Label>
                <Switch
                  id="explainable-ai"
                  checked={evaluationSettings.explainableAI}
                  onCheckedChange={(checked) => setEvaluationSettings((prev) => ({ ...prev, explainableAI: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Weights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Evaluation Weights
              </CardTitle>
              <CardDescription>Adjust scoring criteria importance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="strictness-level">Strictness Level: {evaluationSettings.strictnessLevel}%</Label>
                <Slider
                  id="strictness-level"
                  min={0}
                  max={100}
                  step={5}
                  value={[evaluationSettings.strictnessLevel]}
                  onValueChange={(value) => setEvaluationSettings((prev) => ({ ...prev, strictnessLevel: value[0] }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="creativity-weight">Creativity Weight: {evaluationSettings.creativityWeight}%</Label>
                <Slider
                  id="creativity-weight"
                  min={0}
                  max={100}
                  step={5}
                  value={[evaluationSettings.creativityWeight]}
                  onValueChange={(value) =>
                    setEvaluationSettings((prev) => ({
                      ...prev,
                      creativityWeight: value[0],
                      accuracyWeight: 100 - value[0],
                    }))
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="accuracy-weight">Accuracy Weight: {evaluationSettings.accuracyWeight}%</Label>
                <Slider
                  id="accuracy-weight"
                  min={0}
                  max={100}
                  step={5}
                  value={[evaluationSettings.accuracyWeight]}
                  onValueChange={(value) =>
                    setEvaluationSettings((prev) => ({
                      ...prev,
                      accuracyWeight: value[0],
                      creativityWeight: 100 - value[0],
                    }))
                  }
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Model Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Model Performance
              </CardTitle>
              <CardDescription>Real-time accuracy metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiModels.slice(0, 4).map((model) => (
                  <div key={model.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{model.name}</span>
                      <span>{model.accuracy}%</span>
                    </div>
                    <Progress value={model.accuracy} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Supported Answer Types
              </CardTitle>
              <CardDescription>AI evaluation capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <PenTool className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">Short Answers</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">Long Essays</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                  <Calculator className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-800">Mathematical Solutions</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">Paragraph Answers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
