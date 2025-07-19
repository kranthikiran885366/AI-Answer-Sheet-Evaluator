import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { WebSocketProvider } from "@/components/websocket-provider"
import { SidebarProvider } from "@/components/ui/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EvalAI Pro - AI Answer Sheet Evaluator",
  description:
    "Revolutionary AI-powered answer sheet evaluation system with real-time processing and advanced analytics",
  keywords: "AI, education, evaluation, grading, OCR, machine learning, assessment",
  authors: [{ name: "EvalAI Pro Team" }],
  viewport: "width=device-width, initial-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <WebSocketProvider>
            <SidebarProvider>
              {children}
              <Toaster />
            </SidebarProvider>
          </WebSocketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
