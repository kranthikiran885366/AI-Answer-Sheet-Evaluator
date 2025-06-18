"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileText,
  BarChart2,
  Users,
  Settings,
  LogOut,
  Brain,
  CheckSquare,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  Database,
  Layers,
} from "lucide-react"

export function MainSidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState({
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@example.edu",
    role: "Teacher",
    avatar: "/placeholder.svg?height=32&width=32",
  })

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">EvalAI Pro</span>
            <span className="text-xs text-muted-foreground">Answer Script Evaluator</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/"}>
              <Link href="/">
                <Upload className="h-4 w-4" />
                <span>Upload Scripts</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/results"}>
              <Link href="/results">
                <FileText className="h-4 w-4" />
                <span>Evaluation Results</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
              <Link href="/dashboard">
                <BarChart2 className="h-4 w-4" />
                <span>Analytics Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/rubrics"}>
              <Link href="/rubrics">
                <CheckSquare className="h-4 w-4" />
                <span>Rubric Builder</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/ai-models"}>
              <Link href="/ai-models">
                <Brain className="h-4 w-4" />
                <span>AI Models</span>
              </Link>
            </SidebarMenuButton>
            <Badge variant="outline" className="ml-auto">
              New
            </Badge>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu className="mt-6">
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </SidebarMenuButton>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <Link href="/teachers">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Teachers
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <Link href="/students">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Students
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <Link href="/admins">
                    <Users className="h-4 w-4 mr-2" />
                    Administrators
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Database className="h-4 w-4" />
              <span>Data Management</span>
            </SidebarMenuButton>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <Link href="/scripts">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Answer Scripts
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton asChild>
                  <Link href="/training-data">
                    <Layers className="h-4 w-4 mr-2" />
                    Training Data
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.role}</span>
          </div>
          <div className="ml-auto flex gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
