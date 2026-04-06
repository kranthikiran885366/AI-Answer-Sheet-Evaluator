"use client"

import { createContext, useContext, useState, useCallback } from "react"

const WebSocketContext = createContext()

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider")
  }
  return context
}

export default function WebSocketProvider({ children }) {
  const [isConnected] = useState(true)
  const [messages, setMessages] = useState([])
  const [connectionStatus] = useState("connected")
  const [activeStreams, setActiveStreams] = useState({})

  const subscribeToProgress = useCallback((sessionId, onUpdate, onComplete) => {
    if (activeStreams[sessionId]) return

    const eventSource = new EventSource(`/api/progress?sessionId=${sessionId}`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setMessages((prev) => [...prev.slice(-49), data])
        if (onUpdate) onUpdate(data)
        if (data.step === "complete") {
          eventSource.close()
          setActiveStreams((prev) => {
            const next = { ...prev }
            delete next[sessionId]
            return next
          })
          if (onComplete) onComplete(data)
        }
      } catch (e) {
        console.error("SSE parse error:", e)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
      setActiveStreams((prev) => {
        const next = { ...prev }
        delete next[sessionId]
        return next
      })
    }

    setActiveStreams((prev) => ({ ...prev, [sessionId]: eventSource }))
    return () => {
      eventSource.close()
    }
  }, [activeStreams])

  const sendMessage = useCallback((message) => {
    setMessages((prev) => [...prev.slice(-49), { ...message, timestamp: new Date().toISOString() }])
    return true
  }, [])

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        messages,
        sendMessage,
        connectionStatus,
        subscribeToProgress,
        reconnect: () => {},
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}
