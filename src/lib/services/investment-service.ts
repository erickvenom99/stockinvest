import { v4 as uuidv4 } from "uuid"
import Account from "@/lib/models/account"
import Transaction from "@/lib/models/transaction"
import { PLANS, type Plan } from "@/types/plan"
import mongoose from "mongoose"

// Utility to convert between currencies
const currencyRates = {
  BTC: 30000, // 1 BTC = $30,000 USD
  USDT: 1, // 1 USDT = $1 USD
  USD: 1,
}

export interface CreateInvestmentParams {
  userId: string
  transactionId: string
  planName: string
  amount: number
  currency: "BTC" | "USDT" | "USD"
}

export interface InvestmentData {
  id: string
  planName: string
  amount: number
  currency: string
  startDate: Date
  endDate: Date
  status: "active" | "completed" | "cancelled"
  initialValue: number
  currentValue: number
  targetValue: number
  lastUpdated: Date
  dailyGrowthRate: number
  history: Array<{
    date: Date
    value: number
  }>
}

export async function createInvestment({
  userId,
  transactionId,
  planName,
  amount,
  currency,
}: CreateInvestmentParams): Promise<InvestmentData | null> {
  try {
    // Find the plan
    const plan = PLANS.find((p) => p.name === planName)
    if (!plan) {
      throw new Error(`Plan ${planName} not found`)
    }

    // Verify the transaction
    const transaction = await Transaction.findById(transactionId)
    if (!transaction || transaction.user.toString() !== userId || transaction.status !== "completed") {
      throw new Error("Invalid or incomplete transaction")
    }

    // Calculate investment details
    const investmentData = calculateInvestmentDetails(plan, amount, currency)

    // Update the user's account
    const account = await Account.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      {
        $push: {
          investments: investmentData,
          portfolioHistory: {
            date: new Date(),
            totalValue: investmentData.initialValue,
            btcValue: currency === "BTC" ? investmentData.initialValue : 0,
            usdtValue: currency === "USDT" ? investmentData.initialValue : 0,
            usdValue: currency === "USD" ? investmentData.initialValue : 0,
            investmentsValue: investmentData.initialValue,
          },
        },
      },
      { new: true, upsert: true },
    )

    if (!account) {
      throw new Error("Failed to update account")
    }

    return investmentData
  } catch (error) {
    console.error("Error creating investment:", error)
    return null
  }
}

function calculateInvestmentDetails(plan: Plan, amount: number, currency: string): InvestmentData {
  // Convert amount to USD for consistent calculations
  const amountInUSD = amount * currencyRates[currency as keyof typeof currencyRates]

  // Parse ROI percentage from the plan
  const roiPercentage = Number.parseFloat(plan.bonus.replace(/[^0-9.]/g, "")) / 100

  // Calculate duration in days
  const durationDays = Number.parseInt(plan.duration.split(" ")[0])

  // Calculate target value after ROI
  const targetValue = amountInUSD * (1 + roiPercentage)

  // Calculate daily growth rate
  const dailyGrowthRate = Math.pow(1 + roiPercentage, 1 / durationDays) - 1

  // Set start and end dates
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + durationDays)

  // Create initial history entry
  const initialHistory = [
    {
      date: new Date(),
      value: amountInUSD,
    },
  ]

  return {
    id: uuidv4(),
    planName: plan.name,
    amount,
    currency,
    startDate,
    endDate,
    status: "active",
    initialValue: amountInUSD,
    currentValue: amountInUSD,
    targetValue,
    lastUpdated: new Date(),
    dailyGrowthRate,
    history: initialHistory,
  }
}

export async function updateInvestments(userId: string): Promise<boolean> {
  try {
    // Find the user's account
    const account = await Account.findOne({ user: new mongoose.Types.ObjectId(userId) })
    if (!account) return false

    let totalPortfolioValue = 0
    const btcValue = account.balances.BTC * currencyRates.BTC
    const usdtValue = account.balances.USDT * currencyRates.USDT
    const usdValue = account.balances.USD
    let investmentsValue = 0

    // Update each active investment
    const updatedInvestments = account.investments.map((investment) => {
      if (investment.status !== "active") {
        investmentsValue += investment.currentValue
        return investment
      }

      const now = new Date()
      const daysSinceLastUpdate = Math.max(
        0,
        (now.getTime() - investment.lastUpdated.getTime()) / (1000 * 60 * 60 * 24),
      )

      // If it's time to update (at least 1 hour has passed)
      if (daysSinceLastUpdate >= 1 / 24) {
        // Calculate new value based on daily growth rate
        const growthFactor = Math.pow(1 + investment.dailyGrowthRate, daysSinceLastUpdate)
        let newValue = investment.currentValue * growthFactor

        // Check if investment has reached its end date
        if (now >= investment.endDate) {
          newValue = investment.targetValue
          investment.status = "completed"
        }

        // Cap the value at the target value
        newValue = Math.min(newValue, investment.targetValue)

        // Update the investment
        investment.currentValue = newValue
        investment.lastUpdated = now

        // Add a new history entry (but not too frequently)
        if (daysSinceLastUpdate >= 1) {
          investment.history.push({
            date: now,
            value: newValue,
          })
        }
      }

      investmentsValue += investment.currentValue
      return investment
    })

    // Calculate total portfolio value
    totalPortfolioValue = btcValue + usdtValue + usdValue + investmentsValue

    // Update the account
    await Account.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      {
        $set: { investments: updatedInvestments },
        $push: {
          portfolioHistory: {
            date: new Date(),
            totalValue: totalPortfolioValue,
            btcValue,
            usdtValue,
            usdValue,
            investmentsValue,
          },
        },
      },
    )

    return true
  } catch (error) {
    console.error("Error updating investments:", error)
    return false
  }
}

export async function getAccountSummary(userId: string) {
  try {
    // Find the user's account
    const account = await Account.findOne({ user: new mongoose.Types.ObjectId(userId) })
    if (!account) {
      return {
        totalValue: 0,
        balances: { BTC: 0, USDT: 0, USD: 0 },
        activeInvestments: [],
        completedInvestments: [],
        portfolioHistory: [],
      }
    }

    // Update investments before returning data
    await updateInvestments(userId)

    // Fetch the updated account
    const updatedAccount = await Account.findOne({ user: new mongoose.Types.ObjectId(userId) })
    if (!updatedAccount) {
      throw new Error("Failed to fetch updated account")
    }

    // Calculate total value
    const btcValue = updatedAccount.balances.BTC * currencyRates.BTC
    const usdtValue = updatedAccount.balances.USDT * currencyRates.USDT
    const usdValue = updatedAccount.balances.USD

    // Calculate investments value
    const investmentsValue = updatedAccount.investments.reduce((total, inv) => total + inv.currentValue, 0)

    // Total portfolio value
    const totalValue = btcValue + usdtValue + usdValue + investmentsValue

    // Separate active and completed investments
    const activeInvestments = updatedAccount.investments.filter((inv) => inv.status === "active")
    const completedInvestments = updatedAccount.investments.filter((inv) => inv.status === "completed")

    // Get portfolio history (last 30 entries)
    const portfolioHistory = updatedAccount.portfolioHistory.slice(-30)

    return {
      totalValue,
      balances: updatedAccount.balances,
      activeInvestments,
      completedInvestments,
      portfolioHistory,
    }
  } catch (error) {
    console.error("Error getting account summary:", error)
    throw error
  }
}
