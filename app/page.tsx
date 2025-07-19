"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarInset } from "@/components/ui/sidebar"
import { MainSidebar } from "./components/main-sidebar"
import {
  Brain,
  Upload,
  BarChart3,
  FileText,
  Zap,
  Shield,
  TrendingUp,
  BookOpen,
  Scan,
  MessageSquare,
  Award,
  Eye,
  Users,
  Globe,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Download,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Menu,
  X,
  Settings,
  LogOut,
} from "lucide-react"

// Import all components
import { AdvancedUploadSection } from "./components/advanced-upload-section"
import { OCRProcessingEngine } from "./components/ocr-processing-engine"
import { AIEvaluationEngine } from "./components/ai-evaluation-engine"
import { RubricManagement } from "./components/rubric-management"
import { FeedbackGeneration } from "./components/feedback-generation"
import { TeacherDashboard } from "./components/teacher-dashboard"
import { StudentPortal } from "./components/student-portal"
import { AdminDashboard } from "./components/admin-dashboard"
import { AnalyticsReports } from "./components/analytics-reports"
import { ContinuousLearning } from "./components/continuous-learning"
import { SecurityCompliance } from "./components/security-compliance"
import { ExplainableAI } from "./components/explainable-ai"
import { AIModelHub } from "./components/ai-model-hub"
import { EvaluationResults } from "./components/evaluation-results"
import { useWebSocket } from "@/components/websocket-provider"

export default function AIAnswerEvaluatorApp() {
  const [activeTab, setActiveTab] = useState("home")
  const [userRole, setUserRole] = useState<"admin" | "teacher" | "student" | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPublicPages, setShowPublicPages] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [systemStats, setSystemStats] = useState({
    totalEvaluations: 15247,
    accuracyRate: 94.8,
    activeUsers: 1256,
    processingTime: 2.3,
    totalInstitutions: 2500,
    studentsServed: 1200000,
    answerSheetsProcessed: 50000000,
    countries: 85,
  })
  const { isConnected } = useWebSocket()

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        const authStatus = localStorage.getItem("auth_status")
        const role = localStorage.getItem("user_role")

        if (authStatus === "authenticated" && role) {
          setIsAuthenticated(true)
          setUserRole(role as any)
          setShowPublicPages(false)
          setActiveTab("dashboard")
        }
      } catch (error) {
        console.error("System initialization failed:", error)
      }
    }

    initializeSystem()
  }, [])

  const handleLogin = (role: "admin" | "teacher" | "student") => {
    setUserRole(role)
    setIsAuthenticated(true)
    setShowPublicPages(false)
    localStorage.setItem("auth_status", "authenticated")
    localStorage.setItem("user_role", role)
    setActiveTab("dashboard")
  }

  const handleLogout = () => {
    setUserRole(null)
    setIsAuthenticated(false)
    setShowPublicPages(true)
    localStorage.removeItem("auth_status")
    localStorage.removeItem("user_role")
    setActiveTab("home")
  }

  const features = [
    {
      icon: <Scan className="h-6 w-6" />,
      title: "Advanced OCR Engine",
      description: "Multi-language handwriting recognition with 99.2% accuracy across 50+ languages",
      status: "Active",
      color: "bg-green-500",
      metrics: "99.2% accuracy",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI Evaluation System",
      description: "Semantic understanding and concept-based grading with explainable AI",
      status: "Active",
      color: "bg-blue-500",
      metrics: "12 AI models",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Smart Rubric Management",
      description: "Dynamic rubrics with adaptive scoring and real-time adjustments",
      status: "Active",
      color: "bg-purple-500",
      metrics: "500+ templates",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Intelligent Feedback",
      description: "Personalized improvement suggestions with learning path recommendations",
      status: "Active",
      color: "bg-orange-500",
      metrics: "AI-powered",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Plagiarism & Bias Detection",
      description: "Advanced similarity detection with fairness algorithms and bias prevention",
      status: "Active",
      color: "bg-red-500",
      metrics: "99.5% detection",
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Explainable AI",
      description: "Transparent scoring with detailed justifications and confidence metrics",
      status: "Active",
      color: "bg-teal-500",
      metrics: "Full transparency",
    },
  ]

  const publicStats = [
    {
      label: "Educational Institutions",
      value: "2,500+",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Universities, schools, and training centers worldwide",
    },
    {
      label: "Students Served",
      value: "1.2M+",
      icon: <Users className="h-5 w-5" />,
      description: "Active learners using our platform monthly",
    },
    {
      label: "Answer Sheets Processed",
      value: "50M+",
      icon: <FileText className="h-5 w-5" />,
      description: "Documents evaluated with AI precision",
    },
    {
      label: "Countries",
      value: "85+",
      icon: <Globe className="h-5 w-5" />,
      description: "Global reach across all continents",
    },
  ]

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Professor, MIT",
      content:
        "This AI system has revolutionized how we evaluate student work. The accuracy and speed are remarkable, and the detailed feedback helps students improve significantly.",
      rating: 5,
      image: "/placeholder.svg?height=60&width=60",
      institution: "Massachusetts Institute of Technology",
    },
    {
      name: "Michael Chen",
      role: "High School Teacher",
      content:
        "The bias detection and fairness features ensure equitable evaluation for all our students. It's like having an expert assistant that never gets tired.",
      rating: 5,
      image: "/placeholder.svg?height=60&width=60",
      institution: "Lincoln High School",
    },
    {
      name: "Prof. Emily Rodriguez",
      role: "Stanford University",
      content:
        "The explainable AI feature gives us confidence in the results. Students and faculty can understand exactly how grades are determined.",
      rating: 5,
      image: "/placeholder.svg?height=60&width=60",
      institution: "Stanford University",
    },
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for individual teachers and small classrooms",
      features: [
        "Up to 100 evaluations/month",
        "Basic OCR processing",
        "Standard feedback generation",
        "Email support",
        "Basic analytics",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "Ideal for schools and educational institutions",
      features: [
        "Up to 1,000 evaluations/month",
        "Advanced OCR with handwriting",
        "AI-powered feedback",
        "Plagiarism detection",
        "Priority support",
        "Advanced analytics",
        "Custom rubrics",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large institutions and government organizations",
      features: [
        "Unlimited evaluations",
        "All AI features",
        "White-label solution",
        "API access",
        "24/7 dedicated support",
        "Custom integrations",
        "On-premise deployment",
      ],
      popular: false,
    },
  ]

  if (showPublicPages) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Public Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-8 w-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">EvalAI Pro</h1>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 hidden sm:inline-flex">
                  Production Ready
                </Badge>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Testimonials
                </a>
                <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Contact
                </a>
                <Button onClick={() => setActiveTab("demo")} variant="outline">
                  Live Demo
                </Button>
                <Button onClick={() => setActiveTab("login")}>Sign In</Button>
              </nav>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="md:hidden py-4 border-t">
                <div className="flex flex-col space-y-4">
                  <a href="#features" className="text-gray-600 hover:text-gray-900">
                    Features
                  </a>
                  <a href="#pricing" className="text-gray-600 hover:text-gray-900">
                    Pricing
                  </a>
                  <a href="#testimonials" className="text-gray-600 hover:text-gray-900">
                    Testimonials
                  </a>
                  <a href="#contact" className="text-gray-600 hover:text-gray-900">
                    Contact
                  </a>
                  <Button onClick={() => setActiveTab("demo")} variant="outline" className="w-full">
                    Live Demo
                  </Button>
                  <Button onClick={() => setActiveTab("login")} className="w-full">
                    Sign In
                  </Button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                AI-Powered Answer Sheet
                <span className="text-blue-600 block">Evaluation System</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Revolutionary AI technology that evaluates student answers with human-level accuracy, providing instant
                feedback and ensuring fair, unbiased grading across all subjects and languages.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="text-lg px-8 py-4" onClick={() => setActiveTab("demo")}>
                  <Play className="mr-2 h-5 w-5" />
                  Try Live Demo
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-transparent">
                  <Download className="mr-2 h-5 w-5" />
                  Download Whitepaper
                </Button>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {publicStats.map((stat, index) => (
                  <Card key={index} className="p-4 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-0 text-center">
                      <div className="flex justify-center mb-2">
                        <div className="bg-blue-100 p-2 rounded-full">{stat.icon}</div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 animate-bounce">
            <div className="bg-blue-100 p-3 rounded-full">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="absolute top-32 right-20 animate-pulse">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Cutting-Edge AI Features</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI system combines multiple advanced technologies to deliver unparalleled accuracy and fairness in
                academic evaluation across all subjects and educational levels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-lg ${feature.color} text-white group-hover:scale-110 transition-transform`}
                      >
                        {feature.icon}
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {feature.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <Badge variant="outline" className="mb-2">
                      {feature.metrics}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Educators Worldwide</h2>
              <p className="text-xl text-gray-600">See what leading educators say about our AI evaluation system</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                        <div className="text-xs text-blue-600">{testimonial.institution}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600">Choose the plan that fits your institution's needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`relative ${plan.popular ? "ring-2 ring-blue-500 scale-105" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    <p className="text-gray-600 mt-2">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Evaluation Process?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of educators who have revolutionized their grading with AI. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Brain className="h-8 w-8 text-blue-400" />
                  <span className="text-xl font-bold">EvalAI Pro</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Revolutionary AI-powered answer sheet evaluation system for educational institutions worldwide.
                </p>
                <div className="flex space-x-4">
                  <Github className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                  <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                  <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                  <Mail className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="#features" className="hover:text-white transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="hover:text-white transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      API Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Integrations
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Security
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Press Kit
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Community Forum
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      System Status
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Training Resources
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Webinars
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-center md:text-left">&copy; 2024 EvalAI Pro. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* Login Modal */}
        {activeTab === "login" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Sign In to EvalAI Pro</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("home")}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-gray-600">Choose your role to access the platform</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full h-12" onClick={() => handleLogin("admin")}>
                  <Settings className="mr-2 h-5 w-5" />
                  Sign in as Administrator
                </Button>
                <Button className="w-full h-12 bg-transparent" variant="outline" onClick={() => handleLogin("teacher")}>
                  <BookOpen className="mr-2 h-5 w-5" />
                  Sign in as Teacher
                </Button>
                <Button className="w-full h-12 bg-transparent" variant="outline" onClick={() => handleLogin("student")}>
                  <Users className="mr-2 h-5 w-5" />
                  Sign in as Student
                </Button>
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Sign up here
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Demo Modal */}
        {activeTab === "demo" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Live Demo - AI Answer Evaluation</h2>
                    <p className="text-gray-600">Experience our AI evaluation system in action</p>
                  </div>
                  <Button variant="ghost" onClick={() => setActiveTab("home")}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AdvancedUploadSection userRole="demo" />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  // Authenticated User Interface
  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <MainSidebar />
      <SidebarInset className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-8 w-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">EvalAI Pro</h1>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  v3.0 Production
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="capitalize">
                  {userRole} Dashboard
                </Badge>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* System Status Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"} rounded-full`}
                  ></div>
                  <span>System Online</span>
                </div>
                <span>Evaluations: {systemStats.totalEvaluations.toLocaleString()}</span>
                <span>Accuracy: {systemStats.accuracyRate}%</span>
                <span>Active Users: {systemStats.activeUsers}</span>
                <span>Avg Processing: {systemStats.processingTime}s</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>AI Models: 15 Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 gap-1">
              <TabsTrigger value="dashboard" className="flex items-center gap-1 text-xs">
                <BarChart3 className="h-3 w-3" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-1 text-xs">
                <Upload className="h-3 w-3" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="ocr" className="flex items-center gap-1 text-xs">
                <Scan className="h-3 w-3" />
                <span className="hidden sm:inline">OCR</span>
              </TabsTrigger>
              <TabsTrigger value="evaluation" className="flex items-center gap-1 text-xs">
                <Brain className="h-3 w-3" />
                <span className="hidden sm:inline">AI Eval</span>
              </TabsTrigger>
              <TabsTrigger value="rubrics" className="flex items-center gap-1 text-xs">
                <FileText className="h-3 w-3" />
                <span className="hidden sm:inline">Rubrics</span>
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-1 text-xs">
                <MessageSquare className="h-3 w-3" />
                <span className="hidden sm:inline">Feedback</span>
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-1 text-xs">
                <Award className="h-3 w-3" />
                <span className="hidden sm:inline">Results</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-1 text-xs">
                <Brain className="h-3 w-3" />
                <span className="hidden sm:inline">Models</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1 text-xs">
                <Shield className="h-3 w-3" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="explainable" className="flex items-center gap-1 text-xs">
                <Eye className="h-3 w-3" />
                <span className="hidden sm:inline">XAI</span>
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex items-center gap-1 text-xs">
                <BookOpen className="h-3 w-3" />
                <span className="hidden sm:inline">Learning</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="dashboard" className="space-y-6">
              {userRole === "admin" && <AdminDashboard />}
              {userRole === "teacher" && <TeacherDashboard />}
              {userRole === "student" && <StudentPortal />}
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <AdvancedUploadSection userRole={userRole} />
            </TabsContent>

            <TabsContent value="ocr" className="space-y-6">
              <OCRProcessingEngine />
            </TabsContent>

            <TabsContent value="evaluation" className="space-y-6">
              <AIEvaluationEngine />
            </TabsContent>

            <TabsContent value="rubrics" className="space-y-6">
              <RubricManagement userRole={userRole} />
            </TabsContent>

            <TabsContent value="feedback" className="space-y-6">
              <FeedbackGeneration />
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <EvaluationResults />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsReports userRole={userRole} />
            </TabsContent>

            <TabsContent value="models" className="space-y-6">
              <AIModelHub />
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <SecurityCompliance />
            </TabsContent>

            <TabsContent value="explainable" className="space-y-6">
              <ExplainableAI />
            </TabsContent>

            <TabsContent value="learning" className="space-y-6">
              <ContinuousLearning />
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </div>
  )
}
