import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id
    if (!sessionId || !/^[a-f0-9-]{36}$/.test(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "uploads", sessionId)
    if (!existsSync(uploadDir)) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const metaRaw = await readFile(path.join(uploadDir, "meta.json"), "utf-8")
    const meta = JSON.parse(metaRaw)

    const resultPath = path.join(uploadDir, "result.json")
    if (!existsSync(resultPath)) {
      return NextResponse.json({ sessionId, status: meta.status, meta })
    }

    const resultRaw = await readFile(resultPath, "utf-8")
    const result = JSON.parse(resultRaw)

    return NextResponse.json({ sessionId, status: "completed", meta, result })
  } catch (err: any) {
    console.error("Results fetch error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
