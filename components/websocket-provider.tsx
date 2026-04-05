"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useRef } from "react"

interface ProgressUpdate {
  sessionId: string
  step: string
  message: string
  progress: number
  timestamp: string
}

interface WebSocketContextType {
  isConnected: boolean
  connectionStatus: "connected" | "disconnected" | "error"
  lastMessage: any
  sendMessage: (message: any) => void
  subscribeToProgress: (
    sessionId: string,
    onUpdate: (data: ProgressUpdate) => void,
    onComplete?: (data: ProgressUpdate) => void
  ) => (() => void) | undefined
  subscribe: (event: string, callback: (data: any) => void) => () => void
  unsubscribe: (event: string) => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) throw new Error("useWebSocket must be used within a WebSocketProvider")
  return context
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [lastMessage, setLastMessage] = useState<any>(null)
  const activeStreams = useRef<Record<string, EventSource>>({})
  const subscribers = useRef<Map<string, Set<(data: any) => void>>>(new Map())

  const subscribeToProgress = useCallback((
    sessionId: string,
    onUpdate: (data: ProgressUpdate) => void,
    onComplete?: (data: ProgressUpdate) => void
  ) => {
    if (activeStreams.current[sessionId]) return

    const es = new EventSource(`/api/progress?sessionId=${sessionId}`)

    es.onmessage = (event) => {
      try {
        const data: ProgressUpdate = JSON.parse(event.data)
        setLastMessage(data)
        onUpdate(data)
        if (data.step === "complete") {
          es.close()
          delete activeStreams.current[sessionId]
          onComplete?.(data)
        }
      } catch (e) {
        console.error("SSE parse error:", e)
      }
    }

    es.onerror = () => {
      es.close()
      delete activeStreams.current[sessionId]
    }

    activeStreams.current[sessionId] = es

    return () => {
      es.close()
      delete activeStreams.current[sessionId]
    }
  }, [])

  const sendMessage = useCallback((message: any) => {
    setLastMessage({ ...message, timestamp: new Date().toISOString() })
  }, [])

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (!subscribers.current.has(event)) subscribers.current.set(event, new Set())
    subscribers.current.get(event)!.add(callback)
    return () => {
      subscribers.current.get(event)?.delete(callback)
    }
  }, [])

  const unsubscribe = useCallback((event: string) => {
    subscribers.current.delete(event)
  }, [])

  return (
    <WebSocketContext.Provider value={{
      isConnected: true,
      connectionStatus: "connected",
      lastMessage,
      sendMessage,
      subscribeToProgress,
      subscribe,
      unsubscribe,
    }}>
      {children}
    </WebSocketContext.Provider>
  )
}
