"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles } from "lucide-react"

export interface FeedbackGenerationProps {
  /**
   * Optionally pass a student ID or evaluation ID
   * to fetch and display personalised feedback.
   */
  evaluationId?: string
}

/**
 * FeedbackGeneration
 *
 * Placeholder component that will eventually generate
 * personalised feedback for students based on the AI
 * evaluation results.
 */
export function FeedbackGeneration({ evaluationId }: FeedbackGenerationProps) {
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)

  async function generateFeedback() {
    setLoading(true)
    try {
      // TODO: replace with real backend call, e.g. `${process.env.NEXT_PUBLIC_API_URL}/feedback`
      const res = await fetch("/api/mock-feedback", {
        method: "POST",
        body: JSON.stringify({ answer }),
        headers: { "Content-Type": "application/json" },
      })
      const { feedback: generated } = await res.json()
      setFeedback(generated)
    } catch (err) {
      console.error(err)
      setFeedback("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold text-lg">AI Feedback Generator</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste the student’s answer here…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="min-h-[120px]"
        />
        <Button onClick={generateFeedback} disabled={!answer.trim() || loading}>
          {loading ? "Generating…" : "Generate Feedback"}
        </Button>
        {feedback && <div className="border rounded-md p-4 bg-muted/50 whitespace-pre-wrap">{feedback}</div>}
      </CardContent>
    </Card>
  )
}
