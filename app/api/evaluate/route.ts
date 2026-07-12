import { NextRequest, NextResponse } from "next/server"
import { readFile, writeFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import { processEvaluation } from "@/lib/evaluation-engine"
import { updateEvaluationStatus, getEvaluationBySessionId } from "@/lib/db"

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
    await updateEvaluationStatus(evaluation.id, "processing")
    await writeFile(metaPath, JSON.stringify({ ...meta, status: "processing" }))

    try {
      // Get image path
      const ext = meta.fileName.split(".").pop()?.toLowerCase()
      const imagePath = path.join(uploadDir, `answer_sheet.${ext}`)

      // Process evaluation
      const result = await processEvaluation(
        {
          extractedText: "",
          subject: meta.subject,
          studentName: meta.studentName,
          examType: meta.examType,
          rubric: meta.rubric,
        },
        imagePath
      )

      // Save result
      const fullResult = {
        ...result,
        sessionId,
        studentName: meta.studentName,
        subject: meta.subject,
        examType: meta.examType,
      }

      await writeFile(path.join(uploadDir, "result.json"), JSON.stringify(fullResult))

      // Update database
      await updateEvaluationStatus(
        evaluation.id,
        "completed",
        result,
        result.extractedText || meta.extractedText
      )

      await writeFile(metaPath, JSON.stringify({ ...meta, status: "completed" }))

      return NextResponse.json({
        success: true,
        sessionId,
        result: fullResult,
        message: "Evaluation completed successfully",
      })
    } catch (processingError: any) {
      console.error("Evaluation processing error:", processingError)

      // Update status to failed
      await updateEvaluationStatus(
        evaluation.id,
        "failed",
        undefined,
        undefined,
        processingError.message
      )

      await writeFile(metaPath, JSON.stringify({ ...meta, status: "failed" }))

      return NextResponse.json(
        { error: `Evaluation processing failed: ${processingError.message}` },
        { status: 500 }
      )
    }
  } catch (err: any) {
    console.error("Evaluate route error:", err)
    return NextResponse.json(
      { error: err.message || "Evaluation failed" },
      { status: 500 }
    )
  }
}
