import { NextRequest, NextResponse } from "next/server"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import { getUserEvaluations, loadEvaluations } from "@/lib/db"

export async function GET(req: NextRequest) {
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

    // Load evaluations
    await loadEvaluations()

    // Get user evaluations
    const evaluations = await getUserEvaluations(decoded.id)

    // Calculate analytics
    const completed = evaluations.filter(e => e.status === "completed")
    const bySubject: Record<string, number> = {}
    const byGrade: Record<string, number> = {}
    const confidenceScores: number[] = []
    const processingTimes: number[] = []
    const marksDistribution: Record<string, number> = {}

    for (const evaluation of completed) {
      if (!evaluation.result) continue

      // Subject distribution
      bySubject[evaluation.subject] = (bySubject[evaluation.subject] || 0) + 1

      // Grade distribution
      const grade = evaluation.result.grade || "N/A"
      byGrade[grade] = (byGrade[grade] || 0) + 1

      // Confidence scores
      confidenceScores.push(evaluation.result.confidenceScore || 0)

      // Processing times
      processingTimes.push(evaluation.result.processingTime || 0)

      // Marks distribution (in 10-point buckets)
      const bucket = Math.floor(evaluation.result.percentage / 10) * 10
      const label = `${bucket}-${bucket + 10}`
      marksDistribution[label] = (marksDistribution[label] || 0) + 1
    }

    // Calculate averages and statistics
    const avgConfidence =
      confidenceScores.length > 0
        ? Math.round(
            (confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length) * 100
          ) / 100
        : 0

    const avgProcessingTime =
      processingTimes.length > 0
        ? Math.round(
            (processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length) * 100
          ) / 100
        : 0

    const avgMarks =
      completed.length > 0
        ? Math.round(
            (completed.reduce((sum, e) => sum + (e.result?.percentage || 0), 0) /
              completed.length) *
              100
          ) / 100
        : 0

    // Calculate trends (comparing last 7 evaluations with previous 7)
    const recent7 = completed.slice(-7)
    const previous7 = completed.slice(-14, -7)

    const recentAvgMarks =
      recent7.length > 0
        ? recent7.reduce((sum, e) => sum + (e.result?.percentage || 0), 0) / recent7.length
        : 0

    const previousAvgMarks =
      previous7.length > 0
        ? previous7.reduce((sum, e) => sum + (e.result?.percentage || 0), 0) / previous7.length
        : 0

    const marksTrend = previousAvgMarks > 0 ? recentAvgMarks - previousAvgMarks : 0

    // Timeline data (grouped by date)
    const timeline: Record<string, number> = {}
    for (const evaluation of completed) {
      const date = new Date(evaluation.uploadedAt).toISOString().split("T")[0]
      timeline[date] = (timeline[date] || 0) + 1
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalEvaluations: evaluations.length,
        completedEvaluations: completed.length,
        pendingEvaluations: evaluations.filter(e => e.status !== "completed").length,
        averageMarks: avgMarks,
        averageConfidence: avgConfidence,
        averageProcessingTime: avgProcessingTime,
      },
      distributions: {
        bySubject,
        byGrade,
        marksDistribution,
      },
      trends: {
        marksTrend,
        recentEvaluations: recent7.length,
        previousEvaluations: previous7.length,
      },
      timeline,
      confidenceScores: {
        min: confidenceScores.length > 0 ? Math.min(...confidenceScores) : 0,
        max: confidenceScores.length > 0 ? Math.max(...confidenceScores) : 0,
        average: avgConfidence,
      },
      processingTimes: {
        min: processingTimes.length > 0 ? Math.min(...processingTimes) : 0,
        max: processingTimes.length > 0 ? Math.max(...processingTimes) : 0,
        average: avgProcessingTime,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error("Analytics error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
