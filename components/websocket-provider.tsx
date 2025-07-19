"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

/**
 * Change this to your production WebSocket endpoint, or set
 * NEXT_PUBLIC_WS_URL in the environment for deployments.
 */
const WS_URL = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_WS_URL ?? `ws://${location.host}/ws`) : ""

type MessageEventData = Record<string, unknown> | string

interface WebSocketContextValue {
  socket: WebSocket | null
  status: "connecting" | "open" | "closed" | "error"
  /**
   * Helper to send a JSON-serialisable payload or string.
   */
  send: (data: MessageEventData) => void
}

const WebSocketContext = createContext<WebSocketContextValue>({
  socket: null,
  status: "closed",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  send: () => {},
})

export function useWebSocket() {
  return useContext(WebSocketContext)
}

interface WebSocketProviderProps {
  children: ReactNode
}

/**
 * WebSocketProvider
 *
 * Creates a single WebSocket connection for the whole app
 * and puts it in context so any component can subscribe.
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const socketRef = useRef<WebSocket | null>(null)
  const [status, setStatus] = useState<"connecting" | "open" | "closed" | "error">("connecting")

  useEffect(() => {
    // Open the connection once when the component mounts
    const socket = new WebSocket(WS_URL)
    socketRef.current = socket

    socket.onopen = () => {
      setStatus("open")
    }

    socket.onclose = () => {
      setStatus("closed")
    }

    socket.onerror = () => {
      setStatus("error")
    }

    // Optional: reconnect logic could go here

    return () => {
      socket.close()
    }
  }, [])

  const contextValue = useMemo<WebSocketContextValue>(
    () => ({
      socket: socketRef.current,
      status,
      send(data) {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return
        if (typeof data === "string") {
          socketRef.current.send(data)
        } else {
          socketRef.current.send(JSON.stringify(data))
        }
      },
    }),
    [status],
  )

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>
}
