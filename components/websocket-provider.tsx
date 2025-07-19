"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface WebSocketMessage {
  type: string
  data?: any
  timestamp?: string
  user_id?: string
}

interface WebSocketContextType {
  isConnected: boolean
  sendMessage: (message: WebSocketMessage) => void
  lastMessage: WebSocketMessage | null
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}

interface WebSocketProviderProps {
  children: React.ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const { toast } = useToast()

  const connect = useCallback(() => {
    try {
      setConnectionStatus("connecting")
      const userId = localStorage.getItem("user_id") || "anonymous"
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"
      const ws = new WebSocket(`${wsUrl}/ws/${userId}`)

      ws.onopen = () => {
        console.log("WebSocket connected")
        setIsConnected(true)
        setConnectionStatus("connected")
        setReconnectAttempts(0)

        // Send ping to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }))
          } else {
            clearInterval(pingInterval)
          }
        }, 30000)

        toast({
          title: "Connected",
          description: "Real-time connection established",
          duration: 3000,
        })
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)

          // Handle different message types
          switch (message.type) {
            case "pong":
              // Handle ping response
              break
            case "upload_success":
              toast({
                title: "Upload Successful",
                description: "Your files have been uploaded and queued for processing",
                duration: 5000,
              })
              break
            case "processing_started":
              toast({
                title: "Processing Started",
                description: "AI evaluation has begun",
                duration: 3000,
              })
              break
            case "processing_update":
              toast({
                title: "Processing Update",
                description: `Stage: ${message.data?.stage || "Processing"}`,
                duration: 2000,
              })
              break
            case "evaluation_completed":
              toast({
                title: "Evaluation Complete",
                description: "Your answer sheet has been evaluated successfully",
                duration: 5000,
              })
              break
            case "evaluation_error":
              toast({
                title: "Evaluation Error",
                description: message.data?.error || "An error occurred during evaluation",
                variant: "destructive",
                duration: 5000,
              })
              break
            case "new_submission":
              toast({
                title: "New Submission",
                description: `New submission from ${message.data?.student}`,
                duration: 3000,
              })
              break
            case "system_alert":
              toast({
                title: "System Alert",
                description: message.data?.message || "System notification",
                variant: message.data?.severity === "error" ? "destructive" : "default",
                duration: 5000,
              })
              break
            default:
              console.log("Received message:", message)
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus("disconnected")

        // Attempt to reconnect
        if (reconnectAttempts < 5) {
          setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1)
            connect()
          }, Math.pow(2, reconnectAttempts) * 1000) // Exponential backoff
        } else {
          setConnectionStatus("error")
          toast({
            title: "Connection Lost",
            description: "Unable to maintain real-time connection. Please refresh the page.",
            variant: "destructive",
            duration: 10000,
          })
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        setConnectionStatus("error")
        toast({
          title: "Connection Error",
          description: "Failed to establish real-time connection",
          variant: "destructive",
          duration: 5000,
        })
      }

      setSocket(ws)
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      setConnectionStatus("error")
    }
  }, [reconnectAttempts, toast])

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        const messageWithTimestamp = {
          ...message,
          timestamp: new Date().toISOString(),
          user_id: localStorage.getItem("user_id") || "anonymous",
        }
        socket.send(JSON.stringify(messageWithTimestamp))
      } else {
        console.warn("WebSocket is not connected. Message not sent:", message)
        toast({
          title: "Connection Issue",
          description: "Unable to send message. Connection not available.",
          variant: "destructive",
          duration: 3000,
        })
      }
    },
    [socket, toast],
  )

  useEffect(() => {
    connect()

    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [socket])

  const contextValue: WebSocketContextType = {
    isConnected,
    sendMessage,
    lastMessage,
    connectionStatus,
  }

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>
}
