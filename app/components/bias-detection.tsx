"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Scale, CheckCircle, Eye, BarChart3, Target, Shield } from "lucide-react"

export function BiasDetection() {
  const [biasScore, setBiasScore] = useState(8.2)

  const biasMetrics = [
    { name: "Gender Bias", score: 5.2, status: "low", description: "Minimal gender-based evaluation differences" },
    { name: "Cultural Bias", score: 12.1, status: "medium", description: "Some cultural context variations detected" },
    { name: "Language Bias", score: 3.8, status: "low", description: "Consistent evaluation across language styles" },
    {
      name: "Socioeconomic Bias",
      score: 6.5,
      status: "low",
      description: "Fair evaluation regardless of background indicators",
    },
    { name: "Academic Level Bias", score: 4.3, status: "low", description: "Appropriate difficulty level assessment" },
  ]

  const fairnessMetrics = {
    overallFairness: 91.8,
    demographicParity: 89.2,
    equalOpportunity: 93.5,
    calibration: 88.7,
  }

  const getBiasColor = (status: string) => {
    switch (status) {
      case "low":
        return "text-green-600 bg-green-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "high":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Bias Detection & Fairness</h2>
        <p className="text-gray-600">Ensuring fair and unbiased AI evaluation across all demographics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{fairnessMetrics.overallFairness}%</div>
              <div className="text-sm text-gray-600">Overall Fairness</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{biasScore}%</div>
              <div className="text-sm text-gray-600">Bias Score</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{fairnessMetrics.equalOpportunity}%</div>
              <div className="text-sm text-gray-600">Equal Opportunity</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{fairnessMetrics.calibration}%</div>
              <div className="text-sm text-gray-600">Calibration</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="detection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="detection">Bias Detection</TabsTrigger>
          <TabsTrigger value="fairness">Fairness Metrics</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="detection" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Bias Analysis
                </CardTitle>
                <CardDescription>Comprehensive bias detection across multiple dimensions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {biasMetrics.map((metric) => (
                  <div key={metric.name} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={getBiasColor(metric.status)}>{metric.status}</Badge>
                        <span className="text-sm">{metric.score}%</span>
                      </div>
                    </div>
                    <Progress value={metric.score} className="h-2" />
                    <p className="text-xs text-gray-600">{metric.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Bias Mitigation Status
                </CardTitle>
                <CardDescription>Active measures to prevent and reduce bias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Bias Monitoring Active</AlertTitle>
                  <AlertDescription>
                    Real-time bias detection is monitoring all evaluations for fairness
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Diverse Training Data</p>
                      <p className="text-sm text-green-700">Models trained on representative datasets</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Fairness Constraints</p>
                      <p className="text-sm text-green-700">Built-in fairness constraints in AI models</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Regular Audits</p>
                      <p className="text-sm text-green-700">Continuous bias auditing and correction</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fairness" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fairness Metrics Dashboard</CardTitle>
              <CardDescription>Comprehensive fairness evaluation across different groups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Demographic Parity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score Distribution Equality</span>
                      <span>{fairnessMetrics.demographicParity}%</span>
                    </div>
                    <Progress value={fairnessMetrics.demographicParity} className="h-3" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Equal Opportunity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>True Positive Rate Equality</span>
                      <span>{fairnessMetrics.equalOpportunity}%</span>
                    </div>
                    <Progress value={fairnessMetrics.equalOpportunity} className="h-3" />
                  </div>
                </div>
              </div>

              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                <p>Detailed fairness analytics charts would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mitigation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bias Mitigation Strategies</CardTitle>
              <CardDescription>Active measures to ensure fair AI evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Pre-processing</h4>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium">Data Augmentation</p>
                      <p className="text-sm text-gray-600">Balancing training data across demographics</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium">Feature Selection</p>
                      <p className="text-sm text-gray-600">Removing potentially biased features</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">In-processing</h4>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium">Fairness Constraints</p>
                      <p className="text-sm text-gray-600">Built-in fairness objectives during training</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium">Adversarial Debiasing</p>
                      <p className="text-sm text-gray-600">Using adversarial networks to reduce bias</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Continuous Monitoring</CardTitle>
              <CardDescription>Real-time bias monitoring and alerting system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertTitle>Monitoring Status: Active</AlertTitle>
                  <AlertDescription>All evaluations are continuously monitored for bias patterns</AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">24/7</div>
                    <div className="text-sm text-gray-600">Monitoring</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">Real-time</div>
                    <div className="text-sm text-gray-600">Alerts</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-2">Auto</div>
                    <div className="text-sm text-gray-600">Correction</div>
                  </div>
                </div>

                <div className="text-center py-8 text-gray-500">
                  <Target className="h-16 w-16 mx-auto mb-4" />
                  <p>Bias monitoring dashboard would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
