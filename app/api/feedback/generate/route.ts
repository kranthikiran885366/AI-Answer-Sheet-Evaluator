import { NextRequest, NextResponse } from "next/server"
import { getAllEvaluations } from "@/lib/evaluations"
import { existsSync, readFileSync } from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    const { evaluationId, feedbackType = "comprehensive" } = await req.json()

    if (!evaluationId) {
      return NextResponse.json({ error: "evaluationId is required" }, { status: 400 })
    }

    const resultPath = path.join(process.cwd(), "uploads", evaluationId, "result.json")
    if (!existsSync(resultPath)) {
      return NextResponse.json({ error: "Evaluation not found" }, { status: 404 })
    }

    const evaluation = JSON.parse(readFileSync(resultPath, "utf-8"))

    const feedbackPrompts: Record<string, string> = {
      comprehensive: `Generate comprehensive, detailed educational feedback for this student evaluation.`,
      encouraging: `Generate warm, encouraging feedback that motivates the student while gently noting areas to improve.`,
      constructive: `Generate specific, actionable constructive feedback focusing on concrete improvement steps.`,
      motivational: `Generate inspiring, goal-oriented feedback that helps the student see their potential.`,
    }

    const systemPrompt = feedbackPrompts[feedbackType] || feedbackPrompts.comprehensive

    const prompt = `${systemPrompt}

Student: ${evaluation.studentName}
Subject: ${evaluation.subject}
Score: ${evaluation.obtainedMarks}/${evaluation.totalMarks} (${evaluation.percentage}%)
Grade: ${evaluation.grade}
Exam Type: ${evaluation.examType}
Current Strengths: ${evaluation.strengths?.join(", ")}
Current Improvements: ${evaluation.improvements?.join(", ")}
Overall Feedback: ${evaluation.overallFeedback}

Respond ONLY with a valid JSON object:
{
  "id": "${evaluationId}",
  "studentName": "${evaluation.studentName}",
  "subject": "${evaluation.subject}",
  "score": ${evaluation.obtainedMarks},
  "maxScore": ${evaluation.totalMarks},
  "grade": "${evaluation.grade}",
  "overallFeedback": "<2-3 sentence personalized feedback>",
  "strengths": ["<strength>", "<strength>", "<strength>"],
  "improvements": ["<improvement>", "<improvement>"],
  "suggestions": ["<specific suggestion>", "<suggestion>"],
  "nextSteps": ["<concrete next step>", "<next step>"],
  "confidence": ${evaluation.confidenceScore || 90}
}`

    let feedbackData: any = null

    if (process.env.OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          max_tokens: 1500,
          temperature: 0.4,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (content) feedbackData = JSON.parse(content)
      }
    } else if (process.env.GEMINI_API_KEY) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      )

      if (res.ok) {
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) feedbackData = JSON.parse(text)
      }
    }

    if (!feedbackData) {
      feedbackData = {
        id: evaluationId,
        studentName: evaluation.studentName,
        subject: evaluation.subject,
        score: evaluation.obtainedMarks,
        maxScore: evaluation.totalMarks,
        grade: evaluation.grade,
        overallFeedback: evaluation.overallFeedback,
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        suggestions: ["Review the topics covered in this exam", "Practice past papers for stronger performance"],
        nextSteps: ["Schedule a study session for weaker topics", "Revisit feedback with your teacher"],
        confidence: evaluation.confidenceScore || 90,
      }
    }

    return NextResponse.json({ success: true, feedback: feedbackData })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const evaluations = getAllEvaluations()
    const list = evaluations.map((e) => ({
      id: e.sessionId,
      studentName: e.studentName,
      subject: e.subject,
      score: e.obtainedMarks,
      maxScore: e.totalMarks,
      grade: e.grade,
      evaluationDate: e.evaluationDate,
    }))
    return NextResponse.json({ evaluations: list })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
