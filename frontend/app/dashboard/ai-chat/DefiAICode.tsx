"use client";

import React, { useState, useCallback, useMemo } from "react";
import { GoogleGenAI } from "@google/genai";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Zap, RefreshCw, Sparkles, TrendingUp, TrendingDown, BarChart3, Brain, MessageCircle, Star, Mic, Copy, ThumbsUp, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {extractImportantInfoFromData} from "./Novex2Agent"


// Initialize GoogleGenAI
const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_KEY,
});

// Prompt template for DeFi assistant
const DEFI_PROMPT_TEMPLATE = `
You are Novex AI, a DeFi Trading Assistant specializing in blockchain data and trading insights. 
Respond in JSON format with clearly defined types for each response. Supported chains include: 
ETH, OP, BSC, OKT, SONIC, XLAYER, POLYGON, ARB, AVAX, ZKSYNC, POLYZKEVM, BASE, LINEA, FTM, 
MANTLE, CFX, METIS, MERLIN, BLAST, MANTA, SCROLL, CRO, ZETA, TRON, SOL, SUI, TON.

Response types:
- Supported chains: { type: "supported_chains", data: string[] }
- Token price: { type: "price", token_name: string, price: number, similar_tokens: string[] }
- Trades: { type: "trades", data: { token: string, amount: number, timestamp: string }[] }
- Candlestick data: { type: "candlestick", data: { open: number, high: number, low: number, close: number, timestamp: string }[] }
- Historical data: { type: "hist_data", data: { open: number, high: number, low: number, close: number, timestamp: string }[] }
- Recent transaction: { type: "recent_transaction", data: { tx_hash: string, token: string, amount: number } }
- Total balance: { type: "total_value", token_name: "MYS", data: { total: number, currency: string } }
- Batch token prices: { type: "batch_price", data: { token: string, price: number }[] }
- Total token balance: { type: "total_token_balance", data: { token: string, balance: number }[] }
- Specific token balance: { type: "specific_token_balance", token_name: string, data: { balance: number, address: string } }
- Candlestick history: { type: "candlestick_history", data: { open: number, high: number, low: number, close: number, timestamp: string }[] }
- Token index price: { type: "token_index_price", data: { index: string, price: number } }
- Historical index price: { type: "historical_index_price", data: { index: string, price: number, timestamp: string }[] }
- Transaction history: { type: "transaction_history", data: { tx_hash: string, amount: number, timestamp: string }[] }
- Transaction details: { type: "tx_by_hash", data: { tx_hash: string, details: object } }
- General answer: { type: "general_answer", message: string }

If a token is mentioned, include "token_name" and "similar_tokens" fields.
User Query: {query}
`;

interface Message {
  role: "user" | "system";
  content: string;
  chartData?: any;
  chartType?: string;
  chartTitle?: string;
  tokenName?: string;
  timestamp?: number;
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
};

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
};

const suggestions = [
  { text: "How does Novex's AI trading work?", icon: Brain },
  { text: "Explain the current SOL market conditions", icon: TrendingUp },
  { text: "What's the best DeFi strategy for beginners?", icon: Star },
  { text: "How to minimize transaction fees?", icon: Zap },
];

// Helper function to format timestamp
function formatTimestamp(timestamp: string | number): string {
  const date = new Date(Number(timestamp));
  return date.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
}

// Helper function to format price
function formatPrice(price: string | number): string {
  return Number(price).toFixed(6);
}

// Memoized Historical Price Chart
const HistoricalPriceChart = React.memo(({ data, title }: { data: any; title: string }) => {
  if (!data?.data?.[0]?.prices) return null;

  const chartData = data.data[0].prices
    .map((item: any) => ({
      time: formatTimestamp(item.time),
      price: Number(item.price),
      timestamp: Number(item.time),
    }))
    .reverse();

  const currentPrice = chartData[chartData.length - 1]?.price || 0;
  const previousPrice = chartData[chartData.length - 2]?.price || 0;
  const priceChange = currentPrice - previousPrice;
  const isPositive = priceChange >= 0;

  return (
    <Card className="w-full bg-slate-800/80 border border-gray-700 rounded-xl shadow-lg">
      
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-2xl font-bold text-white">${formatPrice(currentPrice)}</span>
          <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-md ${isPositive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{isPositive ? "+" : ""}{formatPrice(priceChange)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ price: { label: "Price", color: "hsl(271, 81%, 56%)" } }}
          className="h-64 sm:h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="time"
                tick={{ fill: "#e5e7eb", fontSize: 12 }}
                axisLine={{ stroke: "#4b5563" }}
                tickLine={{ stroke: "#4b5563" }}
              />
              <YAxis
                tick={{ fill: "#e5e7eb", fontSize: 12 }}
                axisLine={{ stroke: "#4b5563" }}
                tickLine={{ stroke: "#4b5563" }}
                domain={["dataMin - 0.01", "dataMax + 0.01"]}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #6b7280",
                  borderRadius: "8px",
                  color: "#f9fafb",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
});

// Memoized Candlestick Chart
const CandlestickChart = React.memo(({ data, title }: { data: any; title: string }) => {
  if (!data?.data || !Array.isArray(data.data)) return null;

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
    .reverse();

  const currentPrice = chartData[chartData.length - 1]?.close || 0;
  const previousPrice = chartData[chartData.length - 2]?.close || 0;
  const priceChange = currentPrice - previousPrice;
  const isPositive = priceChange >= 0;

  return (
    <Card className="w-full bg-slate-800/80 border border-gray-700 rounded-xl shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-2xl font-bold text-white">${formatPrice(currentPrice)}</span>
          <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-md ${isPositive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{isPositive ? "+" : ""}{formatPrice(priceChange)}</span>
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
          className="h-64 sm:h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="time"
                tick={{ fill: "#e5e7eb", fontSize: 12 }}
                axisLine={{ stroke: "#4b5563" }}
                tickLine={{ stroke: "#4b5563" }}
              />
              <YAxis
                tick={{ fill: "#e5e7eb", fontSize: 12 }}
                axisLine={{ stroke: "#4b5563" }}
                tickLine={{ stroke: "#4b5563" }}
                domain={["dataMin - 0.01", "dataMax + 0.01"]}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #6b7280",
                  borderRadius: "8px",
                  color: "#f9fafb",
                }}
              />
              <Line type="monotone" dataKey="high" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="low" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="open" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="close" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
});

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Hello! I'm Novex AI, your intelligent DeFi assistant. I'm here to help you navigate decentralized finance with real-time insights and personalized recommendations. How can I assist you today?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: Message = { 
      role: "user", 
      content: input,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const prompt = DEFI_PROMPT_TEMPLATE.replace("{query}", input);
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const rawText = response.text ?? "No response received from the server.";
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/{[\s\S]*}/);

      let systemResponse: Message;
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonString);

        if (parsed.type === "hist_data" || parsed.type === "candlestick_history") {
          systemResponse = {
            role: "system",
            content: "Here's the market analysis you requested:",
            chartData: parsed.data,
            chartType: parsed.type,
            chartTitle: parsed.type === "candlestick_history" ? `Candlestick Analysis - ${parsed.token_name || 'ETH'}` : `Price Tracking - ${parsed.token_name || 'ETH'}`,
            tokenName: parsed.token_name || "ETH",
            timestamp: Date.now(),
          };
        } else {
          systemResponse = {
            role: "system",
            content: JSON.stringify(parsed, null, 2),
            timestamp: Date.now(),
          };
        }
      } else {
        systemResponse = {
          role: "system",
          content: rawText.trim(),
          timestamp: Date.now(),
        };
      }
      setMessages((prev) => [...prev, systemResponse]);
    } catch (err) {
      setError("Failed to fetch response. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "An error occurred while processing your request.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleReset = useCallback(() => {
    setMessages([
      {
        role: "system",
        content: "Hello! I'm Novex AI, your intelligent DeFi assistant. I'm here to help you navigate decentralized finance with real-time insights and personalized recommendations. How can I assist you today?",
        timestamp: Date.now(),
      },
    ]);
    setError(null);
  }, []);

  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);

  const handleSuggestionClick = useCallback((text: string) => {
    setInput(text);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <Brain className="h-8 w-8 text-purple-400" aria-hidden="true" />
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Novex AI Assistant</h1>
              <p className="text-gray-300 flex items-center gap-2 text-lg mt-1 font-medium">
                <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" aria-hidden="true" />
                Powered by real-time market intelligence
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={handleReset}
            className="border-gray-600 text-white hover:bg-purple-600/20"
            aria-label="Start new conversation"
          >
            <RefreshCw className="h-5 w-5 mr-2" aria-hidden="true" />
            New Conversation
          </Button>
        </header>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              className="text-gray-300 hover:bg-purple-600/20"
              onClick={() => handleSuggestionClick(suggestion.text)}
              aria-label={`Ask: ${suggestion.text}`}
            >
              <suggestion.icon className="h-4 w-4 mr-2" aria-hidden="true" />
              {suggestion.text}
            </Button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6 mb-4 max-h-[calc(100vh-16rem)]">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`} role="region" aria-label={message.role === "user" ? "User message" : "AI response"}>
              {message.content === "CHART_DATA" || message.chartType ? (
                <div className="w-full max-w-4xl">
                  {message.chartType === "candlestick_history" ? (
                    <CandlestickChart data={message.chartData || mockCandlestickData} title={message.chartTitle || "Chart"} />
                  ) : (
                    <HistoricalPriceChart data={message.chartData || mockHistoricalData} title={message.chartTitle || "Chart"} />
                  )}
                </div>
              ) : (
                <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-3`}>
                  <div className={`rounded-full h-10 w-10 flex items-center justify-center ${message.role === "user" ? "bg-blue-600" : "bg-purple-600"}`}>
                    {message.role === "user" ? (
                      <User className="h-5 w-5 text-white" aria-hidden="true" />
                    ) : (
                      <Bot className="h-5 w-5 text-white" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className={`p-4 rounded-xl ${message.role === "user" ? "bg-blue-600/20" : "bg-purple-600/20"} border border-gray-600`}>
                      <p className="text-gray-100">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">{message.timestamp ? formatTimestamp(message.timestamp) : ""}</span>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyMessage(message.content)}
                        className="text-gray-400 hover:text-white"
                        aria-label="Copy message"
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      {message.role === "system" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          aria-label="Like message"
                        >
                          <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full h-10 w-10 flex items-center justify-center bg-purple-600">
                  <Bot className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <div className="flex space-x-2 p-4 bg-purple-600/20 rounded-xl">
                  <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "-0.3s" }}></div>
                  <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "-0.15s" }}></div>
                  <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="text-red-400 p-4 bg-red-600/20 rounded-xl" role="alert">{error}</div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            placeholder="Ask about DeFi, trading strategies, or market analysis..."
            className="flex-1 p-2 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={loading}
            aria-label="Enter your question"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button
            onClick={() => setInput("")}
            disabled={loading || !input.trim()}
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-700"
            aria-label="Clear input"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}