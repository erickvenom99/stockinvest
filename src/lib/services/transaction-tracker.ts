// lib/services/transaction-tracker.ts
// This service handles transaction tracking even when users navigate away
import { createTransaction, verifyTransaction } from "@/lib/api/transactions"
import { createNewInvestment } from "@/lib/api/portfolio"
import { toast } from "sonner"

// Store active transaction verifications
const activeVerifications = new Map<
  string,
  {
    transactionId: string
    currency: "BTC" | "USDT"
    minAmount: number
    planName?: string
    interval: NodeJS.Timeout
    timeout: NodeJS.Timeout
    startTime: number
    onSuccess?: () => void
    onFailure?: () => void
  }
>()

// Maximum verification time (30 minutes in milliseconds)
const MAX_VERIFICATION_TIME = 30 * 60 * 1000

// Initialize the service
export function initTransactionTracker() {
  // Load any saved transactions from localStorage
  try {
    const savedTransactions = localStorage.getItem("pendingTransactions")
    if (savedTransactions) {
      const transactions = JSON.parse(savedTransactions)
      transactions.forEach((tx: any) => {
        if (tx.transactionId && tx.currency && tx.minAmount) {
          startVerification(
            tx.transactionId,
            tx.currency,
            tx.minAmount,
            tx.planName,
            undefined,
            undefined,
            tx.startTime || Date.now(),
          )
        }
      })
    }
  } catch (error) {
    console.error("Error loading saved transactions:", error)
  }
}

// Save active verifications to localStorage
function saveActiveVerifications() {
  const transactions = Array.from(activeVerifications.entries()).map(([key, value]) => ({
    key,
    transactionId: value.transactionId,
    currency: value.currency,
    minAmount: value.minAmount,
    planName: value.planName,
    startTime: value.startTime,
  }))
  localStorage.setItem("pendingTransactions", JSON.stringify(transactions))
}

// Create a transaction and start verification
export async function createAndTrackTransaction(params: {
  amount: number
  currency: "BTC" | "USDT"
  toAddress: string
  planName?: string
  onSuccess?: () => void
  onFailure?: () => void
}): Promise<string | null> {
  const { amount, currency, toAddress, planName, onSuccess, onFailure } = params

  // Create the transaction
  const result = await createTransaction({
    amount,
    currency,
    toAddress,
    type: "deposit", // Explicitly set as deposit for investments
  })

  if (!result) {
    if (onFailure) onFailure()
    return null
  }

  // Start verification
  startVerification(result._id, currency, amount, planName, onSuccess, onFailure)

  // Return the transaction ID
  return result._id
}

// Start verification process for a transaction
export function startVerification(
  transactionId: string,
  currency: "BTC" | "USDT",
  minAmount: number,
  planName?: string,
  onSuccess?: () => void,
  onFailure?: () => void,
  startTime: number = Date.now(),
) {
  // Generate a unique key for this verification
  const key = `${transactionId}-${Date.now()}`

  // Calculate remaining time if this is a resumed verification
  const elapsedTime = Date.now() - startTime
  const remainingTime = Math.max(0, MAX_VERIFICATION_TIME - elapsedTime)

  // If verification has already timed out, fail immediately
  if (remainingTime === 0) {
    if (onFailure) onFailure()
    toast.error("Verification Timeout", {
      description: "The transaction verification timed out. Please try again.",
    })
    return null
  }

  // Set up the timeout based on remaining time
  const timeout = setTimeout(() => {
    stopVerification(key)
    toast.error("Verification Timeout", {
      description: "The transaction verification timed out. Please try again.",
    })
    if (onFailure) onFailure()
  }, remainingTime)

  // Begin polling for verification
  const interval = setInterval(async () => {
    try {
      const verificationResult = await verifyTransaction(transactionId, currency, minAmount)

      if (verificationResult.status === "confirmed") {
        // Transaction confirmed
        toast.success("Payment Verified", {
          description: "Your transaction has been confirmed on the blockchain",
        })

        // If this was for an investment, create it
        if (planName) {
          const success = await createNewInvestment({
            transactionId,
            planName,
            amount: minAmount,
            currency,
          })

          if (success) {
            toast.success("Investment Created", {
              description: `Your ${planName} plan investment has been created successfully`,
            })
          }
        }

        // Clean up and call success callback
        stopVerification(key)
        if (onSuccess) onSuccess()
      } else if (verificationResult.status === "failed") {
        // Transaction failed
        toast.error("Verification Failed", {
          description: "The transaction could not be verified. Please check the details and try again.",
        })

        stopVerification(key)
        if (onFailure) onFailure()
      }
    } catch (error) {
      console.error("Error verifying transaction:", error)
    }
  }, 15000) // Check every 15 seconds

  // Store the verification
  activeVerifications.set(key, {
    transactionId,
    currency,
    minAmount,
    planName,
    interval,
    timeout,
    startTime,
    onSuccess,
    onFailure,
  })

  // Save to localStorage
  saveActiveVerifications()

  return key
}

// Stop a verification process
export function stopVerification(key: string) {
  const verification = activeVerifications.get(key)
  if (verification) {
    clearInterval(verification.interval)
    clearTimeout(verification.timeout)
    activeVerifications.delete(key)
    saveActiveVerifications()
  }
}

// Stop all verifications
export function stopAllVerifications() {
  activeVerifications.forEach((verification, key) => {
    clearInterval(verification.interval)
    clearTimeout(verification.timeout)
  })
  activeVerifications.clear()
  localStorage.removeItem("pendingTransactions")
}

// Get all active verifications
export function getActiveVerifications() {
  return Array.from(activeVerifications.entries())
}

// Check if a transaction has been running too long and should be failed
export function checkVerificationTimeout(key: string): boolean {
  const verification = activeVerifications.get(key)
  if (!verification) return false

  const elapsedTime = Date.now() - verification.startTime
  return elapsedTime >= MAX_VERIFICATION_TIME
}
