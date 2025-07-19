"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, AlertTriangle, CheckCircle, Search, FileText, Link, Eye, BarChart3 } from "lucide-react"

export function PlagiarismDetection() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  const mockResults = {
    overallSimilarity: 15.2,
    riskLevel: "low",
    sourcesFound: 3,
    matches: [
      {
        id: 1,
        source: "Wikipedia - Photosynthesis",
        similarity: 8.5,
        matchedText: "Photosynthesis is the process by which plants make food using sunlight",
        url: "https://en.wikipedia.org/wiki/Photosynthesis",
        type: "web",
      },
      {
        id: 2,
        source: "Biology Textbook Chapter 4",
        similarity: 4.2,
        matchedText: "chlorophyll captures light energy",
        url: null,
        type: "academic",
      },
      {
        id: 3,
        source: "Student Paper - John Smith (2023)",
        similarity: 2.5,
        matchedText: "plants convert carbon dioxide and water",
        url: null,
        type: "student",
      },
    ],
  }

  const startScan = async () => {
    setIsScanning(true)
    setScanProgress(0)

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
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

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "web":
        return <Link className="h-4 w-4" />
      case "academic":
        return <FileText className="h-4 w-4" />
      case "student":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Plagiarism Detection</h2>
        <p className="text-gray-600">Advanced similarity detection and academic integrity monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{mockResults.overallSimilarity}%</div>
              <div className="text-sm text-gray-600">Overall Similarity</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${mockResults.riskLevel === "low" ? "text-green-600" : "text-red-600"}`}
              >
                {mockResults.riskLevel.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">Risk Level</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{mockResults.sourcesFound}</div>
              <div className="text-sm text-gray-600">Sources Found</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">2.1M</div>
              <div className="text-sm text-gray-600">Database Size</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scan" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scan">Scan Results</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Plagiarism Scan
                </CardTitle>
                <CardDescription>Comprehensive similarity analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isScanning ? (
                  <div className="space-y-4">
                    <Alert>
                      <Search className="h-4 w-4 animate-spin" />
                      <AlertTitle>Scanning in Progress</AlertTitle>
                      <AlertDescription>Analyzing text against academic databases...</AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Scan Progress</span>
                        <span>{scanProgress}%</span>
                      </div>
                      <Progress value={scanProgress} className="h-3" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Scan Complete</AlertTitle>
                      <AlertDescription>Plagiarism analysis completed successfully</AlertDescription>
                    </Alert>
                    <Button onClick={startScan} className="w-full">
                      <Search className="mr-2 h-4 w-4" />
                      Run New Scan
                    </Button>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-semibold">Similarity Breakdown</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Web Sources</span>
                        <span>8.5%</span>
                      </div>
                      <Progress value={8.5} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Academic Papers</span>
                        <span>4.2%</span>
                      </div>
                      <Progress value={4.2} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Student Papers</span>
                        <span>2.5%</span>
                      </div>
                      <Progress value={2.5} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Academic integrity evaluation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 mb-2">LOW RISK</div>
                  <p className="text-green-800">Similarity levels are within acceptable academic standards</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Original Content</p>
                      <p className="text-sm text-green-700">84.8% original content detected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Common Phrases</p>
                      <p className="text-sm text-yellow-700">15.2% common academic phrases</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">Citations Needed</p>
                      <p className="text-sm text-blue-700">3 sources require proper citation</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Similarity Matches</CardTitle>
              <CardDescription>Detailed breakdown of similar content found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockResults.matches.map((match) => (
                  <div key={match.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(match.type)}
                        <h4 className="font-semibold">{match.source}</h4>
                      </div>
                      <Badge variant="outline">{match.similarity}% similarity</Badge>
                    </div>
                    <div className="p-3 bg-gray-50 rounded mb-3">
                      <p className="text-sm font-mono">"{match.matchedText}"</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" className="capitalize">
                        {match.type} source
                      </Badge>
                      {match.url && (
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Source
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Source Database</CardTitle>
              <CardDescription>Comprehensive database of academic and web sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">850K</div>
                  <div className="text-sm text-gray-600">Academic Papers</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">1.2M</div>
                  <div className="text-sm text-gray-600">Web Pages</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">50K</div>
                  <div className="text-sm text-gray-600">Student Papers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Plagiarism Analytics
              </CardTitle>
              <CardDescription>Historical plagiarism detection trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                <p>Plagiarism analytics charts would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
