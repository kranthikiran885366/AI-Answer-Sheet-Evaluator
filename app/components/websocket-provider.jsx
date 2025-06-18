"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"

const WebSocketContext = createContext()

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider")
  }
  return context
}

export default function WebSocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [connectionStatus, setConnectionStatus] = useState("disconnected")
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connectWebSocket = () => {
    try {
      // Check if WebSocket is supported
      if (typeof WebSocket === "undefined") {
        console.log("WebSocket not supported in this environment")
        setConnectionStatus("unsupported")
        return
      }

      setConnectionStatus("connecting")

      // Try to connect to WebSocket server
      const ws = new WebSocket("ws://localhost:8000/ws")

      ws.onopen = () => {
        console.log("WebSocket connected successfully")
        setIsConnected(true)
        setConnectionStatus("connected")
        reconnectAttemptsRef.current = 0
        setSocket(ws)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setMessages((prev) => [...prev.slice(-49), data]) // Keep last 50 messages
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      ws.onclose = (event) => {
        console.log("WebSocket connection closed:", event.code, event.reason)
        setIsConnected(false)
        setSocket(null)
        setConnectionStatus("disconnected")

        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`,
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1
            connectWebSocket()
          }, delay)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionStatus("failed")
          console.log("Max reconnection attempts reached")
        }
      }

      ws.onerror = (error) => {
        console.log("WebSocket connection error - this is normal if backend is not running")
        setConnectionStatus("error")
        setIsConnected(false)
      }

      return ws
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      setConnectionStatus("error")
      return null
    }
  }

  useEffect(() => {
    const ws = connectWebSocket()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounting")
      }
    }
  }, [])

  const sendMessage = (message) => {
    if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(message))
        return true
      } catch (error) {
        console.error("Error sending WebSocket message:", error)
        return false
      }
    } else {
      console.log("WebSocket not connected, message not sent:", message)
      return false
    }
  }

  const reconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    reconnectAttemptsRef.current = 0
    connectWebSocket()
  }

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        messages,
        sendMessage,
        connectionStatus,
        reconnect,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}
