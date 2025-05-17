"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PieChart, LineChart, BarChart, Activity, Calendar, Filter } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Mock portfolio data
const portfolioData = {
  totalValue: 24532.8,
  change24h: 2.4,
  changeValue: 587.79,
  assets: [
    {
      name: "Bitcoin",
      symbol: "BTC",
      value: 15200.5,
      allocation: 62,
      change24h: 2.8,
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      value: 5600.3,
      allocation: 22.8,
      change24h: 1.5,
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    },
    {
      name: "Solana",
      symbol: "SOL",
      value: 2100.0,
      allocation: 8.6,
      change24h: 3.2,
      image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    },
    {
      name: "Cardano",
      symbol: "ADA",
      value: 1050.0,
      allocation: 4.3,
      change24h: -0.8,
      image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    },
    {
      name: "Tether",
      symbol: "USDT",
      value: 582.0,
      allocation: 2.3,
      change24h: 0.1,
      image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    },
  ],
  history: [
    { date: "May 1", value: 22500 },
    { date: "May 2", value: 22800 },
    { date: "May 3", value: 23100 },
    { date: "May 4", value: 22900 },
    { date: "May 5", value: 23300 },
    { date: "May 6", value: 23700 },
    { date: "May 7", value: 24100 },
    { date: "May 8", value: 23800 },
    { date: "May 9", value: 24200 },
    { date: "May 10", value: 24500 },
    { date: "May 11", value: 24532.8 },
  ],
}

export default function PortfolioPage() {
  const [timeframe, setTimeframe] = useState("1W")

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Total Portfolio Value</h3>
              <div className="text-3xl font-bold">${portfolioData.totalValue.toLocaleString()}</div>
            </div>
            <div className="flex flex-col items-end">
              <div
                className={cn(
                  "flex items-center text-sm",
                  portfolioData.change24h >= 0 ? "text-green-500" : "text-red-500",
                )}
              >
                {portfolioData.change24h >= 0 ? "↑" : "↓"} {Math.abs(portfolioData.change24h)}% (24h)
              </div>
              <div className="text-sm text-muted-foreground">${portfolioData.changeValue.toLocaleString()}</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Tabs defaultValue="chart" className="w-[200px]">
                <TabsList>
                  <TabsTrigger value="chart">
                    <LineChart className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="distribution">
                    <PieChart className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    <Activity className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={timeframe === "1D" ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setTimeframe("1D")}
                >
                  1D
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={timeframe === "1W" ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setTimeframe("1W")}
                >
                  1W
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={timeframe === "1M" ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setTimeframe("1M")}
                >
                  1M
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={timeframe === "1Y" ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setTimeframe("1Y")}
                >
                  1Y
                </Button>
              </div>
            </div>
            {/* Placeholder for chart */}
            <div className="h-[300px] bg-muted/50 rounded-lg flex items-center justify-center">
              <LineChart className="h-8 w-8 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Portfolio Performance Chart</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Asset Allocation</h3>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioData.assets.map((asset) => (
                <motion.div
                  key={asset.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Image
                      src={asset.image || "/placeholder.svg"}
                      alt={asset.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${asset.value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{asset.allocation}%</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Asset Distribution</span>
                <div className="flex -space-x-2">
                  {portfolioData.assets.map((asset) => (
                    <div
                      key={asset.symbol}
                      className="w-6 h-6 rounded-full border-2 border-background overflow-hidden"
                      style={{ zIndex: 1 }}
                    >
                      <Image src={asset.image || "/placeholder.svg"} alt={asset.name} width={24} height={24} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden flex">
                {portfolioData.assets.map((asset, index) => (
                  <div
                    key={asset.symbol}
                    className="h-full"
                    style={{
                      width: `${asset.allocation}%`,
                      backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Performance by Asset</h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
              <Button variant="outline" size="sm">
                <BarChart className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {portfolioData.assets.map((asset) => (
              <Card key={asset.symbol} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={asset.image || "/placeholder.svg"}
                        alt={asset.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${asset.value.toLocaleString()}</div>
                      <div
                        className={cn(
                          "text-xs flex items-center justify-end",
                          asset.change24h >= 0 ? "text-green-500" : "text-red-500",
                        )}
                      >
                        {asset.change24h >= 0 ? "↑" : "↓"} {Math.abs(asset.change24h)}%
                      </div>
                    </div>
                  </div>
                  <div className="h-[100px] bg-muted/30 flex items-center justify-center">
                    <LineChart className="h-6 w-6 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
