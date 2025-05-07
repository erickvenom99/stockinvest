// models/Transaction.ts
import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  txHash: {
    type: String,
    required: false,
    sparse: true,
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
})

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema)