"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, Bot, User, Zap, RefreshCw, Sparkles, TrendingUp, TrendingDown, BarChart3, Brain, MessageCircle, Star, Mic, Copy, ThumbsUp, X } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Message {
  role: "user" | "system"
  content: string
  chartData?: any
  chartType?: string
  chartTitle?: string
  tokenName?: string
  timestamp?: number
}

// Mock data for demo
const mockHistoricalData = {
  data: [{
    prices: [
      { time: "1640995200000", price: "100.50" },
      { time: "1641081600000", price: "102.25" },
      { time: "1641168000000", price: "98.75" },
      { time: "1641254400000", price: "105.80" },
      { time: "1641340800000", price: "108.30" },
      { time: "1641427200000", price: "112.45" },
      { time: "1641513600000", price: "115.20" }
    ]
  }]
}

const mockCandlestickData = {
  data: [
    ["1640995200000", "100.50", "105.20", "99.80", "103.45", "1500000"],
    ["1641081600000", "103.45", "108.90", "102.10", "106.75", "1800000"],
    ["1641168000000", "106.75", "109.50", "104.20", "107.30", "1650000"],
    ["1641254400000", "107.30", "112.80", "106.90", "111.45", "2100000"],
    ["1641340800000", "111.45", "115.60", "110.20", "114.85", "1950000"],
    ["1641427200000", "114.85", "118.20", "113.40", "116.90", "2250000"],
    ["1641513600000", "116.90", "120.45", "115.80", "119.25", "2400000"]
  ]
}

// Helper function to format timestamp to readable date
function formatTimestamp(timestamp: string | number): string {
  const date = new Date(Number(timestamp))
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// Helper function to format price
function formatPrice(price: string | number): string {
  return Number(price).toFixed(6)
}

// Component for rendering historical price chart
function HistoricalPriceChart({ data, title }: { data: any; title: string }) {
  if (!data?.data?.[0]?.prices) return null

  const chartData = data.data[0].prices
    .map((item: any) => ({
      time: formatTimestamp(item.time),
      price: Number(item.price),
      timestamp: Number(item.time),
    }))
    .reverse()

  const currentPrice = chartData[chartData.length - 1]?.price || 0
  const previousPrice = chartData[chartData.length - 2]?.price || 0
  const priceChange = currentPrice - previousPrice
  const isPositive = priceChange >= 0

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 duration-700">
      <Card className="w-full bg-gradient-to-br from-slate-900/80 via-purple-900/40 to-slate-900/80 border border-purple-500/30 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 hover:border-purple-400/50 group">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-3">
            <div className="relative p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all duration-300">
              <BarChart3 className="h-5 w-5 text-purple-300 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl blur animate-pulse"></div>
            </div>
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent font-semibold text-lg">
              {title}
            </span>
          </CardTitle>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
              ${formatPrice(currentPrice)}
            </span>
            <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl backdrop-blur-sm ${
              isPositive 
                ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/20" 
                : "bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/40 shadow-lg shadow-red-500/20"
            } transition-all duration-300 hover:scale-105`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="font-medium">
                {isPositive ? "+" : ""}
                {formatPrice(priceChange)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              price: {
                label: "Price",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[320px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="time"
                  tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  domain={["dataMin - 0.01", "dataMax + 0.01"]}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(168,85,247,0.3)",
                    borderRadius: "12px",
                    color: "white",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="url(#gradient1)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 8, fill: "#8b5cf6", stroke: "#ffffff", strokeWidth: 3, filter: "drop-shadow(0 0 6px rgba(139,92,246,0.6))" }}
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="30%" stopColor="#ec4899" />
                    <stop offset="70%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// Component for rendering candlestick chart
function CandlestickChart({ data, title }: { data: any; title: string }) {
  if (!data?.data || !Array.isArray(data.data)) return null

  const chartData = data.data
    .map((item: any) => ({
      time: formatTimestamp(item[0]),
      open: Number(item[1]),
      high: Number(item[2]),
      low: Number(item[3]),
      close: Number(item[4]),
      volume: Number(item[5]),
      timestamp: Number(item[0]),
    }))
    .reverse()

  const currentPrice = chartData[chartData.length - 1]?.close || 0
  const previousPrice = chartData[chartData.length - 2]?.close || 0
  const priceChange = currentPrice - previousPrice
  const isPositive = priceChange >= 0

  return (
    <div className="w-full animate-in slide-in-from-bottom-4 duration-700">
      <Card className="w-full bg-gradient-to-br from-slate-900/80 via-indigo-900/40 to-slate-900/80 border border-indigo-500/30 backdrop-blur-xl shadow-2xl hover:shadow-indigo-500/40 transition-all duration-500 hover:border-indigo-400/50 group">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-3">
            <div className="relative p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all duration-300">
              <BarChart3 className="h-5 w-5 text-indigo-300 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl blur animate-pulse"></div>
            </div>
            <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent font-semibold text-lg">
              {title}
            </span>
          </CardTitle>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
              ${formatPrice(currentPrice)}
            </span>
            <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl backdrop-blur-sm ${
              isPositive 
                ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/20" 
                : "bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/40 shadow-lg shadow-red-500/20"
            } transition-all duration-300 hover:scale-105`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="font-medium">
                {isPositive ? "+" : ""}
                {formatPrice(priceChange)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              high: { label: "High", color: "#22c55e" },
              low: { label: "Low", color: "#ef4444" },
              open: { label: "Open", color: "#3b82f6" },
              close: { label: "Close", color: "#8b5cf6" },
            }}
            className="h-[320px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="time"
                  tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  domain={["dataMin - 0.01", "dataMax + 0.01"]}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    borderRadius: "12px",
                    color: "white",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Line type="monotone" dataKey="high" stroke="#22c55e" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="low" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="open" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="close" stroke="#8b5cf6" strokeWidth={3.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

const suggestions = [
  { text: "How does Novex's AI trading work?", icon: Brain },
  { text: "Explain the current SOL market conditions", icon: TrendingUp },
  { text: "What's the best DeFi strategy for beginners?", icon: Star },
  { text: "How to minimize transaction fees?", icon: Zap },
]

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Hello! I'm Novex AI, your intelligent DeFi assistant. I'm here to help you navigate the complex world of decentralized finance with real-time insights and personalized recommendations. How can I assist you today?",
      timestamp: Date.now(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { 
      role: "user", 
      content: input,
      timestamp: Date.now()
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (input.toLowerCase().includes('chart') || input.toLowerCase().includes('price')) {
        // Demo chart response
        setMessages((prev) => [
          ...prev,
          { role: "system", content: "Here's the comprehensive market analysis you requested:", timestamp: Date.now() },
          {
            role: "system",
            content: "CHART_DATA",
            chartData: input.toLowerCase().includes('candlestick') ? mockCandlestickData : mockHistoricalData,
            chartType: input.toLowerCase().includes('candlestick') ? "candlestick_history" : "hist_data",
            chartTitle: input.toLowerCase().includes('candlestick') ? "Advanced Candlestick Analysis - ETH" : "Real-time Price Tracking - ETH",
            tokenName: "ETH",
            timestamp: Date.now(),
          } as any,
        ])
      } else {
        // Regular response
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: "I appreciate your question! As your AI-powered DeFi companion, I'm equipped with advanced market analysis capabilities and can provide insights on trading strategies, yield farming opportunities, risk management, and much more. What specific aspect of DeFi would you like to explore together?",
            timestamp: Date.now(),
          },
        ])
      }
      setLoading(false)
    }, 2000)
  }

  const handleReset = () => {
    setMessages([
      {
        role: "system",
        content: "Hello! I'm Novex AI, your intelligent DeFi assistant. I'm here to help you navigate the complex world of decentralized finance with real-time insights and personalized recommendations. How can I assist you today?",
        timestamp: Date.now(),
      },
    ])
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "4s" }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: "1s", animationDuration: "3s" }}></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: "2s", animationDuration: "4s" }}></div>
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-pink-400/60 rounded-full animate-bounce" style={{ animationDelay: "3s", animationDuration: "5s" }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="flex flex-col h-[calc(100vh-3rem)]">
          {/* Enhanced Header */}
          <div className="flex justify-between items-center mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm">
                  <Brain className="h-8 w-8 text-purple-300 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur animate-pulse"></div>
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent mb-2">
                  Novex AI Assistant
                </h1>
                <p className="text-white/70 text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400 animate-spin" style={{ animationDuration: "4s" }} />
                  Powered by advanced neural networks & real-time market intelligence
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="gap-3 border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 text-white backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 hover:border-purple-400/50 px-6 py-3"
              onClick={handleReset}
            >
              <RefreshCw className="h-5 w-5" /> 
              New Conversation
            </Button>
          </div>

          {/* Enhanced Chat Area */}
          <div className="flex-1 overflow-y-auto backdrop-blur-xl bg-gradient-to-br from-slate-900/40 via-purple-900/5 to-slate-900/40 border border-purple-500/20 rounded-3xl mb-8 p-8 hover:border-purple-400/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-600`} style={{ animationDelay: `${index * 150}ms` }}>
                {message.content === "CHART_DATA" ? (
                  <div className="w-full max-w-5xl">
                    {message.chartType === "candlestick_history" ? (
                      <CandlestickChart data={message.chartData} title={message.chartTitle || "Chart"} />
                    ) : (
                      <HistoricalPriceChart data={message.chartData} title={message.chartTitle || "Chart"} />
                    )}
                  </div>
                ) : (
                  <div className={`flex max-w-[85%] group ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`rounded-2xl h-12 w-12 flex items-center justify-center relative ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500/80 to-purple-600/80 ml-4 shadow-lg shadow-blue-500/30 border border-blue-400/30" 
                          : "bg-gradient-to-br from-purple-500/80 to-pink-600/80 mr-4 shadow-lg shadow-purple-500/30 border border-purple-400/30"
                      } transition-all duration-300 hover:scale-110 backdrop-blur-sm`}
                    >
                      {message.role === "user" ? (
                        <User className="h-6 w-6 text-white drop-shadow-sm" />
                      ) : (
                        <Bot className="h-6 w-6 text-white drop-shadow-sm animate-pulse" />
                      )}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 animate-pulse"></div>
                    </div>
                    <div className="flex flex-col">
                      <div
                        className={`py-6 px-8 rounded-3xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] relative group ${
                          message.role === "user" 
                            ? "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10" 
                            : "bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 shadow-lg shadow-purple-500/10"
                        }`}
                      >
                        <p className="text-white/90 leading-relaxed text-lg">{message.content}</p>
                        
                        {/* Message actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute top-2 right-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-white/60 hover:text-white/90"
                            onClick={() => copyMessage(message.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {message.role === "system" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-white/60 hover:text-white/90"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Timestamp */}
                      <span className="text-xs text-white/40 mt-2 px-2">
                        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ""}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start mb-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                <div className="flex flex-row">
                  <div className="rounded-2xl h-12 w-12 flex items-center justify-center bg-gradient-to-br from-purple-500/80 to-pink-600/80 mr-4 shadow-lg shadow-purple-500/30 border border-purple-400/30 backdrop-blur-sm">
                    <Bot className="h-6 w-6 text-white animate-pulse" />
                  </div>
                  <div className="py-6 px-8 rounded-3xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 backdrop-blur-sm">
                    <div className="flex space-x-3">
                      <div className="h-3 w-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-3 w-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-3 w-3 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Input Area */}
          <div className="relative animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <div className="backdrop-blur-xl bg-gradient-to-r from-purple-900/30 via-slate-900/30 to-purple-900/30 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:border-purple-400/50 group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                placeholder="Ask me anything about DeFi, trading strategies, market analysis, or portfolio optimization..."
                className="w-full py-6 px-8 bg-transparent border-none pr-40 focus:outline-none text-white placeholder:text-white/50 text-lg"
                disabled={loading}
              />
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex space-x-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-12 w-12 p-0 rounded-xl text-white/60 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:text-white transition-all duration-300 hover:scale-110 border border-transparent hover:border-purple-400/30"
                  disabled={loading}
                >
                  <Mic className="h-5 w-5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-12 w-12 p-0 rounded-xl text-white/60 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:text-white transition-all duration-300 hover:scale-110 border border-transparent hover:border-purple-400/30"
                  onClick={() => setInput("")}
                  disabled={loading || !input.trim()}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};