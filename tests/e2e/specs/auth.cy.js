describe("Authentication Flow", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("should show login modal on first visit", () => {
    cy.get('[data-testid="auth-modal"]').should("be.visible")
    cy.contains("Welcome to EvalAI Pro").should("be.visible")
  })

  it("should allow user registration", () => {
    cy.get('[data-testid="auth-modal"]').within(() => {
      cy.contains("Sign Up").click()

      cy.get('input[placeholder="Choose a username"]').type("testuser")
      cy.get('input[placeholder="Enter your email"]').type("test@example.com")
      cy.get('input[placeholder="Create a password"]').type("password123")
      cy.get("select").select("student")

      cy.contains("Create Account").click()
    })

    // Should close modal and show main interface
    cy.get('[data-testid="auth-modal"]').should("not.exist")
    cy.contains("Upload & Evaluate").should("be.visible")
  })

  it("should allow user login", () => {
    cy.get('[data-testid="auth-modal"]').within(() => {
      cy.get('input[placeholder="Enter your username"]').type("testuser")
      cy.get('input[placeholder="Enter your password"]').type("password123")

      cy.contains("Sign In").click()
    })

    // Should close modal and show main interface
    cy.get('[data-testid="auth-modal"]').should("not.exist")
    cy.contains("Upload & Evaluate").should("be.visible")
  })

  it("should handle login errors", () => {
    // Intercept login request to return error
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 401,
      body: { detail: "Invalid credentials" },
    }).as("loginError")

    cy.get('[data-testid="auth-modal"]').within(() => {
      cy.get('input[placeholder="Enter your username"]').type("wronguser")
      cy.get('input[placeholder="Enter your password"]').type("wrongpass")

      cy.contains("Sign In").click()
    })

    cy.wait("@loginError")
    // Should show error message
    cy.contains("Login failed").should("be.visible")
  })
})
