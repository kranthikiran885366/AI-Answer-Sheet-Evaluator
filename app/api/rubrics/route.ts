import { NextRequest, NextResponse } from "next/server"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import {
  createRubric,
  getUserRubrics,
  loadRubrics,
  DEFAULT_RUBRICS,
} from "@/lib/rubrics"

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

    // Load rubrics
    await loadRubrics()

    // Get user rubrics
    const userRubrics = await getUserRubrics(decoded.id)

    // Get default rubrics
    const defaultRubrics = Object.values(DEFAULT_RUBRICS)

    return NextResponse.json({
      success: true,
      userRubrics,
      defaultRubrics,
      total: userRubrics.length + defaultRubrics.length,
    })
  } catch (err: any) {
    console.error("Get rubrics error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to fetch rubrics" },
      { status: 500 }
    )
  }
}

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

    const body = await req.json()

    // Validate required fields
    if (!body.name || !body.subject || !body.criteria || !body.totalMarks) {
      return NextResponse.json(
        { error: "Missing required fields: name, subject, criteria, totalMarks" },
        { status: 400 }
      )
    }

    // Create rubric
    const rubric = await createRubric(decoded.id, {
      name: body.name,
      subject: body.subject,
      description: body.description || "",
      totalMarks: body.totalMarks,
      criteria: body.criteria,
      isPublic: body.isPublic || false,
    })

    return NextResponse.json(
      {
        success: true,
        rubric,
        message: "Rubric created successfully",
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error("Create rubric error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to create rubric" },
      { status: 500 }
    )
  }
}
