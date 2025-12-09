"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainSidebar } from "@/app/components/main-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Save, Bell, Lock, Zap, Globe } from "lucide-react"

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1000)
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-white via-green-50 to-white">
        <MainSidebar userRole="admin" />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-green-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-green-200" />
              <h1 className="text-lg font-semibold text-green-900">System Settings</h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              {/* Header */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-green-900">System Settings</h2>
                <p className="text-green-700">Configure system-wide settings and preferences</p>
              </div>

              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="bg-green-100 border-green-200">
                  <TabsTrigger value="general" className="data-[state=active]:bg-white">
                    <Globe className="h-4 w-4 mr-2" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="data-[state=active]:bg-white">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="security" className="data-[state=active]:bg-white">
                    <Lock className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="data-[state=active]:bg-white">
                    <Zap className="h-4 w-4 mr-2" />
                    Performance
                  </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6">
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle>Organization Information</CardTitle>
                      <CardDescription>Basic information about your organization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="org-name" className="text-green-900">Organization Name</Label>
                          <Input id="org-name" defaultValue="EvalAI Pro" className="border-green-200 focus:border-green-500" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="org-domain" className="text-green-900">Domain</Label>
                          <Input id="org-domain" defaultValue="evalai.pro" className="border-green-200 focus:border-green-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="org-desc" className="text-green-900">Description</Label>
                        <Textarea
                          id="org-desc"
                          defaultValue="AI-Powered Answer Sheet Evaluator"
                          className="border-green-200 focus:border-green-500"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle>Email Configuration</CardTitle>
                      <CardDescription>Configure email settings for notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="smtp-host" className="text-green-900">SMTP Host</Label>
                          <Input id="smtp-host" placeholder="smtp.gmail.com" className="border-green-200 focus:border-green-500" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smtp-port" className="text-green-900">SMTP Port</Label>
                          <Input id="smtp-port" placeholder="587" className="border-green-200 focus:border-green-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="from-email" className="text-green-900">From Email</Label>
                        <Input id="from-email" placeholder="noreply@evalai.pro" className="border-green-200 focus:border-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications" className="space-y-6">
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Configure system notification settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[
                        {
                          title: "System Alerts",
                          description: "Critical system alerts and maintenance notifications",
                          enabled: true,
                        },
                        {
                          title: "User Activity",
                          description: "New user registrations and logins",
                          enabled: true,
                        },
                        {
                          title: "Evaluation Updates",
                          description: "Evaluation completion and status updates",
                          enabled: true,
                        },
                        {
                          title: "Performance Alerts",
                          description: "System performance and resource warnings",
                          enabled: false,
                        },
                      ].map((setting, idx) => (
                        <div key={idx} className="flex items-start justify-between p-4 rounded-lg border border-green-200 hover:bg-green-50">
                          <div>
                            <p className="font-medium text-green-900">{setting.title}</p>
                            <p className="text-sm text-green-600 mt-1">{setting.description}</p>
                          </div>
                          <Switch defaultChecked={setting.enabled} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-6">
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Configure security and access control</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {[
                        {
                          title: "Two-Factor Authentication",
                          description: "Require 2FA for all admin accounts",
                          enabled: true,
                        },
                        {
                          title: "IP Whitelist",
                          description: "Restrict admin access to specific IP addresses",
                          enabled: false,
                        },
                        {
                          title: "Session Timeout",
                          description: "Automatically logout inactive admin sessions",
                          enabled: true,
                        },
                        {
                          title: "SSL/TLS Enforcement",
                          description: "Require HTTPS for all connections",
                          enabled: true,
                        },
                      ].map((setting, idx) => (
                        <div key={idx} className="flex items-start justify-between p-4 rounded-lg border border-green-200 hover:bg-green-50">
                          <div>
                            <p className="font-medium text-green-900">{setting.title}</p>
                            <p className="text-sm text-green-600 mt-1">{setting.description}</p>
                          </div>
                          <Switch defaultChecked={setting.enabled} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Performance Settings */}
                <TabsContent value="performance" className="space-y-6">
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle>Performance Configuration</CardTitle>
                      <CardDescription>Optimize system performance and resources</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cache-ttl" className="text-green-900">Cache TTL (seconds)</Label>
                        <Input id="cache-ttl" type="number" defaultValue="3600" className="border-green-200 focus:border-green-500" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-workers" className="text-green-900">Max Processing Workers</Label>
                        <Input id="max-workers" type="number" defaultValue="8" className="border-green-200 focus:border-green-500" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeout" className="text-green-900">Request Timeout (ms)</Label>
                        <Input id="timeout" type="number" defaultValue="30000" className="border-green-200 focus:border-green-500" />
                      </div>
                      <div className="flex items-start justify-between p-4 rounded-lg border border-green-200 hover:bg-green-50">
                        <div>
                          <p className="font-medium text-green-900">Enable Caching</p>
                          <p className="text-sm text-green-600 mt-1">Cache frequently accessed data</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                  Reset
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
