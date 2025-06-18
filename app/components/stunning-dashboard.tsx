"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Zap, TrendingUp, Users, FileText, Award, Sparkles, Eye, Cpu, Activity, Rocket } from "lucide-react"

const FloatingParticle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60"
    animate={{
      y: [-20, -100],
      x: [0, Math.random() * 100 - 50],
      opacity: [0.6, 0],
    }}
    transition={{
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      delay,
      ease: "easeOut",
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: "100%",
    }}
  />
)

const NeuralConnection = ({ from, to, delay = 0 }) => (
  <motion.div
    className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
    initial={{ scaleX: 0, opacity: 0 }}
    animate={{ scaleX: 1, opacity: [0, 1, 0] }}
    transition={{
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      delay,
      ease: "easeInOut",
    }}
    style={{
      left: `${from.x}%`,
      top: `${from.y}%`,
      width: `${Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2)}%`,
      transformOrigin: "left center",
      transform: `rotate(${(Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI}deg)`,
    }}
  />
)

const HolographicCard = ({ children, className = "", ...props }) => (
  <motion.div
    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 ${className}`}
    whileHover={{
      scale: 1.02,
      rotateY: 5,
      rotateX: 5,
    }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
    <motion.div
      className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl opacity-0 hover:opacity-100"
      style={{
        background: "linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4)",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        padding: "2px",
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
    />
    {children}
  </motion.div>
)

const MetricCard = ({ icon: Icon, title, value, change, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-red-500",
  }

  return (
    <HolographicCard className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <motion.p
            className="text-3xl font-bold text-white"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {value}
          </motion.p>
          {change && (
            <motion.div
              className="flex items-center space-x-1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">{change}</span>
            </motion.div>
          )}
        </div>
        <motion.div
          className={`p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="h-8 w-8 text-white" />
        </motion.div>
      </div>
    </HolographicCard>
  )
}

export default function StunningDashboard({ user, stats }) {
  const [activeConnections, setActiveConnections] = useState([])
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Generate neural connections
    const connections = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      from: { x: Math.random() * 100, y: Math.random() * 100 },
      to: { x: Math.random() * 100, y: Math.random() * 100 },
      delay: Math.random() * 2,
    }))
    setActiveConnections(connections)

    // Generate floating particles
    const particleArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 3,
    }))
    setParticles(particleArray)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        {activeConnections.map((conn) => (
          <NeuralConnection key={conn.id} {...conn} />
        ))}
        {particles.map((particle) => (
          <FloatingParticle key={particle.id} delay={particle.delay} />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <motion.div
            className="inline-flex items-center space-x-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
            whileHover={{ scale: 1.05 }}
          >
            <Brain className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              EvalAI Pro Dashboard
            </span>
            <Sparkles className="h-6 w-6 text-purple-400" />
          </motion.div>

          <motion.p
            className="text-slate-400 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Advanced AI-Powered Answer Sheet Evaluation System
          </motion.p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <MetricCard
            icon={FileText}
            title="Total Evaluations"
            value={stats?.totalEvaluations || "2,847"}
            change="+12.5%"
            color="blue"
          />
          <MetricCard
            icon={Users}
            title="Active Students"
            value={stats?.activeStudents || "1,234"}
            change="+8.3%"
            color="purple"
          />
          <MetricCard
            icon={Award}
            title="Average Score"
            value={stats?.averageScore || "87.2%"}
            change="+2.1%"
            color="green"
          />
          <MetricCard
            icon={Zap}
            title="AI Accuracy"
            value={stats?.aiAccuracy || "96.8%"}
            change="+0.5%"
            color="orange"
          />
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Real-time Processing */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <HolographicCard className="p-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Activity className="h-6 w-6 text-cyan-400" />
                    <span>Real-time Processing</span>
                  </CardTitle>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Live</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">OCR Processing</span>
                    <span className="text-cyan-400 font-mono">94%</span>
                  </div>
                  <Progress value={94} className="h-2 bg-slate-700" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">AI Evaluation</span>
                    <span className="text-purple-400 font-mono">87%</span>
                  </div>
                  <Progress value={87} className="h-2 bg-slate-700" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Feedback Generation</span>
                    <span className="text-green-400 font-mono">92%</span>
                  </div>
                  <Progress value={92} className="h-2 bg-slate-700" />
                </div>
              </CardContent>
            </HolographicCard>

            {/* AI Models Status */}
            <HolographicCard className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center space-x-2">
                  <Cpu className="h-6 w-6 text-blue-400" />
                  <span>AI Models Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "OpenAI GPT-4", status: "Active", accuracy: "98.2%" },
                    { name: "Google Gemini", status: "Active", accuracy: "97.8%" },
                    { name: "Claude 3", status: "Active", accuracy: "97.5%" },
                    { name: "Local BERT", status: "Training", accuracy: "94.1%" },
                  ].map((model, index) => (
                    <motion.div
                      key={model.name}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300 text-sm font-medium">{model.name}</span>
                        <Badge
                          className={`text-xs ${
                            model.status === "Active"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}
                        >
                          {model.status}
                        </Badge>
                      </div>
                      <div className="text-lg font-bold text-white">{model.accuracy}</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </HolographicCard>
          </motion.div>

          {/* Side Panel */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Quick Actions */}
            <HolographicCard className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center space-x-2">
                  <Rocket className="h-6 w-6 text-purple-400" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Upload Answer Sheets", icon: FileText, color: "blue" },
                  { label: "Train New Model", icon: Brain, color: "purple" },
                  { label: "View Analytics", icon: TrendingUp, color: "green" },
                  { label: "Export Results", icon: Award, color: "orange" },
                ].map((action, index) => (
                  <motion.div key={action.label}>
                    <Button
                      className="w-full justify-start space-x-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-300 hover:text-white transition-all duration-300"
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <action.icon className="h-5 w-5" />
                      <span>{action.label}</span>
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </HolographicCard>

            {/* Recent Activity */}
            <HolographicCard className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center space-x-2">
                  <Eye className="h-6 w-6 text-cyan-400" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { action: "Math Quiz evaluated", time: "2 min ago", score: "94%" },
                  { action: "Physics Test processed", time: "5 min ago", score: "87%" },
                  { action: "Chemistry Lab evaluated", time: "12 min ago", score: "91%" },
                  { action: "English Essay graded", time: "18 min ago", score: "89%" },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div>
                      <p className="text-slate-300 text-sm font-medium">{activity.action}</p>
                      <p className="text-slate-500 text-xs">{activity.time}</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{activity.score}</Badge>
                  </motion.div>
                ))}
              </CardContent>
            </HolographicCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
