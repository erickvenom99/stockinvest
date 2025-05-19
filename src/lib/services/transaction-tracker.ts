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
    onSuccess?: () => void
    onFailure?: () => void
  }
>()

// Initialize the service
export function initTransactionTracker() {
  // Load any saved transactions from localStorage
  try {
    const savedTransactions = localStorage.getItem("pendingTransactions")
    if (savedTransactions) {
      const transactions = JSON.parse(savedTransactions)
      transactions.forEach((tx: any) => {
        if (tx.transactionId && tx.currency && tx.minAmount) {
          startVerification(tx.transactionId, tx.currency, tx.minAmount, tx.planName, tx.onSuccess, tx.onFailure)
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
) {
  // Generate a unique key for this verification
  const key = `${transactionId}-${Date.now()}`

  // Set up the 30-minute timeout
  const timeout = setTimeout(
    () => {
      stopVerification(key)
      toast.error("Verification Timeout", {
        description: "The transaction verification timed out. Please try again.",
      })
      if (onFailure) onFailure()
    },
    30 * 60 * 1000,
  ) // 30 minutes

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
