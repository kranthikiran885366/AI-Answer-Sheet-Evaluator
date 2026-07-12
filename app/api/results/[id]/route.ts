import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import { getEvaluation, getEvaluationBySessionId } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sessionId = params.id
    if (!sessionId) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      )
    }

    // Get evaluation from database
    const evaluation = await getEvaluationBySessionId(sessionId)
    if (!evaluation) {
      return NextResponse.json(
        { error: "Evaluation not found" },
        { status: 404 }
      )
    }

    // Check access
    if (evaluation.userId !== decoded.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Try to read from file system for additional data
    const uploadDir = path.join(process.cwd(), "uploads", sessionId)
    let fileData: any = null

    if (existsSync(uploadDir)) {
      const resultPath = path.join(uploadDir, "result.json")
      if (existsSync(resultPath)) {
        try {
          const resultRaw = await readFile(resultPath, "utf-8")
          fileData = JSON.parse(resultRaw)
        } catch (e) {
          console.error("Error reading result file:", e)
        }
      }
    }

    return NextResponse.json({
      success: true,
      sessionId,
      evaluation,
      fileData: fileData || null,
    })
  } catch (err: any) {
    console.error("Results fetch error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to fetch results" },
      { status: 500 }
    )
  }
}
