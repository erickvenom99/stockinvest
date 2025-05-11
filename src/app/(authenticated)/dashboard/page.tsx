"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { ArrowUpRight, Wallet } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"
import QuickActionMenu from "@/components/quick-action-menu"

interface CryptoData {
  id: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  symbol: string
  image?: string
  price_change_24h: number
}

export default function DashboardPage() {
  const [marketData, setMarketData] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchData = async () => {
      try {
        const response = await fetch("/api/market-data", {
          signal: controller.signal,
        })

        if (!response.ok) throw new Error("Failed to fetch")

        const data = await response.json()
        if (isMounted) {
          setMarketData(data)
          setError(null)
        }
      } catch (error) {
        if (isMounted) {
          setError(`Failed to load latest data. Showing cached information.`)
          console.error("Error: ", error)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => {
      isMounted = false
      clearInterval(interval)
      controller.abort()
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[300px] w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-yellow-100 border boerder-yellow-200 rounded-lg">⚠️ {error}</div>}
      {/* Section 1: Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Portfolio Value</h3>
              <div className="text-3xl font-bold">$24,532.80</div>
              <div className="flex items-center text-green-500">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                +2.4% (24h)
              </div>
            </div>
            <Wallet className="w-8 h-8 text-primary" />
          </CardHeader>
          <CardContent>
            {/* Placeholder for chart */}
            <div className="h-48 bg-muted rounded-lg" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold"> Asset Allocation</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketData
              .slice(0, 6)
              .filter((coin) => coin.symbol.toUpperCase() !== "USDT")
              .map((coin) => {
                const isPositive = coin.price_change_percentage_24h >= 0
                return (
                  <div key={coin.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {coin.image && (
                        <div className="shrink-0">
                          <Image
                            src={coin.image || "/placeholder.svg"}
                            alt={coin.name}
                            width={32}
                            height={32}
                            className="rounded-full object-contain"
                            unoptimized
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).style.display = "none"
                            }}
                          />
                        </div>
                      )}
                      <span className="align-middle">
                        {coin.name} ({coin.symbol.toUpperCase()})
                      </span>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={coin.price_change_percentage_24h}
                        initial={{ y: isPositive ? 10 : -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "font-mono flex items-center gap-1",
                          isPositive ? "text-green-500" : "text-red-500",
                        )}
                      >
                        {isPositive ? "↑" : "↓"}
                        {coin.price_change_percentage_24h.toFixed(1)}%
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Quick Actions */}
      <QuickActionMenu />

      {/* Section 3: Market Overview */}
      <Card>
        <CardHeader className="flex justify-between">
          <h3 className="text-lg font-semibold">Market Overview</h3>
          {/* Live Status Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-green-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              LIVE PRICES
            </div>
            <span className="text-xs text-muted-foreground">Updated every 5 seconds</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.slice(0, 10).map((coin) => {
              const isPositive = coin.price_change_percentage_24h >= 0
              const currentPrice = coin.current_price
              const priceDecimal = currentPrice < 1 ? 6 : 2 //currentPrice < 10 ? 4 : 2

              return (
                <motion.div
                  key={coin.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-colors",
                    isPositive ? "bg-green-50/50" : "bg-red-50/50",
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {coin.image && (
                      <div className="relative w-8 h-8">
                        <Image
                          src={coin.image || "/placeholder.svg"}
                          alt={coin.name}
                          width={32}
                          height={32}
                          className="rounded-full object-contain"
                          unoptimized
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{coin.name}</div>
                      <div className="text-sm text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPrice}
                        initial={{ y: isPositive ? 10 : -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "font-medium",
                          // isPositive ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        $
                        {currentPrice.toLocaleString(undefined, {
                          minimumFractionDigits: priceDecimal,
                          maximumFractionDigits: priceDecimal,
                        })}
                      </motion.div>
                    </AnimatePresence>
                    <div
                      className={cn(
                        "text-sm flex items-center justify-end gap-1",
                        isPositive ? "text-green-500" : "text-red-500",
                      )}
                    >
                      {isPositive ? "↑" : "↓"}
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
