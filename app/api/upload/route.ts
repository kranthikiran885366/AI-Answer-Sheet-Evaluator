import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import crypto from "crypto"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import { createEvaluation, loadEvaluations } from "@/lib/db"

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

    // Load evaluations from file
    await loadEvaluations()

    // Parse form data
    const formData = await req.formData()

    const file = formData.get("file") as File
    const studentName = (formData.get("studentName") as string) || "Unknown"
    const subject = (formData.get("subject") as string) || "General"
    const examType = (formData.get("examType") as string) || "Exam"
    const rubric = (formData.get("rubric") as string) || ""

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/tiff",
      "application/pdf",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPG, PNG, TIFF, or PDF." },
        { status: 400 }
      )
    }

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum 50MB." },
        { status: 400 }
      )
    }

    // Create session directory
    const sessionId = crypto.randomUUID()
    const uploadDir = path.join(process.cwd(), "uploads", sessionId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file
    const ext = file.name.split(".").pop() || "jpg"
    const safeName = `answer_sheet.${ext}`
    const bytes = await file.arrayBuffer()
    await writeFile(path.join(uploadDir, safeName), Buffer.from(bytes))

    // Save metadata
    const metaPath = path.join(uploadDir, "meta.json")
    await writeFile(
      metaPath,
      JSON.stringify({
        sessionId,
        studentName,
        subject,
        examType,
        rubric,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: "uploaded",
      })
    )

    // Create evaluation record in database
    const evaluation = await createEvaluation(decoded.id, sessionId, {
      studentName,
      subject,
      examType,
      fileName: file.name,
      fileSize: file.size,
      rubric: rubric || undefined,
    })

    return NextResponse.json(
      {
        success: true,
        sessionId,
        evaluationId: evaluation.id,
        message: "File uploaded successfully. Start evaluation at /api/evaluate.",
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error("Upload error:", err)
    return NextResponse.json(
      { error: "Upload failed: " + err.message },
      { status: 500 }
    )
  }
}
