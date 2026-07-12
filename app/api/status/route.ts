import { NextRequest, NextResponse } from "next/server"
import { existsSync, readdirSync, readFileSync } from "fs"
import path from "path"
import os from "os"
import { loadEvaluations, getStatistics } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // Load evaluations data
    await loadEvaluations()

    const uploadsDir = path.join(process.cwd(), "uploads")
    let totalSessions = 0
    let completedSessions = 0
    let processingSessions = 0
    let failedSessions = 0

    if (existsSync(uploadsDir)) {
      const sessions = readdirSync(uploadsDir)
      totalSessions = sessions.length

      for (const session of sessions) {
        const metaPath = path.join(uploadsDir, session, "meta.json")
        if (existsSync(metaPath)) {
          try {
            const meta = JSON.parse(readFileSync(metaPath, "utf-8"))
            if (meta.status === "completed") completedSessions++
            else if (meta.status === "processing") processingSessions++
            else if (meta.status === "failed") failedSessions++
          } catch (error) {
            console.error(`Error reading meta for session ${session}:`, error)
          }
        }
      }
    }

    // Get global statistics
    const globalStats = await getStatistics()

    const uptimeSeconds = process.uptime()
    const uptimeHours = Math.floor(uptimeSeconds / 3600)
    const uptimeMins = Math.floor((uptimeSeconds % 3600) / 60)

    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMemPct = Math.round(((totalMem - freeMem) / totalMem) * 100)

    return NextResponse.json({
      success: true,
      status: "operational",
      version: "3.0.0",
      uptime: `${uptimeHours}h ${uptimeMins}m`,
      aiProviders: {
        openai: !!process.env.OPENAI_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        active: process.env.OPENAI_API_KEY
          ? "OpenAI"
          : process.env.GEMINI_API_KEY
            ? "Gemini"
            : "Demo Mode",
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        processing: processingSessions,
        failed: failedSessions,
        pending: totalSessions - completedSessions - processingSessions - failedSessions,
      },
      evaluations: globalStats,
      system: {
        platform: os.platform(),
        nodeVersion: process.version,
        memory: {
          totalMB: Math.round(totalMem / 1024 / 1024),
          usedMB: Math.round((totalMem - freeMem) / 1024 / 1024),
          freeMB: Math.round(freeMem / 1024 / 1024),
          usedPercent: usedMemPct,
        },
        cpus: os.cpus().length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error("Status endpoint error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to get system status" },
      { status: 500 }
    )
  }
}
