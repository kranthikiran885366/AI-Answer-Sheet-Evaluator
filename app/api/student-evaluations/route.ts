import { NextRequest, NextResponse } from "next/server"
import { getAllEvaluations } from "@/lib/evaluations"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const studentName = searchParams.get("student")
    const subject = searchParams.get("subject")
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    let evaluations = getAllEvaluations()

    if (studentName) {
      evaluations = evaluations.filter((e) =>
        e.studentName.toLowerCase().includes(studentName.toLowerCase())
      )
    }

    if (subject) {
      evaluations = evaluations.filter((e) =>
        e.subject.toLowerCase().includes(subject.toLowerCase())
      )
    }

    const trimmed = evaluations.slice(0, limit).map((e) => ({
      id: e.sessionId,
      studentName: e.studentName,
      subject: e.subject,
      examType: e.examType,
      date: e.evaluationDate,
      score: e.obtainedMarks,
      maxScore: e.totalMarks,
      percentage: e.percentage,
      grade: e.grade,
      feedback: e.overallFeedback,
      strengths: e.strengths,
      improvements: e.improvements,
      status: "completed",
      aiProvider: e.aiProvider,
    }))

    const totalScore = evaluations.reduce((sum, e) => sum + (e.percentage || 0), 0)
    const averageScore = evaluations.length > 0 ? Math.round(totalScore / evaluations.length) : 0

    const subjects: Record<string, number[]> = {}
    for (const e of evaluations) {
      if (!subjects[e.subject]) subjects[e.subject] = []
      subjects[e.subject].push(e.percentage || 0)
    }

    const bestSubject = Object.entries(subjects).sort(
      ([, a], [, b]) => b.reduce((s, v) => s + v, 0) / b.length - a.reduce((s, v) => s + v, 0) / a.length
    )[0]?.[0] || "N/A"

    return NextResponse.json({
      evaluations: trimmed,
      stats: {
        totalEvaluations: evaluations.length,
        averageScore,
        bestSubject,
        improvementRate: evaluations.length >= 2
          ? Math.round(evaluations[0].percentage - evaluations[evaluations.length - 1].percentage)
          : 0,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
