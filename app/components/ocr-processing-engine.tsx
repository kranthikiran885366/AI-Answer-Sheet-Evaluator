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
import { Textarea } from "@/components/ui/textarea"
import {
  Scan,
  Brain,
  Zap,
  CheckCircle,
  Settings,
  ImageIcon,
  FileText,
  RotateCcw,
  Languages,
  Type,
  Calculator,
  Table,
} from "lucide-react"

interface OCRResult {
  id: string
  text: string
  confidence: number
  engine: string
  language: string
  processingTime: number
  segments: Array<{
    type: "text" | "diagram" | "table" | "formula"
    content: string
    confidence: number
    boundingBox: { x: number; y: number; width: number; height: number }
  }>
}

export function OCRProcessingEngine() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState("")
  const [progress, setProgress] = useState(0)
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([])
  const [selectedEngine, setSelectedEngine] = useState("multi-engine")
  const [processingSettings, setProcessingSettings] = useState({
    multiEngine: true,
    handwritingMode: true,
    diagramDetection: true,
    tableExtraction: true,
    formulaRecognition: true,
    lineSegmentation: true,
    noiseReduction: true,
    skewCorrection: true,
    contrastEnhancement: true,
  })

  const ocrEngines = [
    { id: "tesseract", name: "Tesseract OCR", accuracy: 92, speed: "Fast", specialty: "Printed text" },
    { id: "easyocr", name: "EasyOCR", accuracy: 89, speed: "Medium", specialty: "Multi-language" },
    { id: "paddleocr", name: "PaddleOCR", accuracy: 94, speed: "Fast", specialty: "Chinese/English" },
    { id: "trocr", name: "TrOCR", accuracy: 96, speed: "Slow", specialty: "Handwriting" },
    { id: "google-vision", name: "Google Vision", accuracy: 98, speed: "Medium", specialty: "General purpose" },
    { id: "aws-textract", name: "AWS Textract", accuracy: 97, speed: "Medium", specialty: "Documents" },
    { id: "multi-engine", name: "Multi-Engine Consensus", accuracy: 99, speed: "Slow", specialty: "Highest accuracy" },
  ]

  const processingSteps = [
    { name: "Image Preprocessing", description: "Enhancing image quality" },
    { name: "Skew Detection & Correction", description: "Straightening rotated text" },
    { name: "Noise Reduction", description: "Removing artifacts and noise" },
    { name: "Line Segmentation", description: "Identifying text lines" },
    { name: "Character Recognition", description: "Converting pixels to text" },
    { name: "Handwriting Analysis", description: "Processing handwritten content" },
    { name: "Diagram Detection", description: "Identifying non-text elements" },
    { name: "Table Extraction", description: "Processing tabular data" },
    { name: "Formula Recognition", description: "Mathematical expression parsing" },
    { name: "Quality Validation", description: "Verifying results" },
    { name: "Multi-Engine Consensus", description: "Combining results" },
    { name: "Post-Processing", description: "Final text cleanup" },
  ]

  const startOCRProcessing = async () => {
    setIsProcessing(true)
    setProgress(0)
    setOcrResults([])

    try {
      for (let i = 0; i < processingSteps.length; i++) {
        const step = processingSteps[i]
        setCurrentStep(step.description)

        // Simulate processing time based on step complexity
        const stepDuration = step.name.includes("Multi-Engine")
          ? 3000
          : step.name.includes("Handwriting")
            ? 2500
            : step.name.includes("Formula")
              ? 2000
              : 1000

        await new Promise((resolve) => setTimeout(resolve, stepDuration))
        setProgress(((i + 1) / processingSteps.length) * 100)
      }

      // Generate mock OCR results
      const mockResults: OCRResult[] = [
        {
          id: "result-1",
          text: "Question 1: Explain the process of photosynthesis and its importance in the ecosystem.\n\nAnswer: Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. During this process, plants convert carbon dioxide and water into glucose and oxygen using light energy. This process is crucial for the ecosystem as it produces oxygen that all living organisms need for respiration and serves as the primary source of energy for most life forms on Earth.",
          confidence: 96.8,
          engine: "Multi-Engine Consensus",
          language: "English",
          processingTime: 2.3,
          segments: [
            {
              type: "text",
              content: "Question 1: Explain the process of photosynthesis and its importance in the ecosystem.",
              confidence: 98.5,
              boundingBox: { x: 50, y: 100, width: 500, height: 30 },
            },
            {
              type: "text",
              content: "Answer: Photosynthesis is the process by which green plants...",
              confidence: 95.2,
              boundingBox: { x: 50, y: 150, width: 520, height: 120 },
            },
          ],
        },
        {
          id: "result-2",
          text: "Question 2: Solve the equation: 2x + 5 = 15\n\nSolution:\n2x + 5 = 15\n2x = 15 - 5\n2x = 10\nx = 5\n\nTherefore, x = 5",
          confidence: 94.2,
          engine: "TrOCR + Tesseract",
          language: "English",
          processingTime: 1.8,
          segments: [
            {
              type: "text",
              content: "Question 2: Solve the equation: 2x + 5 = 15",
              confidence: 97.1,
              boundingBox: { x: 50, y: 300, width: 400, height: 25 },
            },
            {
              type: "formula",
              content: "2x + 5 = 15\n2x = 15 - 5\n2x = 10\nx = 5",
              confidence: 91.3,
              boundingBox: { x: 50, y: 340, width: 200, height: 100 },
            },
          ],
        },
      ]

      setOcrResults(mockResults)
      setCurrentStep("OCR processing completed successfully!")
    } catch (error) {
      setCurrentStep("OCR processing failed")
      console.error("OCR processing error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getSegmentIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4" />
      case "diagram":
        return <ImageIcon className="h-4 w-4" />
      case "table":
        return <Table className="h-4 w-4" />
      case "formula":
        return <Calculator className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getSegmentColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800"
      case "diagram":
        return "bg-green-100 text-green-800"
      case "table":
        return "bg-purple-100 text-purple-800"
      case "formula":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Advanced OCR Processing Engine</h2>
        <p className="text-gray-600">Multi-engine handwriting recognition with intelligent segmentation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Processing Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* OCR Engine Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                OCR Engine Selection
              </CardTitle>
              <CardDescription>Choose the optimal OCR engine for your content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ocrEngines.map((engine) => (
                  <div
                    key={engine.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedEngine === engine.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedEngine(engine.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{engine.name}</h4>
                      <Badge variant="outline">{engine.accuracy}% accuracy</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{engine.specialty}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Speed: {engine.speed}</span>
                      {selectedEngine === engine.id && <CheckCircle className="h-4 w-4 text-blue-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Processing Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Processing Status
              </CardTitle>
              <CardDescription>Real-time OCR processing progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isProcessing && ocrResults.length === 0 && (
                <div className="text-center py-12">
                  <Scan className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Ready to process answer sheets</p>
                  <Button onClick={startOCRProcessing} className="px-8">
                    <Zap className="mr-2 h-4 w-4" />
                    Start OCR Processing
                  </Button>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-4">
                  <Alert>
                    <Scan className="h-4 w-4 animate-spin" />
                    <AlertTitle>Processing in Progress</AlertTitle>
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
                    <h4 className="text-sm font-semibold">Processing Steps</h4>
                    <div className="space-y-1">
                      {processingSteps.map((step, index) => {
                        const stepProgress = (progress / 100) * processingSteps.length
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
                              <Scan className="h-4 w-4 animate-spin text-blue-600" />
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

              {ocrResults.length > 0 && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Processing Complete</AlertTitle>
                    <AlertDescription>
                      Successfully processed {ocrResults.length} document(s) with high accuracy
                    </AlertDescription>
                  </Alert>

                  <Button onClick={startOCRProcessing} variant="outline" className="w-full">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Process New Documents
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* OCR Results */}
          {ocrResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  OCR Results
                </CardTitle>
                <CardDescription>Extracted text with confidence scores and segmentation</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="text-view" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text-view">Text View</TabsTrigger>
                    <TabsTrigger value="segments">Segments</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text-view" className="space-y-4">
                    {ocrResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{result.engine}</Badge>
                            <Badge variant="secondary">{result.confidence}% confidence</Badge>
                            <Badge variant="outline">{result.language}</Badge>
                          </div>
                          <span className="text-sm text-gray-500">{result.processingTime}s processing time</span>
                        </div>

                        <Textarea value={result.text} readOnly className="min-h-[200px] font-mono text-sm" />
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="segments" className="space-y-4">
                    {ocrResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-4">Document Segments</h4>
                        <div className="space-y-3">
                          {result.segments.map((segment, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                              <div className={`p-2 rounded-lg ${getSegmentColor(segment.type)}`}>
                                {getSegmentIcon(segment.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="capitalize">
                                    {segment.type}
                                  </Badge>
                                  <Badge variant="secondary">{segment.confidence}% confidence</Badge>
                                </div>
                                <p className="text-sm text-gray-700 font-mono">
                                  {segment.content.substring(0, 100)}
                                  {segment.content.length > 100 && "..."}
                                </p>
                                <div className="text-xs text-gray-500 mt-2">
                                  Position: ({segment.boundingBox.x}, {segment.boundingBox.y}) Size:{" "}
                                  {segment.boundingBox.width}×{segment.boundingBox.height}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    {ocrResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-4">Analysis Report</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Overall Confidence:</span>
                              <Badge variant="secondary">{result.confidence}%</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Processing Time:</span>
                              <span className="text-sm">{result.processingTime}s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Language Detected:</span>
                              <span className="text-sm">{result.language}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Total Segments:</span>
                              <span className="text-sm">{result.segments.length}</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Text Segments:</span>
                              <span className="text-sm">{result.segments.filter((s) => s.type === "text").length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Formula Segments:</span>
                              <span className="text-sm">
                                {result.segments.filter((s) => s.type === "formula").length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Diagram Segments:</span>
                              <span className="text-sm">
                                {result.segments.filter((s) => s.type === "diagram").length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Table Segments:</span>
                              <span className="text-sm">
                                {result.segments.filter((s) => s.type === "table").length}
                              </span>
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
          {/* Processing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Processing Settings
              </CardTitle>
              <CardDescription>Configure OCR processing options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="multi-engine">Multi-Engine Processing</Label>
                <Switch
                  id="multi-engine"
                  checked={processingSettings.multiEngine}
                  onCheckedChange={(checked) => setProcessingSettings((prev) => ({ ...prev, multiEngine: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="handwriting-mode">Handwriting Mode</Label>
                <Switch
                  id="handwriting-mode"
                  checked={processingSettings.handwritingMode}
                  onCheckedChange={(checked) =>
                    setProcessingSettings((prev) => ({ ...prev, handwritingMode: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="diagram-detection">Diagram Detection</Label>
                <Switch
                  id="diagram-detection"
                  checked={processingSettings.diagramDetection}
                  onCheckedChange={(checked) =>
                    setProcessingSettings((prev) => ({ ...prev, diagramDetection: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="table-extraction">Table Extraction</Label>
                <Switch
                  id="table-extraction"
                  checked={processingSettings.tableExtraction}
                  onCheckedChange={(checked) =>
                    setProcessingSettings((prev) => ({ ...prev, tableExtraction: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="formula-recognition">Formula Recognition</Label>
                <Switch
                  id="formula-recognition"
                  checked={processingSettings.formulaRecognition}
                  onCheckedChange={(checked) =>
                    setProcessingSettings((prev) => ({ ...prev, formulaRecognition: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Enhancement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Image Enhancement
              </CardTitle>
              <CardDescription>Preprocessing options for better accuracy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="line-segmentation">Line Segmentation</Label>
                <Switch
                  id="line-segmentation"
                  checked={processingSettings.lineSegmentation}
                  onCheckedChange={(checked) =>
                    setProcessingSettings((prev) => ({ ...prev, lineSegmentation: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="noise-reduction">Noise Reduction</Label>
                <Switch
                  id="noise-reduction"
                  checked={processingSettings.noiseReduction}
                  onCheckedChange={(checked) => setProcessingSettings((prev) => ({ ...prev, noiseReduction: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="skew-correction">Skew Correction</Label>
                <Switch
                  id="skew-correction"
                  checked={processingSettings.skewCorrection}
                  onCheckedChange={(checked) => setProcessingSettings((prev) => ({ ...prev, skewCorrection: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="contrast-enhancement">Contrast Enhancement</Label>
                <Switch
                  id="contrast-enhancement"
                  checked={processingSettings.contrastEnhancement}
                  onCheckedChange={(checked) =>
                    setProcessingSettings((prev) => ({ ...prev, contrastEnhancement: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Engine Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Engine Performance
              </CardTitle>
              <CardDescription>Real-time performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ocrEngines.slice(0, 4).map((engine) => (
                  <div key={engine.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{engine.name}</span>
                      <span>{engine.accuracy}%</span>
                    </div>
                    <Progress value={engine.accuracy} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Language Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Language Support
              </CardTitle>
              <CardDescription>Multi-language OCR capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Languages className="h-4 w-4" />
                  <AlertTitle>50+ Languages Supported</AlertTitle>
                  <AlertDescription>
                    Automatic language detection with support for mixed-language documents
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["English", "Spanish", "French", "German", "Chinese", "Japanese", "Arabic", "Hindi"].map((lang) => (
                    <Badge key={lang} variant="outline" className="justify-center">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
