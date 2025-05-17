"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Clock, Plus, BarChart3, Wallet, RefreshCw, CreditCard } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import SendModal from "@/components/SendModal"
import ReceiveModal from "@/components/receive-modal"
import TransactionHistoryModal from "@/components/transaction-history-modal"
import type { Plan } from "@/types/plan"
import { useRouter } from "next/navigation"

interface QuickActionMenuProps {
  className?: string
}

interface SendModalState {
  currency: "BTC" | "USDT"
  selectedPlan: Plan | null
  verificationStatus: "idle" | "pending" | "verified" | "failed"
  verificationStarted: boolean
  isCopied: boolean
}

export default function QuickActionMenu({ className }: QuickActionMenuProps) {
  const router = useRouter()
  const [activeAction, setActiveAction] = useState<"send" | "receive" | "history" | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
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

  const handleQuickAction = (action: "send" | "receive" | "history") => {
    setActiveAction(action)
    setShowActionModal(true)
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <Button
          variant={activeAction === "send" ? "default" : "secondary"}
          className="h-24 flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer hover:shadow-md"
          onClick={() => handleQuickAction("send")}
        >
          <ArrowUpRight className="w-6 h-6" />
          <span>Send</span>
        </Button>
        <Button
          variant={activeAction === "receive" ? "default" : "secondary"}
          className="h-24 flex flex-col items-center justify-center space-y-2 transition-all"
          onClick={() => handleQuickAction("receive")}
        >
          <ArrowDownRight className="w-6 h-6" />
          <span>Receive</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="h-24 flex flex-col items-center justify-center space-y-2 transition-all relative group"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
              <span>More Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleQuickAction("history")}>
              <Clock className="mr-2 h-4 w-4" />
              <span>Transaction History</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/portfolio")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Portfolio Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/investments")}>
              <Wallet className="mr-2 h-4 w-4" />
              <span>Investments</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/markets")}>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Market Data</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate("/accounts")}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Manage Accounts</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog
        open={showActionModal}
        onOpenChange={(open) => {
          setShowActionModal(open)
          if (!open) {
            setActiveAction(null)
            resetSendModalState()
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] border-0 rounded-xl shadow-xl bg-background sm:top-[50%] sm:translate-y-[-50%] bottom-0 top-auto h-[95vh] max-h-[100dvh] flex flex-col overflow-hidden">
          <div className="absolute inset-0 rounded-xl border-2 border-primary/10 backdrop-blur-sm" />
          <div className="relative z-10 h-full flex flex-col">
            <DialogHeader className="shrink-0 px-6 pt-6 pb-3">
              <h3 className="text-lg font-semibold capitalize">{activeAction}</h3>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-6" key={activeAction}>
              {activeAction === "send" && <SendModal {...sendModalProps} />}
              {activeAction === "receive" && <ReceiveModal />}
              {activeAction === "history" && <TransactionHistoryModal />}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
