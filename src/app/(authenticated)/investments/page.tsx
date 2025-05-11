"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight, Clock, CheckCircle, AlertCircle, Info, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import SendModal from "@/components/SendModal"
import { type Plan, PLANS } from "@/types/plan"

interface SendModalState {
  currency: "BTC" | "USDT"
  selectedPlan: Plan | null
  verificationStatus: "idle" | "pending" | "verified" | "failed"
  verificationStarted: boolean
  isCopied: boolean
}

// Mock active investments
const activeInvestments = [
  {
    id: "inv1",
    plan: "Silver",
    amount: 1000,
    currency: "USDT",
    startDate: "2025-04-15T10:00:00Z",
    endDate: "2025-07-15T10:00:00Z",
    status: "active",
    returns: 80,
    progress: 33,
  },
  {
    id: "inv2",
    plan: "Gold",
    amount: 0.05,
    currency: "BTC",
    startDate: "2025-05-01T14:30:00Z",
    endDate: "2025-08-01T14:30:00Z",
    status: "active",
    returns: 210,
    progress: 12,
  },
]

// Mock completed investments
const completedInvestments = [
  {
    id: "inv3",
    plan: "Bronze",
    amount: 500,
    currency: "USDT",
    startDate: "2025-01-10T09:15:00Z",
    endDate: "2025-04-10T09:15:00Z",
    status: "completed",
    returns: 37.5,
    progress: 100,
  },
  {
    id: "inv4",
    plan: "Silver",
    amount: 0.02,
    currency: "BTC",
    startDate: "2025-02-05T11:45:00Z",
    endDate: "2025-05-05T11:45:00Z",
    status: "completed",
    returns: 0.0016,
    progress: 100,
  },
]

export default function InvestmentsPage() {
  const [showInvestModal, setShowInvestModal] = useState(false)
  const [sendModalState, setSendModalState] = useState<SendModalState>({
    currency: "BTC",
    selectedPlan: null,
    verificationStatus: "idle",
    verificationStarted: false,
    isCopied: false,
  })

  const resetSendModalState = () => {
    setSendModalState((prev) => ({
      ...prev,
      currency: "BTC",
      selectedPlan: null,
      isCopied: false,
    }))
  }

  const sendModalProps = {
    currency: sendModalState.currency,
    selectedPlan: sendModalState.selectedPlan,
    verificationStatus: sendModalState.verificationStatus,
    verificationStarted: sendModalState.verificationStarted,
    isCopied: sendModalState.isCopied,
    setCurrency: (currency: "BTC" | "USDT") => setSendModalState((prev) => ({ ...prev, currency })),
    setSelectedPlan: (plan: Plan | null) => setSendModalState((prev) => ({ ...prev, selectedPlan: plan })),
    setVerificationStatus: (status: "idle" | "pending" | "verified" | "failed") =>
      setSendModalState((prev) => ({ ...prev, verificationStatus: status })),
    setVerificationStarted: (started: boolean) =>
      setSendModalState((prev) => ({ ...prev, verificationStarted: started })),
    setIsCopied: (copied: boolean) => setSendModalState((prev) => ({ ...prev, isCopied: copied })),
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Investment Plans</h1>
          <p className="text-muted-foreground">Manage your active investments and explore new opportunities</p>
        </div>
        <Button onClick={() => setShowInvestModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Investment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={`overflow-hidden ${plan.color}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.range}</p>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  {plan.duration}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Min Investment</span>
                  <span className="font-medium">${plan.minAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ROI</span>
                  <span className="font-medium text-green-600">{plan.bonus}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payout</span>
                  <span className="font-medium">At maturity</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => {
                  setSendModalState((prev) => ({ ...prev, selectedPlan: plan }))
                  setShowInvestModal(true)
                }}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Invest Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="active">Active Investments</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          {activeInvestments.length > 0 ? (
            activeInvestments.map((investment) => (
              <Card key={investment.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <h3 className="font-bold text-lg">{investment.plan} Plan</h3>
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {formatDate(investment.startDate)} - {formatDate(investment.endDate)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Investment: </span>
                        {investment.amount} {investment.currency} ($
                        {(investment.amount * (investment.currency === "BTC" ? 30000 : 1)).toLocaleString()})
                      </div>
                      <div className="text-sm text-green-600">
                        <span className="font-medium">Expected Return: </span>
                        {investment.returns} {investment.currency === "BTC" ? "USD" : "USD"}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Time Remaining</div>
                        <div className="font-bold">{calculateDaysRemaining(investment.endDate)} days</div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{investment.progress}%</span>
                        </div>
                        <Progress value={investment.progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <Info className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg">No Active Investments</h3>
              <p className="text-muted-foreground mt-1">Start investing to see your active plans here</p>
              <Button className="mt-4" onClick={() => setShowInvestModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Investment
              </Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {completedInvestments.length > 0 ? (
            completedInvestments.map((investment) => (
              <Card key={investment.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <h3 className="font-bold text-lg">{investment.plan} Plan</h3>
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                          Completed
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        {formatDate(investment.startDate)} - {formatDate(investment.endDate)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Investment: </span>
                        {investment.amount} {investment.currency} ($
                        {(investment.amount * (investment.currency === "BTC" ? 30000 : 1)).toLocaleString()})
                      </div>
                      <div className="text-sm text-green-600">
                        <span className="font-medium">Total Return: </span>
                        {investment.returns} {investment.currency === "BTC" ? "USD" : "USD"}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="font-bold text-green-600">Paid Out</div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-sm">
                          <span>Completed</span>
                          <span>100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg">No Completed Investments</h3>
              <p className="text-muted-foreground mt-1">Your completed investments will appear here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={showInvestModal}
        onOpenChange={(open) => {
          setShowInvestModal(open)
          if (!open) {
            resetSendModalState()
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] border-0 rounded-xl shadow-xl bg-background sm:top-[50%] sm:translate-y-[-50%] bottom-0 top-auto h-[95vh] max-h-[100dvh] flex flex-col overflow-hidden">
          <div className="absolute inset-0 rounded-xl border-2 border-primary/10 backdrop-blur-sm" />
          <div className="relative z-10 h-full flex flex-col">
            <DialogHeader className="shrink-0 px-6 pt-6 pb-3">
              <h3 className="text-lg font-semibold">New Investment</h3>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <SendModal {...sendModalProps} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
