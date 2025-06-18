"use client"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { jest } from "@jest/globals"
import AuthModal from "../../../app/components/auth-modal"

// Mock fetch
global.fetch = jest.fn()

describe("AuthModal Component", () => {
  const mockOnAuth = jest.fn()
  const mockOnClose = jest.fn()

  beforeEach(() => {
    fetch.mockClear()
    mockOnAuth.mockClear()
    mockOnClose.mockClear()
  })

  test("renders login form by default", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onAuth={mockOnAuth} />)

    expect(screen.getByText("Welcome to EvalAI Pro")).toBeInTheDocument()
    expect(screen.getByText("Sign In")).toBeInTheDocument()
    expect(screen.getByLabelText(/Username/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument()
  })

  test("switches to register form", () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} onAuth={mockOnAuth} />)

    fireEvent.click(screen.getByText("Sign Up"))

    expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Role/)).toBeInTheDocument()
  })

  test("handles successful login", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "test-token",
        user: {
          id: 1,
          username: "testuser",
          email: "test@example.com",
          role: "student",
        },
      }),
    })

    render(<AuthModal isOpen={true} onClose={mockOnClose} onAuth={mockOnAuth} />)

    fireEvent.change(screen.getByLabelText(/Username/), {
      target: { value: "testuser" },
    })
    fireEvent.change(screen.getByLabelText(/Password/), {
      target: { value: "password" },
    })

    fireEvent.click(screen.getByText("Sign In"))

    await waitFor(() => {
      expect(mockOnAuth).toHaveBeenCalledWith({
        id: 1,
        username: "testuser",
        email: "test@example.com",
        role: "student",
      })
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  test("handles login failure", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    // Mock alert
    window.alert = jest.fn()

    render(<AuthModal isOpen={true} onClose={mockOnClose} onAuth={mockOnAuth} />)

    fireEvent.change(screen.getByLabelText(/Username/), {
      target: { value: "testuser" },
    })
    fireEvent.change(screen.getByLabelText(/Password/), {
      target: { value: "wrongpassword" },
    })

    fireEvent.click(screen.getByText("Sign In"))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Login failed")
    })
  })

  test("does not render when closed", () => {
    render(<AuthModal isOpen={false} onClose={mockOnClose} onAuth={mockOnAuth} />)

    expect(screen.queryByText("Welcome to EvalAI Pro")).not.toBeInTheDocument()
  })
})
