// Mock data service for when backend is not available
export const mockEvaluationService = {
  async uploadAnswerSheet(formData) {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return {
      evaluation_id: `mock-${Date.now()}`,
      extracted_text:
        "This is mock extracted text from the uploaded answer sheet. The student has provided answers to various questions covering the main topics of the subject.",
      status: "success",
    }
  },

  async evaluateAnswer(data) {
    // Simulate AI evaluation delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    return {
      score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      grade: ["A+", "A", "A-", "B+", "B"][Math.floor(Math.random() * 5)],
      feedback:
        "Good understanding of the concepts. Your explanation covers the main points but could benefit from more detailed examples and clearer structure. Keep up the good work!",
      suggestions:
        "Include more specific examples and organize your answer with clear headings. Consider adding diagrams where applicable.",
      points_covered: ["Basic concepts", "Main ideas", "Logical structure"],
      points_missed: ["Detailed examples", "Advanced concepts", "Mathematical formulas"],
      confidence: Math.floor(Math.random() * 20) + 80, // Random confidence 80-100%
    }
  },

  async getDashboardStats() {
    return {
      stats: {
        totalEvaluations: 1247,
        averageScore: 78.5,
        processingTime: 2.3,
        accuracy: 94.2,
      },
      recent_evaluations: [
        { student: "Alice Johnson", subject: "Mathematics", score: 92, grade: "A", date: "2024-01-15" },
        { student: "Bob Smith", subject: "Physics", score: 78, grade: "B+", date: "2024-01-14" },
        { student: "Carol Davis", subject: "Chemistry", score: 85, grade: "A-", date: "2024-01-13" },
      ],
    }
  },

  async getStudentEvaluations() {
    return {
      evaluations: [
        {
          id: 1,
          student: "Current Student",
          subject: "Mathematics",
          examType: "Unit Test",
          score: 85,
          maxScore: 100,
          grade: "A",
          feedback: "Excellent work! Strong understanding of algebraic concepts.",
          date: "2024-01-15",
          status: "completed",
        },
        {
          id: 2,
          student: "Current Student",
          subject: "Physics",
          examType: "Mid-term",
          score: 72,
          maxScore: 100,
          grade: "B",
          feedback: "Good effort. Focus more on numerical problems and formulas.",
          date: "2024-01-12",
          status: "completed",
        },
      ],
    }
  },
}
