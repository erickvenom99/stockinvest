import mongoose, { Schema, type Document } from "mongoose"

export interface IAccount extends Document {
  user: mongoose.Types.ObjectId
  balances: {
    BTC: number
    USDT: number
    USD: number
  }
  investments: Array<{
    id: string
    planName: string
    amount: number
    currency: string
    startDate: Date
    endDate: Date
    status: "active" | "completed" | "cancelled"
    initialValue: number // In USD
    currentValue: number // In USD
    targetValue: number // Final value after ROI
    lastUpdated: Date
    dailyGrowthRate: number // Calculated based on ROI and duration
    history: Array<{
      date: Date
      value: number
    }>
  }>
  portfolioHistory: Array<{
    date: Date
    totalValue: number
    btcValue: number
    usdtValue: number
    usdValue: number
    investmentsValue: number
  }>
  createdAt: Date
  updatedAt: Date
}

const AccountSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    balances: {
      BTC: { type: Number, default: 0 },
      USDT: { type: Number, default: 0 },
      USD: { type: Number, default: 0 },
    },
    investments: [
      {
        id: { type: String, required: true },
        planName: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
        initialValue: { type: Number, required: true }, // In USD
        currentValue: { type: Number, required: true }, // In USD
        targetValue: { type: Number, required: true }, // Final value after ROI
        lastUpdated: { type: Date, default: Date.now },
        dailyGrowthRate: { type: Number, required: true },
        history: [
          {
            date: { type: Date, required: true },
            value: { type: Number, required: true },
          },
        ],
      },
    ],
    portfolioHistory: [
      {
        date: { type: Date, required: true },
        totalValue: { type: Number, required: true },
        btcValue: { type: Number, required: true },
        usdtValue: { type: Number, required: true },
        usdValue: { type: Number, required: true },
        investmentsValue: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true },
)

// Create or get the model
export default mongoose.models.Account || mongoose.model<IAccount>("Account", AccountSchema)
