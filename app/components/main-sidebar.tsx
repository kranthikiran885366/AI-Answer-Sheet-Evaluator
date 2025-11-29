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
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Scan,
  MessageSquare,
  Shield,
  TrendingUp,
  Bell,
  Search,
  Home,
  ChevronDown,
  Activity,
  PieChart,
  LineChart,
  BarChart3,
  Target,
  Lightbulb,
  Cpu,
  Server,
} from "lucide-react"

interface MainSidebarProps {
  userRole?: "admin" | "teacher" | "student" | null
}

export function MainSidebar({ userRole = "admin" }: MainSidebarProps) {
  const pathname = usePathname()
  const [user, setUser] = useState({
    name: userRole === "admin" ? "Dr. Sarah Johnson" : userRole === "teacher" ? "Prof. Michael Chen" : "Alex Smith",
    email:
      userRole === "admin"
        ? "sarah.johnson@evalai.pro"
        : userRole === "teacher"
          ? "michael.chen@school.edu"
          : "alex.smith@student.edu",
    role: userRole === "admin" ? "System Administrator" : userRole === "teacher" ? "Senior Teacher" : "Student",
    avatar: "/placeholder.svg?height=40&width=40",
    institution:
      userRole === "admin" ? "EvalAI Pro" : userRole === "teacher" ? "Lincoln High School" : "Lincoln High School",
    status: "online",
  })

  const getRoleColor = () => {
    switch (userRole) {
      case "admin":
        return "from-green-700 to-green-600"
      case "teacher":
        return "from-green-600 to-green-500"
      case "student":
        return "from-green-500 to-emerald-500"
      default:
        return "from-green-600 to-green-500"
    }
  }

  const getMenuItems = () => {
    const commonItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        badge: null,
        description: "Overview and key metrics",
      },
      {
        title: "Upload & Process",
        url: "/upload",
        icon: Upload,
        badge: "New",
        description: "Upload answer sheets for evaluation",
      },
      {
        title: "OCR Engine",
        url: "/ocr",
        icon: Scan,
        badge: null,
        description: "Optical Character Recognition",
      },
      {
        title: "AI Evaluation",
        url: "/evaluation",
        icon: Brain,
        badge: "AI",
        description: "Intelligent answer evaluation",
      },
    ]

    const adminItems = [
      ...commonItems,
      {
        title: "System Management",
        icon: Settings,
        items: [
          { title: "User Management", url: "/admin/users", icon: Users },
          { title: "System Settings", url: "/admin/settings", icon: Settings },
          { title: "Database Admin", url: "/admin/database", icon: Database },
          { title: "Server Monitoring", url: "/admin/monitoring", icon: Server },
          { title: "Security Center", url: "/admin/security", icon: Shield },
        ],
      },
      {
        title: "Analytics & Reports",
        icon: BarChart3,
        items: [
          { title: "System Analytics", url: "/admin/analytics", icon: TrendingUp },
          { title: "Performance Metrics", url: "/admin/performance", icon: Activity },
          { title: "Usage Statistics", url: "/admin/usage", icon: PieChart },
          { title: "Financial Reports", url: "/admin/financial", icon: LineChart },
        ],
      },
      {
        title: "AI & ML Management",
        icon: Brain,
        items: [
          { title: "Model Hub", url: "/admin/models", icon: Cpu },
          { title: "Training Pipeline", url: "/admin/training", icon: Target },
          { title: "Model Performance", url: "/admin/model-performance", icon: BarChart2 },
          { title: "AI Insights", url: "/admin/ai-insights", icon: Lightbulb },
        ],
      },
    ]

    const teacherItems = [
      ...commonItems,
      {
        title: "Evaluation Tools",
        icon: CheckSquare,
        items: [
          { title: "Rubric Builder", url: "/teacher/rubrics", icon: FileText },
          { title: "Feedback Generator", url: "/teacher/feedback", icon: MessageSquare },
          { title: "Grade Analytics", url: "/teacher/grades", icon: BarChart2 },
          { title: "Student Progress", url: "/teacher/progress", icon: TrendingUp },
        ],
      },
      {
        title: "Class Management",
        icon: Users,
        items: [
          { title: "My Classes", url: "/teacher/classes", icon: GraduationCap },
          { title: "Student Roster", url: "/teacher/students", icon: Users },
          { title: "Assignment Tracker", url: "/teacher/assignments", icon: FileSpreadsheet },
          { title: "Communication", url: "/teacher/communication", icon: MessageSquare },
        ],
      },
    ]

    const studentItems = [
      {
        title: "My Dashboard",
        url: "/student/dashboard",
        icon: Home,
        badge: null,
        description: "Your academic overview",
      },
      {
        title: "My Evaluations",
        url: "/student/evaluations",
        icon: FileText,
        badge: null,
        description: "View your graded papers",
      },
      {
        title: "Progress Tracking",
        url: "/student/progress",
        icon: TrendingUp,
        badge: null,
        description: "Track your academic progress",
      },
      {
        title: "Feedback & Insights",
        url: "/student/feedback",
        icon: MessageSquare,
        badge: null,
        description: "AI-generated feedback",
      },
      {
        title: "Study Resources",
        url: "/student/resources",
        icon: BookOpen,
        badge: "New",
        description: "Personalized study materials",
      },
    ]

    switch (userRole) {
      case "admin":
        return adminItems
      case "teacher":
        return teacherItems
      case "student":
        return studentItems
      default:
        return commonItems
    }
  }

  return (
    <Sidebar className="border-r border-green-200/60 bg-white/95 backdrop-blur-xl">
      <SidebarHeader className={`bg-gradient-to-br ${getRoleColor()} text-white p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold">EvalAI Pro</span>
            <span className="text-xs text-white/80 font-medium">Answer Sheet Evaluator</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
          <Avatar className="h-10 w-10 border-2 border-white/30">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-white/20 text-white font-semibold">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-white/80 truncate">{user.role}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/80">Online</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {getMenuItems().map((item, index) => (
                <SidebarMenuItem key={index}>
                  {item.items ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between hover:bg-gray-50 rounded-lg p-3 transition-all duration-200">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                              <item.icon className="h-4 w-4 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-700">{item.title}</span>
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" className="w-56 ml-2">
                        <DropdownMenuLabel className="font-semibold">{item.title}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {item.items.map((subItem, subIndex) => (
                          <DropdownMenuItem key={subIndex} asChild>
                            <Link href={subItem.url} className="flex items-center gap-3 cursor-pointer">
                              <subItem.icon className="h-4 w-4" />
                              {subItem.title}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className="hover:bg-gray-50 rounded-lg p-3 transition-all duration-200 group"
                    >
                      <Link href={item.url || "#"} className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            pathname === item.url
                              ? `bg-gradient-to-br ${getRoleColor()} text-white`
                              : "bg-gray-100 group-hover:bg-gray-200"
                          }`}
                        >
                          <item.icon className={`h-4 w-4 ${pathname === item.url ? "text-white" : "text-gray-600"}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-medium ${pathname === item.url ? "text-gray-900" : "text-gray-700"}`}
                            >
                              {item.title}
                            </span>
                            {item.badge && (
                              <Badge
                                variant="secondary"
                                className={`text-xs px-2 py-0.5 ${
                                  item.badge === "AI"
                                    ? "bg-purple-100 text-purple-700"
                                    : item.badge === "New"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-gray-200" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 hover:bg-gray-50 border-gray-200 bg-transparent"
              >
                <Bell className="h-4 w-4" />
                Notifications
                <Badge variant="secondary" className="ml-auto bg-red-100 text-red-700">
                  3
                </Badge>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 hover:bg-gray-50 border-gray-200 bg-transparent"
              >
                <Search className="h-4 w-4" />
                Quick Search
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === "admin" && (
          <>
            <SidebarSeparator className="bg-gray-200" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                System Status
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-800">System Online</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      99.9%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Active Users</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      1,256
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">AI Models</span>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      15
                    </Badge>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200/60 p-4 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Institution</p>
            <p className="text-sm font-medium text-gray-700 truncate">{user.institution}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 hover:bg-gray-100">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" size="sm" className="px-3 hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
