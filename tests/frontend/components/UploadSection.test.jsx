import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { jest } from "@jest/globals"
import UploadSection from "../../../app/components/upload-section"

// Mock WebSocket provider
const MockWebSocketProvider = ({ children }) => {
  const mockContext = {
    sendMessage: jest.fn(),
    messages: [],
    isConnected: true,
    connectionStatus: "connected",
  }

  return <div data-testid="websocket-provider">{React.cloneElement(children, { mockWebSocket: mockContext })}</div>
}

// Mock fetch
global.fetch = jest.fn()

describe("UploadSection Component", () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  test("renders upload form correctly", () => {
    render(
      <MockWebSocketProvider>
        <UploadSection />
      </MockWebSocketProvider>,
    )

    expect(screen.getByText("Upload Your Answer Sheet")).toBeInTheDocument()
    expect(screen.getByLabelText(/Student Name/)).toBeInTheDocument()
    expect(screen.getByText("Select subject")).toBeInTheDocument()
    expect(screen.getByText("Select exam type")).toBeInTheDocument()
  })

  test("validates required fields", async () => {
    render(
      <MockWebSocketProvider>
        <UploadSection />
      </MockWebSocketProvider>,
    )

    const submitButton = screen.getByText("Start AI Evaluation")
    fireEvent.click(submitButton)

    // Should show validation message
    await waitFor(() => {
      expect(screen.getByText(/Please fill all required fields/)).toBeInTheDocument()
    })
  })

  test("handles file selection", () => {
    render(
      <MockWebSocketProvider>
        <UploadSection />
      </MockWebSocketProvider>,
    )

    const fileInput = screen.getByLabelText(/Select Answer Sheet/)
    const file = new File(["test content"], "test.jpg", { type: "image/jpeg" })

    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(screen.getByText("Selected: test.jpg")).toBeInTheDocument()
  })

  test("submits form with valid data", async () => {
    // Mock successful API responses
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          evaluation_id: "test-id",
          extracted_text: "Test extracted text",
          status: "success",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          score: 85,
          grade: "B+",
          feedback: "Good work",
          suggestions: "Keep practicing",
          points_covered: ["basics"],
          points_missed: ["advanced"],
          confidence: 85,
        }),
      })

    render(
      <MockWebSocketProvider>
        <UploadSection />
      </MockWebSocketProvider>,
    )

    // Fill form
    fireEvent.change(screen.getByLabelText(/Student Name/), {
      target: { value: "Test Student" },
    })

    fireEvent.click(screen.getByText("Select subject"))
    fireEvent.click(screen.getByText("Mathematics"))

    fireEvent.click(screen.getByText("Select exam type"))
    fireEvent.click(screen.getByText("Quiz"))

    // Add file
    const fileInput = screen.getByLabelText(/Select Answer Sheet/)
    const file = new File(["test content"], "test.jpg", { type: "image/jpeg" })
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Submit form
    const submitButton = screen.getByText("Start AI Evaluation")
    fireEvent.click(submitButton)

    // Should show processing state
    await waitFor(() => {
      expect(screen.getByText("Processing...")).toBeInTheDocument()
    })

    // Should eventually show results
    await waitFor(
      () => {
        expect(screen.getByText("Evaluation Results")).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })

  test("handles API errors gracefully", async () => {
    // Mock API error
    fetch.mockRejectedValueOnce(new Error("API Error"))

    render(
      <MockWebSocketProvider>
        <UploadSection />
      </MockWebSocketProvider>,
    )

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/Student Name/), {
      target: { value: "Test Student" },
    })

    const fileInput = screen.getByLabelText(/Select Answer Sheet/)
    const file = new File(["test content"], "test.jpg", { type: "image/jpeg" })
    fireEvent.change(fileInput, { target: { files: [file] } })

    const submitButton = screen.getByText("Start AI Evaluation")
    fireEvent.click(submitButton)

    // Should handle error gracefully
    await waitFor(() => {
      expect(screen.getByText(/Error occurred during evaluation/)).toBeInTheDocument()
    })
  })
})
