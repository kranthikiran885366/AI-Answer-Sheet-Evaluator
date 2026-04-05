import { NextResponse } from "next/server"
import { existsSync, readdirSync, readFileSync } from "fs"
import path from "path"
import os from "os"

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads")
    let totalSessions = 0
    let completedSessions = 0

    if (existsSync(uploadsDir)) {
      const sessions = readdirSync(uploadsDir)
      totalSessions = sessions.length

      for (const session of sessions) {
        const metaPath = path.join(uploadsDir, session, "meta.json")
        if (existsSync(metaPath)) {
          try {
            const meta = JSON.parse(readFileSync(metaPath, "utf-8"))
            if (meta.status === "completed") completedSessions++
          } catch {}
        }
      }
    }

    const uptimeSeconds = process.uptime()
    const uptimeHours = Math.floor(uptimeSeconds / 3600)
    const uptimeMins = Math.floor((uptimeSeconds % 3600) / 60)

    return NextResponse.json({
      status: "online",
      version: "1.0.0",
      uptime: `${uptimeHours}h ${uptimeMins}m`,
      aiProviders: {
        openai: !!process.env.OPENAI_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
      },
      stats: {
        totalSessions,
        completedSessions,
        activeSessions: totalSessions - completedSessions,
      },
      system: {
        platform: os.platform(),
        memory: {
          totalMB: Math.round(os.totalmem() / 1024 / 1024),
          freeMB: Math.round(os.freemem() / 1024 / 1024),
        },
        cpus: os.cpus().length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
