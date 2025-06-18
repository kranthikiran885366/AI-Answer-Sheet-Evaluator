import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { WebSocketProvider } from "@/components/websocket-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Answer Script Evaluator",
  description: "Advanced AI-powered answer script evaluation system",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
