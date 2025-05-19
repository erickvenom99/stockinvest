"use client"

import type React from "react"

import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import MobileBottomNavBar from "@/components/MobileBottomNavBar"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { UserProvider } from "@/contexts/user/user-context"
import { TransactionProvider } from "@/contexts/transaction/transaction-context" // Replace ModalProvider import
import { usePathname } from "next/navigation"
import { getPageTitle } from "@/lib/utils/route-titles"
import { cn } from "@/lib/utils"

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <UserProvider>
      <TransactionProvider>
        {" "}
        {/* Replace ModalProvider with TransactionProvider */}
        <SidebarProvider>
          <div className="flex min-h-screen bg-background relative w-full justify-center">
            {/* --- Desktop Sidebar --- */}
            <div>
              <AppSidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
            </div>

            {/* --- Desktop Toggle Button --- */}
            <div
              className={`hidden md:flex fixed top-4 z-50 transition-all duration-300 ${collapsed ? "left-20" : "left-72"}`}
            >
              <SidebarTrigger
                onClick={toggleSidebar}
                className="w-8 h-8 flex items-center justify-center bg-background rounded-full shadow-lg ring-1 ring-gray-200 hover:bg-gray-100 transition"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </SidebarTrigger>
            </div>

            {/* --- Mobile Drawer --- */}
            <div
              className={cn(
                `fixed inset-0 z-50 md:hidden transform transition-transform duration-300 ease-in-out ` +
                  (mobileOpen ? "translate-x-0" : "-translate-x-full"),
              )}
            >
              <div className="relative w-[300px] h-full bg-background shadow-xl z-20 overflow-y-auto">
                <AppSidebar collapsed={false} toggleSidebar={() => {}} />
              </div>
              <div className="absolute inset-0 bg-black/50 z-10" onClick={toggleMobile} />
            </div>

            {/* --- Main Content --- */}
            <main
              className={cn(
                "flex-1 flex flex-col max-w-7xl",
                collapsed ? "md:ml-10" : "md:ml-10",
                "transition-[margin] duration-300",
              )}
            >
              <header className="sticky top-0 bg-background/95 backdrop-blur z-40 border-b flex items-center px-4 py-3 h-30">
                <button
                  className="md:hidden p-2 rounded-full hover:bg-accent transition"
                  onClick={toggleMobile}
                  aria-label="Open navigation"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="flex-1 text-5xl font-semibold text-gray-700 text-center md:text-left truncate">
                  {pageTitle || "Dashboard"}
                </h1>
              </header>

              <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px:8 py-6 h-[calc(100vh-4rem)]">{children}</div>
              </div>
            </main>

            <MobileBottomNavBar className="md:hidden" />
          </div>
        </SidebarProvider>
      </TransactionProvider>
    </UserProvider>
  )
}
