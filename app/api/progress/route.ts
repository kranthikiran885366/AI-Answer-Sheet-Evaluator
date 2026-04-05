import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const steps = [
        { step: "upload_received", message: "File received and validated", progress: 10, delay: 400 },
        { step: "ocr_starting", message: "Starting OCR text extraction...", progress: 20, delay: 600 },
        { step: "ocr_processing", message: "Extracting text from image...", progress: 40, delay: 1200 },
        { step: "ocr_complete", message: "Text extraction complete", progress: 55, delay: 500 },
        { step: "ai_starting", message: "Sending to AI for evaluation...", progress: 65, delay: 600 },
        { step: "ai_processing", message: "AI is evaluating answers against rubric...", progress: 80, delay: 1500 },
        { step: "scoring", message: "Computing scores and generating feedback...", progress: 90, delay: 700 },
        { step: "complete", message: "Evaluation complete!", progress: 100, delay: 300 },
      ]

      for (const step of steps) {
        await new Promise((r) => setTimeout(r, step.delay))
        send({ sessionId, step: step.step, message: step.message, progress: step.progress, timestamp: new Date().toISOString() })
        if (step.step === "complete") break
      }

      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
