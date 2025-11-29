"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Brain, Target, CheckCircle, AlertCircle, Lightbulb, BarChart3, MessageSquare } from "lucide-react"

export function ExplainableAI() {
  const [selectedEvaluation, setSelectedEvaluation] = useState("eval-1")

  const mockExplanation = {
    score: 85,
    confidence: 94.2,
    reasoning:
      "The answer demonstrates a solid understanding of the core concepts with clear explanations and correct methodology.",
    factors: [
      { name: "Content Accuracy", weight: 40, score: 88, impact: "high" },
      { name: "Methodology", weight: 25, score: 92, impact: "high" },
      { name: "Clarity", weight: 20, score: 80, impact: "medium" },
      { name: "Completeness", weight: 15, score: 75, impact: "medium" },
    ],
    keyPhrases: [
      { phrase: "photosynthesis process", relevance: 95, sentiment: "positive" },
      { phrase: "chlorophyll function", relevance: 88, sentiment: "positive" },
      { phrase: "light energy conversion", relevance: 82, sentiment: "neutral" },
    ],
    decisionPath: [
      { step: 1, description: "Text preprocessing and tokenization", confidence: 98 },
      { step: 2, description: "Concept identification and mapping", confidence: 94 },
      { step: 3, description: "Semantic similarity analysis", confidence: 91 },
      { step: 4, description: "Rubric criteria evaluation", confidence: 89 },
      { step: 5, description: "Final score calculation", confidence: 94 },
    ],
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Explainable AI</h2>
        <p className="text-gray-600">Transparent AI decision-making with detailed explanations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{mockExplanation.confidence}%</div>
              <div className="text-sm text-gray-600">AI Confidence</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{mockExplanation.score}</div>
              <div className="text-sm text-gray-600">Final Score</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{mockExplanation.factors.length}</div>
              <div className="text-sm text-gray-600">Evaluation Factors</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{mockExplanation.decisionPath.length}</div>
              <div className="text-sm text-gray-600">Decision Steps</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="explanation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="explanation">Explanation</TabsTrigger>
          <TabsTrigger value="factors">Factors</TabsTrigger>
          <TabsTrigger value="decision-path">Decision Path</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="explanation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                AI Reasoning Explanation
              </CardTitle>
              <CardDescription>Detailed breakdown of how the AI arrived at this evaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Overall Assessment</h4>
                <p className="text-blue-800">{mockExplanation.reasoning}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Score Breakdown</h4>
                  <div className="space-y-3">
                    {mockExplanation.factors.map((factor) => (
                      <div key={factor.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{factor.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={factor.impact === "high" ? "default" : "secondary"}>{factor.impact}</Badge>
                            <span className="text-sm">{factor.score}%</span>
                          </div>
                        </div>
                        <Progress value={factor.score} className="h-2" />
                        <div className="text-xs text-gray-500">Weight: {factor.weight}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Key Phrases Analysis</h4>
                  <div className="space-y-3">
                    {mockExplanation.keyPhrases.map((phrase, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">"{phrase.phrase}"</span>
                          <Badge variant="outline">{phrase.relevance}%</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              phrase.sentiment === "positive"
                                ? "bg-green-500"
                                : phrase.sentiment === "negative"
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                            }`}
                          ></div>
                          <span className="text-xs text-gray-600 capitalize">{phrase.sentiment}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Evaluation Factors
              </CardTitle>
              <CardDescription>Individual factors that contributed to the final score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockExplanation.factors.map((factor) => (
                  <div key={factor.name} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">{factor.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={factor.impact === "high" ? "default" : "secondary"}>
                          {factor.impact} impact
                        </Badge>
                        <span className="text-lg font-bold">{factor.score}%</span>
                      </div>
                    </div>
                    <Progress value={factor.score} className="h-3 mb-2" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Weight in final score: {factor.weight}%</span>
                      <span>Contribution: {Math.round((factor.score * factor.weight) / 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decision-path" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Decision Path
              </CardTitle>
              <CardDescription>Step-by-step process the AI followed to evaluate this answer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockExplanation.decisionPath.map((step, index) => (
                  <div key={step.step} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium">{step.description}</p>
                        <Badge variant="outline">{step.confidence}% confidence</Badge>
                      </div>
                      <Progress value={step.confidence} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Insights
                </CardTitle>
                <CardDescription>Key insights from the evaluation process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Strong Points</span>
                  </div>
                  <p className="text-sm text-green-700">
                    The answer demonstrates excellent understanding of fundamental concepts with clear explanations.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Areas for Improvement</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Could benefit from more specific examples and detailed explanations of complex processes.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Recommendations</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Focus on providing more detailed explanations and include relevant examples to strengthen answers.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Confidence Analysis
                </CardTitle>
                <CardDescription>AI confidence levels throughout the evaluation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{mockExplanation.confidence}%</div>
                    <div className="text-sm text-gray-600">Overall Confidence</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Content Analysis</span>
                      <span>96%</span>
                    </div>
                    <Progress value={96} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Semantic Understanding</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Score Calculation</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
