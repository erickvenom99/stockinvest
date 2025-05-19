"use client"

import type React from "react"

import { createContext, type ReactNode, useContext, useState, useEffect } from "react"
import { toast } from "sonner"
import { createAndTrackTransaction, getActiveVerifications, stopVerification } from "@/lib/services/transaction-tracker"
import type { Plan } from "@/types/plan"

// Define the wallet configuration
export const walletConfig = {
  BTC: {
    address: process.env.NEXT_PUBLIC_BTC_ADDRESS || "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    network: "Bitcoin Network",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  },
  USDT: {
    address: process.env.NEXT_PUBLIC_USDT_ADDRESS || "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    network: "ERC20 Network",
    image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
  },
}

export type TransactionState = {
  activeAction: "send" | "receive" | "history" | null
  showActionModal: boolean
  currency: "BTC" | "USDT"
  selectedPlan: Plan | null
  verificationStatus: "idle" | "pending" | "verified" | "failed"
  verificationStarted: boolean
  isCopied: boolean
  isSubmitting: boolean
  activeVerificationKey: string | null
}

export type TransactionContextType = {
  state: TransactionState
  handleQuickAction: (action: "send" | "receive" | "history") => void
  closeModal: () => void
  setCurrency: (currency: "BTC" | "USDT") => void
  setSelectedPlan: (plan: Plan | null) => void
  handleCreateTransaction: (e: React.MouseEvent) => Promise<void>
  handleCopyAddress: () => Promise<void>
  resetVerification: () => void
}

const initialState: TransactionState = {
  activeAction: null,
  showActionModal: false,
  currency: "BTC",
  selectedPlan: null,
  verificationStatus: "idle",
  verificationStarted: false,
  isCopied: false,
  isSubmitting: false,
  activeVerificationKey: null,
}

export const TransactionContext = createContext<TransactionContextType | null>(null)

export const useTransaction = () => {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error("useTransaction must be used within a TransactionProvider")
  }
  return context
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TransactionState>(initialState)

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("transactionState")
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        setState((prev) => ({
          ...prev,
          ...parsedState,
          // Always reset modal state on page load
          showActionModal: false,
        }))
      }
    } catch (error) {
      console.error("Error loading transaction state:", error)
    }

    // Check for active verifications
    const activeVerifications = getActiveVerifications()
    if (activeVerifications.length > 0) {
      const [key, verification] = activeVerifications[0]
      setState((prev) => ({
        ...prev,
        verificationStarted: true,
        verificationStatus: "pending",
        currency: verification.currency,
        selectedPlan: verification.planName
          ? {
              name: verification.planName,
              range: "",
              minAmount: verification.minAmount,
              bonus: "",
              duration: "",
              color: "",
            }
          : null,
        activeVerificationKey: key,
      }))

      toast.info("Transaction Verification", {
        description: "We're still verifying your previous transaction",
      })
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    // Only save specific parts of the state that we want to persist
    const stateToSave = {
      currency: state.currency,
      verificationStatus: state.verificationStatus,
      verificationStarted: state.verificationStarted,
      activeVerificationKey: state.activeVerificationKey,
    }
    localStorage.setItem("transactionState", JSON.stringify(stateToSave))
  }, [state.currency, state.verificationStatus, state.verificationStarted, state.activeVerificationKey])

  const handleQuickAction = (action: "send" | "receive" | "history") => {
    setState((prev) => ({
      ...prev,
      activeAction: action,
      showActionModal: true,
    }))
  }

  const closeModal = () => {
    setState((prev) => ({
      ...prev,
      activeAction: null,
      showActionModal: false,
      // Don't reset verification state here
    }))
  }

  const setCurrency = (currency: "BTC" | "USDT") => {
    setState((prev) => ({ ...prev, currency }))
  }

  const setSelectedPlan = (plan: Plan | null) => {
    setState((prev) => ({ ...prev, selectedPlan: plan }))
  }

  const resetVerification = () => {
    if (state.activeVerificationKey) {
      stopVerification(state.activeVerificationKey)
    }

    setState((prev) => ({
      ...prev,
      verificationStatus: "idle",
      verificationStarted: false,
      activeVerificationKey: null,
    }))
  }

  const handleCreateTransaction = async (e: React.MouseEvent) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!state.selectedPlan) return

    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      verificationStarted: true,
      verificationStatus: "pending",
    }))

    try {
      // Create and track the transaction
      const transactionId = await createAndTrackTransaction({
        amount: state.selectedPlan.minAmount,
        currency: state.currency,
        toAddress: walletConfig[state.currency].address,
        planName: state.selectedPlan.name,
        onSuccess: () => {
          setState((prev) => ({ ...prev, verificationStatus: "verified" }))
          // Reset after a pause
          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              selectedPlan: null,
              verificationStatus: "idle",
              verificationStarted: false,
              activeVerificationKey: null,
            }))
          }, 5000)
        },
        onFailure: () => {
          setState((prev) => ({ ...prev, verificationStatus: "failed" }))
        },
      })

      if (!transactionId) {
        setState((prev) => ({ ...prev, verificationStatus: "failed" }))
      } else {
        // Store the active verification key
        const activeVerifications = getActiveVerifications()
        if (activeVerifications.length > 0) {
          const [key] = activeVerifications[0]
          setState((prev) => ({ ...prev, activeVerificationKey: key }))
        }
      }
    } catch (error) {
      console.error("Error creating transaction:", error)
      setState((prev) => ({ ...prev, verificationStatus: "failed" }))
      toast.error("Transaction Error", {
        description: error instanceof Error ? error.message : "Failed to create transaction",
      })
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletConfig[state.currency].address)
      setState((prev) => ({ ...prev, isCopied: true }))
      setTimeout(() => {
        setState((prev) => ({ ...prev, isCopied: false }))
      }, 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      toast.error("Failed to copy address")
    }
  }

  return (
    <TransactionContext.Provider
      value={{
        state,
        handleQuickAction,
        closeModal,
        setCurrency,
        setSelectedPlan,
        handleCreateTransaction,
        handleCopyAddress,
        resetVerification,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}
