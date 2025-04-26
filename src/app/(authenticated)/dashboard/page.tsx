// app/(authenticated)/dashboard/page.tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Wallet, Coins, Clock, Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
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
            <h3 className="text-lg font-semibold">Asset Allocation</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full" />
                <span>Bitcoin (BTC)</span>
              </div>
              <div className="font-mono">54%</div>
            </div>
            {/* Repeat for other assets */}
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button className="h-24 flex flex-col items-center justify-center space-y-2">
          <Plus className="w-6 h-6" />
          <span>Buy Crypto</span>
        </Button>
        <Button variant="secondary" className="h-24 flex flex-col items-center justify-center space-y-2">
          <ArrowUpRight className="w-6 h-6" />
          <span>Send</span>
        </Button>
        <Button variant="secondary" className="h-24 flex flex-col items-center justify-center space-y-2">
          <ArrowDownRight className="w-6 h-6" />
          <span>Receive</span>
        </Button>
        <Button variant="secondary" className="h-24 flex flex-col items-center justify-center space-y-2">
          <Clock className="w-6 h-6" />
          <span>History</span>
        </Button>
      </div>

      {/* Section 3: Market Overview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Your Assets</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full" />
                <div>
                  <div className="font-medium">Bitcoin (BTC)</div>
                  <div className="text-sm text-muted-foreground">0.54 BTC</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">$23,450.00</div>
                <div className="text-sm text-green-500">+1.2%</div>
              </div>
            </div>
            {/* Repeat for other assets */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}