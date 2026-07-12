import { NextRequest, NextResponse } from "next/server"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import { getStatistics, loadEvaluations } from "@/lib/db"
import os from "os"

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = getTokenFromHeader(req.headers.get("authorization"))
    if (!token) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    // Load evaluations
    await loadEvaluations()

    // Get user statistics
    const stats = await getStatistics(decoded.id)

    // Get system metrics
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMemPct = Math.round(((totalMem - freeMem) / totalMem) * 100)

    const cpus = os.cpus()
    let cpuUsage = 0
    if (cpus.length > 0) {
      const cpu = cpus[0]
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0)
      cpuUsage = Math.round(((total - cpu.times.idle) / total) * 100)
    }

    const uptimeSeconds = process.uptime()
    const uptimeHours = Math.floor(uptimeSeconds / 3600)
    const uptimeMins = Math.floor((uptimeSeconds % 3600) / 60)

    return NextResponse.json({
      success: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      },
      statistics: stats,
      system: {
        cpu: cpuUsage,
        memory: usedMemPct,
        uptime: `${uptimeHours}h ${uptimeMins}m`,
        platform: os.platform(),
        cpuCount: cpus.length,
      },
      aiProviders: {
        openai: !!process.env.OPENAI_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        active: process.env.OPENAI_API_KEY
          ? "OpenAI GPT-4o"
          : process.env.GEMINI_API_KEY
            ? "Gemini Flash"
            : "Demo Mode",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error("Dashboard stats error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
