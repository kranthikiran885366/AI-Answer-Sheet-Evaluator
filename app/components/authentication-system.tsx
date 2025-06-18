"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Brain,
  User,
  Users,
  GraduationCap,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Building,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Zap,
  FileText,
} from "lucide-react"

interface AuthenticationSystemProps {
  onLogin: (role: "admin" | "teacher" | "student") => void
}

export function AuthenticationSystem({ onLogin }: AuthenticationSystemProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    role: "",
    rememberMe: false,
  })
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    institution: "",
    phone: "",
    address: "",
    agreeToTerms: false,
  })

  const roles = [
    {
      id: "admin",
      name: "Administrator",
      description: "Full system access and management",
      icon: <Shield className="h-6 w-6" />,
      color: "bg-red-500",
      features: ["User Management", "System Configuration", "Analytics", "Security Controls"],
    },
    {
      id: "teacher",
      name: "Teacher/Evaluator",
      description: "Create rubrics and evaluate answers",
      icon: <Users className="h-6 w-6" />,
      color: "bg-blue-500",
      features: ["Upload Scripts", "Create Rubrics", "View Results", "Generate Reports"],
    },
    {
      id: "student",
      name: "Student",
      description: "View results and feedback",
      icon: <GraduationCap className="h-6 w-6" />,
      color: "bg-green-500",
      features: ["View Scores", "Access Feedback", "Track Progress", "Download Reports"],
    },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password || !loginForm.role) return

    setIsLoading(true)

    // Simulate authentication
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    onLogin(loginForm.role as "admin" | "teacher" | "student")
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signupForm.firstName || !signupForm.email || !signupForm.password || !signupForm.role) return
    if (signupForm.password !== signupForm.confirmPassword) return
    if (!signupForm.agreeToTerms) return

    setIsLoading(true)

    // Simulate registration
    await new Promise((resolve) => setTimeout(resolve, 2500))

    setIsLoading(false)
    onLogin(signupForm.role as "admin" | "teacher" | "student")
  }

  const handleDemoLogin = (role: "admin" | "teacher" | "student") => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLogin(role)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">AI Answer Evaluator</h1>
          </div>
          <p className="text-xl text-gray-600">Advanced AI-powered answer sheet evaluation system</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              99.2% Accuracy
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Zap className="h-3 w-3 mr-1" />
              Real-time Processing
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Shield className="h-3 w-3 mr-1" />
              Secure & Private
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Authentication Forms */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>Sign in to access your AI evaluation dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* Login Tab */}
                  <TabsContent value="login" className="space-y-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter your email"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            value={loginForm.password}
                            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                            placeholder="Enter your password"
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="login-role">Role</Label>
                        <Select
                          value={loginForm.role}
                          onValueChange={(value) => setLoginForm((prev) => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                <div className="flex items-center gap-2">
                                  {role.icon}
                                  <span>{role.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={loginForm.rememberMe}
                          onCheckedChange={(checked) =>
                            setLoginForm((prev) => ({ ...prev, rememberMe: checked as boolean }))
                          }
                        />
                        <Label htmlFor="remember-me" className="text-sm">
                          Remember me
                        </Label>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>

                    <div className="text-center">
                      <Button variant="link" className="text-sm">
                        Forgot your password?
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Signup Tab */}
                  <TabsContent value="signup" className="space-y-6">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first-name">First Name</Label>
                          <Input
                            id="first-name"
                            value={signupForm.firstName}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, firstName: e.target.value }))}
                            placeholder="John"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input
                            id="last-name"
                            value={signupForm.lastName}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Doe"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="signup-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            value={signupForm.email}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="john.doe@example.com"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="signup-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              value={signupForm.password}
                              onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                              placeholder="Create password"
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm Password</Label>
                          <Input
                            id="confirm-password"
                            type={showPassword ? "text" : "password"}
                            value={signupForm.confirmPassword}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm password"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="signup-role">Role</Label>
                        <Select
                          value={signupForm.role}
                          onValueChange={(value) => setSignupForm((prev) => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                <div className="flex items-center gap-2">
                                  {role.icon}
                                  <span>{role.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="institution">Institution</Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="institution"
                              value={signupForm.institution}
                              onChange={(e) => setSignupForm((prev) => ({ ...prev, institution: e.target.value }))}
                              placeholder="School/University"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="phone"
                              value={signupForm.phone}
                              onChange={(e) => setSignupForm((prev) => ({ ...prev, phone: e.target.value }))}
                              placeholder="+1 (555) 123-4567"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="address"
                            value={signupForm.address}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, address: e.target.value }))}
                            placeholder="City, State, Country"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agree-terms"
                          checked={signupForm.agreeToTerms}
                          onCheckedChange={(checked) =>
                            setSignupForm((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                          }
                        />
                        <Label htmlFor="agree-terms" className="text-sm">
                          I agree to the{" "}
                          <Button variant="link" className="p-0 h-auto text-sm">
                            Terms of Service
                          </Button>{" "}
                          and{" "}
                          <Button variant="link" className="p-0 h-auto text-sm">
                            Privacy Policy
                          </Button>
                        </Label>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <Separator className="my-6" />

                {/* Demo Access */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">Try Demo Access</h4>
                    <p className="text-sm text-gray-600 mb-4">Experience the system with different user roles</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {roles.map((role) => (
                      <Button
                        key={role.id}
                        variant="outline"
                        onClick={() => handleDemoLogin(role.id as "admin" | "teacher" | "student")}
                        disabled={isLoading}
                        className="flex flex-col items-center gap-2 h-auto py-4"
                      >
                        <div className={`p-2 rounded-lg ${role.color} text-white`}>{role.icon}</div>
                        <span className="font-medium">{role.name}</span>
                        <span className="text-xs text-gray-500">Demo Access</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Panel */}
          <div className="space-y-6">
            {/* Role Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Roles & Features
                </CardTitle>
                <CardDescription>Choose the role that best fits your needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${role.color} text-white`}>{role.icon}</div>
                      <div>
                        <h4 className="font-semibold">{role.name}</h4>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {role.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* System Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  System Features
                </CardTitle>
                <CardDescription>Advanced AI-powered capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Multi-language OCR recognition",
                  "Semantic answer evaluation",
                  "Custom rubric creation",
                  "Real-time feedback generation",
                  "Plagiarism detection",
                  "Bias-free evaluation",
                  "Explainable AI results",
                  "Continuous learning system",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Security & Privacy</AlertTitle>
              <AlertDescription>
                Your data is protected with enterprise-grade security. All evaluations are processed securely and
                deleted after completion.
              </AlertDescription>
            </Alert>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
