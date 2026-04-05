import { NextRequest, NextResponse } from "next/server"
import { getAllEvaluations } from "@/lib/evaluations"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const subject = searchParams.get("subject")
    const grade = searchParams.get("grade")
    const limit = parseInt(searchParams.get("limit") || "100", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    let evaluations = getAllEvaluations()

    if (subject) {
      evaluations = evaluations.filter((e) =>
        e.subject.toLowerCase() === subject.toLowerCase()
      )
    }

    if (grade) {
      evaluations = evaluations.filter((e) => e.grade === grade)
    }

    const total = evaluations.length
    const paginated = evaluations.slice(offset, offset + limit)

    return NextResponse.json({
      evaluations: paginated,
      total,
      offset,
      limit,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
