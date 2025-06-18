describe("Answer Sheet Evaluation", () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem("auth_token", "test-token")
    })
    cy.visit("/")
  })

  it("should complete full evaluation workflow", () => {
    // Navigate to upload section
    cy.contains("Upload & Evaluate").click()

    // Fill out the form
    cy.get('input[placeholder="Enter your full name"]').type("Test Student")

    cy.contains("Select subject").click()
    cy.contains("Mathematics").click()

    cy.contains("Select exam type").click()
    cy.contains("Quiz").click()

    // Upload a file
    cy.get('input[type="file"]').selectFile("tests/fixtures/sample-answer.jpg", { force: true })

    // Mock API responses
    cy.intercept("POST", "/api/upload-answer-sheet", {
      statusCode: 200,
      body: {
        evaluation_id: "test-id",
        extracted_text: "Sample extracted text",
        status: "success",
      },
    }).as("uploadFile")

    cy.intercept("POST", "/api/evaluate-answer", {
      statusCode: 200,
      body: {
        score: 85,
        grade: "B+",
        feedback: "Good understanding demonstrated",
        suggestions: "Add more examples",
        points_covered: ["basic concepts"],
        points_missed: ["advanced details"],
        confidence: 88.5,
      },
    }).as("evaluateAnswer")

    // Submit the form
    cy.contains("Start AI Evaluation").click()

    // Should show processing state
    cy.contains("Processing...").should("be.visible")

    // Wait for API calls
    cy.wait("@uploadFile")
    cy.wait("@evaluateAnswer")

    // Should show results
    cy.contains("Evaluation Results").should("be.visible")
    cy.contains("85").should("be.visible")
    cy.contains("B+").should("be.visible")
    cy.contains("Good understanding demonstrated").should("be.visible")
  })

  it("should handle file upload errors", () => {
    // Fill out the form
    cy.get('input[placeholder="Enter your full name"]').type("Test Student")

    cy.contains("Select subject").click()
    cy.contains("Mathematics").click()

    cy.contains("Select exam type").click()
    cy.contains("Quiz").click()

    // Mock API error
    cy.intercept("POST", "/api/upload-answer-sheet", {
      statusCode: 500,
      body: { error: "Upload failed" },
    }).as("uploadError")

    cy.get('input[type="file"]').selectFile("tests/fixtures/sample-answer.jpg", { force: true })
    cy.contains("Start AI Evaluation").click()

    cy.wait("@uploadError")
    cy.contains("Error occurred during evaluation").should("be.visible")
  })

  it("should validate required fields", () => {
    cy.contains("Start AI Evaluation").click()

    // Should show validation message
    cy.contains("Please fill all required fields").should("be.visible")
  })
})
