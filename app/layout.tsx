import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { WebSocketProvider } from "@/components/websocket-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EvalAI Pro - AI-Powered Answer Sheet Evaluator",
  description: "Advanced AI system for automated answer sheet evaluation with OCR and intelligent grading",
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
            {children}
            <Toaster />
          </WebSocketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
