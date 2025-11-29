import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-xl font-bold text-green-900">EvalAI Pro</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-green-700 hover:text-green-900 font-medium text-sm">Dashboard</Link>
            <Link href="/upload" className="text-green-700 hover:text-green-900 font-medium text-sm">Upload</Link>
            <Link href="#features" className="text-green-700 hover:text-green-900 font-medium text-sm">Features</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">New Release</Badge>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-green-900 leading-tight">
                AI-Powered Answer Evaluation
              </h1>
              <p className="text-xl text-green-700 leading-relaxed">
                Automate your grading process with advanced OCR, intelligent LLM evaluation, and comprehensive analytics. Perfect for schools, universities, and educational institutions.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
                <Link href="/dashboard">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-green-300 text-green-700 hover:bg-green-50">
                <Link href="/upload">Try Demo</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-8">
              <div className="p-4 rounded-xl bg-white border border-green-200 shadow-sm hover:shadow-md transition">
                <p className="text-sm font-semibold text-green-900">OCR Engine</p>
                <p className="text-xs text-green-600 mt-1">Advanced text extraction</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-green-200 shadow-sm hover:shadow-md transition">
                <p className="text-sm font-semibold text-green-900">LLM Integration</p>
                <p className="text-xs text-green-600 mt-1">Smart evaluation</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-green-200 shadow-sm hover:shadow-md transition">
                <p className="text-sm font-semibold text-green-900">Real-time Sync</p>
                <p className="text-xs text-green-600 mt-1">WebSocket updates</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-green-200 shadow-sm hover:shadow-md transition">
                <p className="text-sm font-semibold text-green-900">Analytics</p>
                <p className="text-xs text-green-600 mt-1">Detailed insights</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-200/50 to-green-100/50 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-green-200">
              <div className="aspect-square bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center">
                <Image 
                  src="/hero-illustration.svg" 
                  alt="EvalAI Pro Dashboard" 
                  width={400} 
                  height={400} 
                  priority 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-green-50 border-y border-green-200 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-green-900">10K+</p>
              <p className="text-green-700 mt-2">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-green-900">1M+</p>
              <p className="text-green-700 mt-2">Documents Processed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-green-900">99%</p>
              <p className="text-green-700 mt-2">Accuracy Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-green-900">50+</p>
              <p className="text-green-700 mt-2">Institutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-green-900 text-center mb-4">Powerful Features</h2>
        <p className="text-green-700 text-center mb-16 max-w-2xl mx-auto">
          Everything you need to automate and streamline your educational assessment process
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 border border-green-200 hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Advanced OCR</h3>
            <p className="text-green-700">
              State-of-the-art optical character recognition that accurately extracts text from handwritten and printed documents.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 border border-green-200 hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5.36 4.24l-.707-.707M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">AI Evaluation</h3>
            <p className="text-green-700">
              Intelligent grading using multiple LLM providers with explainable results and detailed feedback for learners.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 border border-green-200 hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Rich Analytics</h3>
            <p className="text-green-700">
              Comprehensive dashboards with performance metrics, progress tracking, and actionable insights for educators.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-8 border border-green-200 hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Real-time Updates</h3>
            <p className="text-green-700">
              WebSocket-powered live synchronization keeps all dashboards updated instantly as evaluations complete.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-8 border border-green-200 hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Custom Rubrics</h3>
            <p className="text-green-700">
              Create and apply flexible evaluation rubrics tailored to your specific assessment requirements and standards.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-8 border border-green-200 hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2">Secure & Scalable</h3>
            <p className="text-green-700">
              Enterprise-grade security with role-based access, encryption, and scalable infrastructure for institutions of any size.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-green-50 border-y border-green-200 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-green-900 text-center mb-16">Who Uses EvalAI Pro</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-green-200">
              <h3 className="text-2xl font-bold text-green-900 mb-4">Schools & Universities</h3>
              <p className="text-green-700 mb-4">
                Streamline assessment workflows and provide immediate feedback to students across all departments.
              </p>
              <ul className="space-y-2 text-sm text-green-700">
                <li>✓ Automated grading</li>
                <li>✓ Progress tracking</li>
                <li>✓ Performance analytics</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-green-200">
              <h3 className="text-2xl font-bold text-green-900 mb-4">Educational Platforms</h3>
              <p className="text-green-700 mb-4">
                Enhance your platform with AI-powered evaluation capabilities without building from scratch.
              </p>
              <ul className="space-y-2 text-sm text-green-700">
                <li>✓ API integration</li>
                <li>✓ Custom branding</li>
                <li>✓ White-label options</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-green-200">
              <h3 className="text-2xl font-bold text-green-900 mb-4">Assessment Services</h3>
              <p className="text-green-700 mb-4">
                Scale your evaluation capabilities with automated processing and comprehensive reporting.
              </p>
              <ul className="space-y-2 text-sm text-green-700">
                <li>✓ Bulk processing</li>
                <li>✓ Detailed reports</li>
                <li>✓ Quality assurance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-12 md:p-16 text-white">
          <h2 className="text-4xl font-bold text-center mb-4">Ready to Transform Education?</h2>
          <p className="text-green-100 text-center text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of educators and institutions using EvalAI Pro to save time and improve student outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-green-700 hover:bg-green-50 font-semibold">
              <Link href="/dashboard">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-green-500">
              <Link href="#contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-200 bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-green-900 font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-green-700 text-sm">
                <li><Link href="#" className="hover:text-green-900">Features</Link></li>
                <li><Link href="#" className="hover:text-green-900">Pricing</Link></li>
                <li><Link href="#" className="hover:text-green-900">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-green-900 font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-green-700 text-sm">
                <li><Link href="#" className="hover:text-green-900">About</Link></li>
                <li><Link href="#" className="hover:text-green-900">Blog</Link></li>
                <li><Link href="#" className="hover:text-green-900">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-green-900 font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-green-700 text-sm">
                <li><Link href="#" className="hover:text-green-900">Documentation</Link></li>
                <li><Link href="#" className="hover:text-green-900">Help Center</Link></li>
                <li><Link href="#" className="hover:text-green-900">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-green-900 font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-green-700 text-sm">
                <li><Link href="#" className="hover:text-green-900">Privacy</Link></li>
                <li><Link href="#" className="hover:text-green-900">Terms</Link></li>
                <li><Link href="#" className="hover:text-green-900">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-200 pt-8 text-center text-green-700 text-sm">
            <p>&copy; 2024 EvalAI Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
