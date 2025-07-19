"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, CheckCircle, AlertCircle, Clock, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useWebSocket } from "@/components/websocket-provider"

export default function RealTimeNotifications() {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const { messages, connectionStatus, isConnected, reconnect } = useWebSocket()

  useEffect(() => {
    // Add new notifications from WebSocket messages
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1]
      if (latestMessage && latestMessage.type) {
        const notification = {
          id: Date.now(),
          type: latestMessage.type,
          message: getNotificationMessage(latestMessage),
          timestamp: new Date(),
          read: false,
        }
        setNotifications((prev) => [notification, ...prev.slice(-49), notification]) // Keep only 50 notifications
      }
    }
  }, [messages])

  const getNotificationMessage = (message) => {
    switch (message.type) {
      case "evaluation_complete":
        return `Evaluation completed for ${message.data?.student || "student"} - ${message.data?.subject || "subject"}`
      case "new_submission":
        return `New answer sheet submitted by ${message.data?.student || "student"}`
      case "teacher_review":
        return `Teacher review required for ${message.data?.subject || "subject"} exam`
      case "notification":
        return message.message || "New notification"
      default:
        return "New system notification"
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "evaluation_complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "teacher_review":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-4 w-4 text-green-500" />
      case "connecting":
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      default:
        return <WifiOff className="h-4 w-4 text-red-500" />
    }
  }

  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case "connected":
        return { text: "Connected", color: "text-green-600" }
      case "connecting":
        return { text: "Connecting...", color: "text-yellow-600" }
      case "error":
        return { text: "Connection Error", color: "text-red-600" }
      case "failed":
        return { text: "Connection Failed", color: "text-red-600" }
      case "unsupported":
        return { text: "Not Supported", color: "text-gray-600" }
      default:
        return { text: "Disconnected", color: "text-gray-600" }
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const status = getConnectionStatus()

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative rounded-full">
        <div className="flex items-center gap-2">
          {getConnectionIcon()}
          <Bell className="h-4 w-4" />
        </div>
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl shadow-2xl z-50">
          <div className="p-4 border-b border-white/20 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Real-time Notifications</h3>
              <div className="flex items-center gap-2">
                {getConnectionIcon()}
                <span className={`text-xs ${status.color}`}>{status.text}</span>
              </div>
            </div>

            {!isConnected && connectionStatus !== "unsupported" && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Real-time features unavailable. Backend may not be running.
                  <Button variant="outline" size="sm" onClick={reconnect} className="ml-2 h-6 text-xs bg-transparent">
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                {isConnected ? "No notifications yet" : "Connect to backend for real-time notifications"}
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-white/10 dark:border-slate-700/30 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors ${
                    !notification.read ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
