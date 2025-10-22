import { AIEvaluationEngine } from "@/app/components/ai-evaluation-engine"

export default function EvaluationPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">AI Evaluation</h1>
      <AIEvaluationEngine />
    </div>
  )
}
