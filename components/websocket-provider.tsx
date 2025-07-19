"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"

interface WebSocketContextType {
  isConnected: boolean
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
  lastMessage: any
  sendMessage: (message: any) => void
  subscribe: (event: string, callback: (data: any) => void) => () => void
  unsubscribe: (event: string) => void
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
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [subscribers, setSubscribers] = useState<Map<string, Set<(data: any) => void>>>(new Map())
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [reconnectTimer, setReconnectTimer] = useState<NodeJS.Timeout | null>(null)

  const maxReconnectAttempts = 5
  const reconnectDelay = 3000

  const connect = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionStatus("connecting")

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws"
      const newSocket = new WebSocket(wsUrl)

      newSocket.onopen = () => {
        console.log("WebSocket connected")
        setIsConnected(true)
        setConnectionStatus("connected")
        setReconnectAttempts(0)

        // Send authentication if needed
        const authToken = localStorage.getItem("auth_token")
        if (authToken) {
          newSocket.send(
            JSON.stringify({
              type: "auth",
              token: authToken,
            }),
          )
        }

        toast({
          title: "Connected",
          description: "Real-time connection established",
          duration: 3000,
        })
      }

      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)

          // Handle different message types
          switch (data.type) {
            case "evaluation_complete":
              toast({
                title: "Evaluation Complete",
                description: `${data.filename} has been processed`,
                duration: 5000,
              })
              break
            case "ocr_progress":
              // Handle OCR progress updates
              break
            case "system_alert":
              toast({
                title: "System Alert",
                description: data.message,
                variant: data.severity === "error" ? "destructive" : "default",
                duration: 5000,
              })
              break
            case "user_notification":
              toast({
                title: data.title || "Notification",
                description: data.message,
                duration: 4000,
              })
              break
            case "system_status":
              // Handle system status updates
              break
          }

          // Notify subscribers
          const eventSubscribers = subscribers.get(data.type)
          if (eventSubscribers) {
            eventSubscribers.forEach((callback) => callback(data))
          }

          // Notify all subscribers
          const allSubscribers = subscribers.get("*")
          if (allSubscribers) {
            allSubscribers.forEach((callback) => callback(data))
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      newSocket.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus("disconnected")
        setSocket(null)

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          setConnectionStatus("connecting")
          const timer = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1)
            connect()
          }, reconnectDelay * Math.pow(2, reconnectAttempts)) // Exponential backoff

          setReconnectTimer(timer)

          toast({
            title: "Connection Lost",
            description: `Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`,
            duration: 3000,
          })
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          setConnectionStatus("error")
          toast({
            title: "Connection Failed",
            description: "Unable to establish connection. Please refresh the page.",
            variant: "destructive",
            duration: 10000,
          })
        }
      }

      newSocket.onerror = (error) => {
        console.error("WebSocket error:", error)
        setConnectionStatus("error")
        toast({
          title: "Connection Error",
          description: "WebSocket connection error occurred",
          variant: "destructive",
          duration: 5000,
        })
      }

      setSocket(newSocket)
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      setConnectionStatus("error")
    }
  }, [socket, reconnectAttempts, subscribers])

  const disconnect = useCallback(() => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      setReconnectTimer(null)
    }

    if (socket) {
      socket.close(1000, "Normal closure")
      setSocket(null)
    }

    setIsConnected(false)
    setConnectionStatus("disconnected")
    setReconnectAttempts(0)
  }, [socket, reconnectTimer])

  const sendMessage = useCallback(
    (message: any) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message))
      } else {
        console.warn("WebSocket is not connected. Message not sent:", message)
        toast({
          title: "Connection Error",
          description: "Unable to send message. Connection not established.",
          variant: "destructive",
          duration: 3000,
        })
      }
    },
    [socket],
  )

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    setSubscribers((prev) => {
      const newSubscribers = new Map(prev)
      if (!newSubscribers.has(event)) {
        newSubscribers.set(event, new Set())
      }
      newSubscribers.get(event)!.add(callback)
      return newSubscribers
    })

    // Return unsubscribe function
    return () => {
      setSubscribers((prev) => {
        const newSubscribers = new Map(prev)
        const eventSubscribers = newSubscribers.get(event)
        if (eventSubscribers) {
          eventSubscribers.delete(callback)
          if (eventSubscribers.size === 0) {
            newSubscribers.delete(event)
          }
        }
        return newSubscribers
      })
    }
  }, [])

  const unsubscribe = useCallback((event: string) => {
    setSubscribers((prev) => {
      const newSubscribers = new Map(prev)
      newSubscribers.delete(event)
      return newSubscribers
    })
  }, [])

  useEffect(() => {
    connect()

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isConnected) {
        connect()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isConnected, connect])

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (!isConnected) {
        connect()
      }
    }

    const handleOffline = () => {
      toast({
        title: "Network Offline",
        description: "You are currently offline. Connection will resume when online.",
        duration: 5000,
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [isConnected, connect])

  // Mock WebSocket connection for development purposes
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const mockConnect = () => {
        setIsConnected(true)

        // Simulate periodic messages
        const interval = setInterval(() => {
          setLastMessage({
            type: "system_status",
            data: {
              timestamp: new Date().toISOString(),
              status: "online",
              activeUsers: Math.floor(Math.random() * 100) + 1200,
            },
          })
        }, 5000)

        return () => clearInterval(interval)
      }

      const cleanup = mockConnect()

      return () => {
        cleanup()
        setIsConnected(false)
      }
    }
  }, [])

  const contextValue: WebSocketContextType = {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    subscribe,
    unsubscribe,
  }

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>
}
