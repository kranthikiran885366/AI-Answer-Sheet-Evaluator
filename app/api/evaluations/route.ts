import { NextRequest, NextResponse } from "next/server"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import { getUserEvaluations, getEvaluation, deleteEvaluation } from "@/lib/db"

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

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url)
    const subject = searchParams.get("subject")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    // Get user evaluations
    let evaluations = await getUserEvaluations(decoded.id)

    // Apply filters
    if (subject) {
      evaluations = evaluations.filter((e) =>
        e.subject.toLowerCase().includes(subject.toLowerCase())
      )
    }

    if (status) {
      evaluations = evaluations.filter((e) => e.status === status)
    }

    // Apply pagination
    const total = evaluations.length
    const paginated = evaluations.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      evaluations: paginated,
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
    })
  } catch (err: any) {
    console.error("Get evaluations error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to fetch evaluations" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
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

    // Get evaluation ID from query params
    const { searchParams } = new URL(req.url)
    const evaluationId = searchParams.get("id")

    if (!evaluationId) {
      return NextResponse.json(
        { error: "Evaluation ID is required" },
        { status: 400 }
      )
    }

    // Check if evaluation belongs to user
    const evaluation = await getEvaluation(evaluationId)
    if (!evaluation || evaluation.userId !== decoded.id) {
      return NextResponse.json(
        { error: "Evaluation not found or access denied" },
        { status: 404 }
      )
    }

    // Delete evaluation
    await deleteEvaluation(evaluationId)

    return NextResponse.json({
      success: true,
      message: "Evaluation deleted successfully",
    })
  } catch (err: any) {
    console.error("Delete evaluation error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to delete evaluation" },
      { status: 500 }
    )
  }
}
