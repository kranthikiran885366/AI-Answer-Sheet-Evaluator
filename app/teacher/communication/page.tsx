"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Send, MessageSquare } from "lucide-react"

export default function TeacherCommunicationPage() {
  const [message, setMessage] = useState("")
  const [recipient, setRecipient] = useState("all")

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="teacher" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">Communication</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">Class Communication</h2>
                <p className="text-green-700">Send announcements and messages to students</p>
              </div>

              {/* Send Message */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Send Announcement</CardTitle>
                  <CardDescription>Communicate with your students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-900">Recipient</label>
                    <Select value={recipient} onValueChange={setRecipient}>
                      <SelectTrigger className="border-green-200">
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="math101p1">MATH101-P1 Only</SelectItem>
                        <SelectItem value="math101p2">MATH101-P2 Only</SelectItem>
                        <SelectItem value="math201">MATH201 Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-green-900">Message</label>
                    <Textarea
                      placeholder="Type your message here..."
                      className="border-green-200 focus:border-green-500 min-h-32"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Send className="h-4 w-4" />
                    Send Announcement
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Announcements */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Recent Announcements</CardTitle>
                  <CardDescription>Messages you've sent to your classes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      message: "Remember, the midterm exam is next Tuesday. Make sure you've reviewed all chapters 1-5.",
                      recipient: "All Classes",
                      date: "2024-03-20",
                      type: "Reminder",
                    },
                    {
                      message: "Great work on the last quiz, everyone! The average was 87%. Keep it up!",
                      recipient: "MATH101-P1",
                      date: "2024-03-18",
                      type: "Praise",
                    },
                    {
                      message: "Office hours this week: Tuesday 2-4 PM and Thursday 1-3 PM",
                      recipient: "All Classes",
                      date: "2024-03-15",
                      type: "Announcement",
                    },
                    {
                      message: "Assignment 5 is now available. Due next Friday at 11:59 PM.",
                      recipient: "MATH201",
                      date: "2024-03-13",
                      type: "Assignment",
                    },
                  ].map((announcement, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-green-200 hover:bg-green-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge className="bg-green-100 text-green-700 mb-2">{announcement.type}</Badge>
                          <p className="font-medium text-green-900">{announcement.recipient}</p>
                        </div>
                        <span className="text-xs text-green-600">{announcement.date}</span>
                      </div>
                      <p className="text-sm text-green-700">{announcement.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Direct Messages */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle>Direct Messages</CardTitle>
                  <CardDescription>One-on-one conversations with students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { student: "Alice Johnson", message: "Hi Prof, I have a question about problem 5...", unread: true },
                    { student: "Bob Smith", message: "Thank you for the feedback on my essay!", unread: false },
                    { student: "Carol Davis", message: "Can I schedule an office hour meeting?", unread: true },
                  ].map((dm, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-green-200 hover:bg-green-50 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium ${dm.unread ? "text-green-900" : "text-green-700"}`}>
                              {student.student}
                            </p>
                            {dm.unread && <Badge className="bg-green-100 text-green-700 text-xs">New</Badge>}
                          </div>
                          <p className="text-sm text-green-600 mt-1 truncate">{dm.message}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
