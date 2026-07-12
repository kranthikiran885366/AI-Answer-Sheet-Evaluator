import { NextRequest, NextResponse } from "next/server"
import { readFile, writeFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { spawn } from "child_process"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import { getEvaluationBySessionId } from "@/lib/db"

export async function POST(req: NextRequest) {
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

    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      )
    }

    // Check session directory exists
    const uploadDir = path.join(process.cwd(), "uploads", sessionId)
    if (!existsSync(uploadDir)) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Read metadata
    const metaPath = path.join(uploadDir, "meta.json")
    const metaRaw = await readFile(metaPath, "utf-8")
    const meta = JSON.parse(metaRaw)

    // Get evaluation record
    const evaluation = await getEvaluationBySessionId(sessionId)
    if (!evaluation) {
      return NextResponse.json(
        { error: "Evaluation record not found" },
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

    // Update status to processing
    await writeFile(metaPath, JSON.stringify({ ...meta, status: "processing" }))

    // Get image path
    const ext = meta.fileName.split(".").pop()?.toLowerCase()
    const imagePath = path.join(uploadDir, `answer_sheet.${ext}`)

    // Trigger Python backend asynchronously
    triggerPythonEvaluation(
      evaluation.id,
      imagePath,
      meta.subject,
      meta.rubric,
      sessionId
    ).catch((err) => console.error("Background evaluation error:", err))

    return NextResponse.json({
      success: true,
      sessionId,
      evaluationId: evaluation.id,
      status: "processing",
      message: "Evaluation processing started. Check /api/results/{sessionId} for updates",
    })
  } catch (err: any) {
    console.error("Evaluate route error:", err)
    return NextResponse.json(
      { error: err.message || "Evaluation failed" },
      { status: 500 }
    )
  }
}

function triggerPythonEvaluation(
  evalId: string,
  imagePath: string,
  subject: string,
  rubric: string,
  sessionId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(
      process.cwd(),
      "backend/evaluation_runner.py"
    )

    const args = [
      pythonScript,
      "--eval-id",
      evalId,
      "--image-path",
      imagePath,
      "--subject",
      subject,
      "--session-id",
      sessionId,
    ]

    if (rubric) {
      args.push("--rubric", rubric)
    }

    const pythonProcess = spawn("python3", args, {
      detached: true,
      stdio: "ignore",
    })

    pythonProcess.unref()
    resolve()
  })
}
