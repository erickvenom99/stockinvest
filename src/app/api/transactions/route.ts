import { NextResponse, NextRequest } from 'next/server'
import connectDB from '@/lib/db'
import Transaction from '@/lib/models/transaction'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  await connectDB()

  // Authenticate
  const cookie = req.cookies.get('authToken')?.value
  if (!cookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload
  try {
    payload = verifyToken(cookie)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  const { amount, currency, toAddress } = await req.json()
  if (amount == null || !currency || !toAddress) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  // Create record
  const tx = await Transaction.create({
    user: payload.id,
    address: toAddress,
    amount,
    currency,
    status: 'pending',
    initiatedAt: new Date()
  })

  return NextResponse.json({ _id: tx._id.toString() }, { status: 201 })
}