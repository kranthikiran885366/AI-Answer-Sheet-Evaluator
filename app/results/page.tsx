import { EvaluationResults } from "@/app/components/evaluation-results"

const mockEvaluationData = {
  studentName: "John Smith",
  subject: "Mathematics",
  examType: "Mid-term Exam",
  evaluationDate: "2024-01-15",
  obtainedMarks: 85,
  totalMarks: 100,
  percentage: 85,
  grade: "A",
  confidenceScore: 94,
  overallFeedback:
    "Excellent work! Strong understanding of algebraic concepts with minor areas for improvement in complex problem-solving.",
  strengths: [
    "Clear step-by-step solutions",
    "Correct application of formulas",
    "Good mathematical reasoning",
    "Neat presentation of work",
  ],
  improvements: ["Work on complex word problems", "Show more intermediate steps", "Double-check final answers"],
  questions: [
    {
      id: 1,
      question: "Solve the quadratic equation: 2x² + 5x - 3 = 0",
      studentAnswer:
        "Using the quadratic formula: x = (-5 ± √(25 + 24))/4 = (-5 ± 7)/4\nSo x = 1/2 or x = -3",
      obtainedMarks: 8,
      maxMarks: 10,
      feedback:
        "Excellent application of the quadratic formula. Minor deduction for not showing the discriminant calculation step.",
      keyPointsCovered: ["Quadratic formula", "Correct calculation", "Both solutions found"],
      keyPointsMissed: ["Discriminant explanation"],
      suggestions: "Always show the discriminant calculation step for complete clarity.",
    },
  ],
}

export default function ResultsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Evaluation Results</h1>
      <EvaluationResults data={mockEvaluationData} />
    </div>
  )
}
