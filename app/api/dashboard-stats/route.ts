import { NextResponse } from "next/server"
import { getDashboardStats } from "@/lib/evaluations"
import os from "os"

export async function GET() {
  try {
    const stats = getDashboardStats()

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
      ...stats,
      system: {
        cpu: cpuUsage,
        memory: usedMemPct,
        uptime: `${uptimeHours}h ${uptimeMins}m`,
        platform: os.platform(),
        cpuCount: cpus.length,
      },
      aiProvider: {
        openai: !!process.env.OPENAI_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        active: process.env.OPENAI_API_KEY ? "OpenAI GPT-4o" : process.env.GEMINI_API_KEY ? "Gemini Flash" : "Demo Mode",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
