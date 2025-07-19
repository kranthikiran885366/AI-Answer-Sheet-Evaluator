import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { WebSocketProvider } from "@/components/websocket-provider"
import { MainSidebar } from "./components/main-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "EvalAI Pro - AI-Powered Answer Sheet Evaluator",
  description:
    "Advanced AI system for automated evaluation of answer sheets with OCR, machine learning, and comprehensive analytics.",
  keywords: ["AI", "education", "evaluation", "OCR", "machine learning", "answer sheets", "grading"],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <WebSocketProvider>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                <MainSidebar userRole="admin" />
                <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">{children}</main>
              </div>
              <Toaster />
            </SidebarProvider>
          </WebSocketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
