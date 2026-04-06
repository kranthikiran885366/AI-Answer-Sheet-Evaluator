import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const file = formData.get("file") as File
    const studentName = formData.get("studentName") as string
    const subject = formData.get("subject") as string
    const examType = formData.get("examType") as string
    const rubric = formData.get("rubric") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/tiff", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, TIFF, or PDF." }, { status: 400 })
    }

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum 50MB." }, { status: 400 })
    }

    const sessionId = crypto.randomUUID()
    const uploadDir = path.join(process.cwd(), "uploads", sessionId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const ext = file.name.split(".").pop() || "jpg"
    const safeName = `answer_sheet.${ext}`
    const bytes = await file.arrayBuffer()
    await writeFile(path.join(uploadDir, safeName), Buffer.from(bytes))

    const metaPath = path.join(uploadDir, "meta.json")
    await writeFile(metaPath, JSON.stringify({
      sessionId,
      studentName: studentName || "Unknown",
      subject: subject || "General",
      examType: examType || "Exam",
      rubric: rubric || "",
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      status: "uploaded",
    }))

    return NextResponse.json({
      success: true,
      sessionId,
      message: "File uploaded successfully. Start evaluation at /api/evaluate.",
    })
  } catch (err: any) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Upload failed: " + err.message }, { status: 500 })
  }
}
