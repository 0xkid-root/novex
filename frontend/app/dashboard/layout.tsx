"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { ConnectWalletButton } from "@/components/ui/connect-wallet-button"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Get page name from pathname
  

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-900/95 via-purple-900/95 to-slate-900/95 overflow-hidden">
      {/* Enhanced background with subtle elegant effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
      
      {/* Refined grid background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      {/* Main layout with improved transitions */}
      <div className="flex">
        <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <div className={cn(
          "flex-1 transition-all duration-300 min-h-screen",
          sidebarOpen ? "ml-64" : "ml-16"
        )}>
          
          
          <main className="py-10 px-12 t  max-w-[1400px] mx-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Enhanced bottom gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 pointer-events-none blur-xl"></div>
    </div>
  )
}
