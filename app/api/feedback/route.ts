import { NextRequest, NextResponse } from "next/server"
import { verifyToken, getTokenFromHeader } from "@/lib/auth"
import {
  FEEDBACK_TEMPLATES,
  getTemplate,
  getTemplatesByCategory,
  populateTemplate,
  generateFeedback,
} from "@/lib/feedback-templates"

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

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const templateId = searchParams.get("templateId")

    if (templateId) {
      // Get specific template
      const template = getTemplate(templateId)
      if (!template) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        template,
      })
    }

    if (category) {
      // Get templates by category
      const templates = getTemplatesByCategory(category)

      return NextResponse.json({
        success: true,
        templates,
        category,
      })
    }

    // Return all templates
    return NextResponse.json({
      success: true,
      templates: FEEDBACK_TEMPLATES,
    })
  } catch (err: any) {
    console.error("Get feedback templates error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to fetch feedback templates" },
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

    // Handle different feedback generation modes
    const { mode, templateId, placeholders, strengths, improvements, overallComment } = body

    if (mode === "populate" && templateId && placeholders) {
      // Populate a single template
      const template = getTemplate(templateId)
      if (!template) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        )
      }

      const feedback = populateTemplate(template, placeholders)

      return NextResponse.json({
        success: true,
        feedback,
        template,
      })
    }

    if (mode === "generate" && strengths && improvements && overallComment !== undefined) {
      // Generate composite feedback
      const feedback = generateFeedback(strengths, improvements, overallComment)

      return NextResponse.json({
        success: true,
        feedback,
      })
    }

    return NextResponse.json(
      {
        error: "Invalid mode. Use 'populate' or 'generate'",
      },
      { status: 400 }
    )
  } catch (err: any) {
    console.error("Generate feedback error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to generate feedback" },
      { status: 500 }
    )
  }
}
