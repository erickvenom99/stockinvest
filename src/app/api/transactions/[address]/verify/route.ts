// app/api/transactions/[address]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Transaction from '@/lib/models/transaction'
import connectDB from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { findIncomingTransactionToAddress } from '@/lib/blockchain'

// Declare valid currencies
const allowedCurrencies = ['BTC', 'USDT'] as const
type Currency = typeof allowedCurrencies[number]

export async function GET(req: NextRequest, { params }: { params: { address: string } }) {
  await connectDB()

  // 1. Authenticate and extract user ID
  const cookie = req.cookies.get('authToken')?.value
  if (!cookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload
  try {
    payload = verifyToken(cookie)
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse and validate query params
  const url = new URL(req.url)
  const minAmount = Number(url.searchParams.get('minAmount'))
  const currencyParam = url.searchParams.get('currency')
  const verificationStart = Number(url.searchParams.get('verificationStart')) || Date.now()

  if (
    !params.address ||
    !currencyParam ||
    !allowedCurrencies.includes(currencyParam as Currency) ||
    Number.isNaN(minAmount)
  ) {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 })
  }

  const currency = currencyParam as Currency

  // 3. Query transaction for this user
  let transaction = await Transaction.findOne({
    _id: params.address,
    user: payload.id,
    currency,
    amount: { $gte: minAmount },
    initiatedAt: { $gte: new Date(verificationStart) },
  })

  // 4. If no txHash, try to detect one on-chain
  if (!transaction?.txHash) {
    const foundTx = await findIncomingTransactionToAddress(params.address, minAmount, currency)

    if (foundTx) {
      if (!transaction) {
        transaction = new Transaction({
          _id: params.address,
          user: payload.id,
          currency,
        })
      }

      if (!foundTx?.txHash || foundTx.txHash.trim() === '') {
        return NextResponse.json({ status: 'pending' })
      }

      transaction.txHash = foundTx.txHash
      transaction.amount = foundTx.amount
      transaction.status = 'pending'
      transaction.initiatedAt = new Date(foundTx.timestamp)
      await transaction.save()
    }
  }

  // 5. If still no txHash, wait for payment
  if (!transaction?.txHash) {
    return NextResponse.json({ status: 'pending' })
  }

  // 6. Check blockchain confirmation
  const isConfirmed = await checkBlockchainConfirmation(transaction.txHash, currency)

  if (isConfirmed) {
    const existingTx = await Transaction.findOne({
      txHash: transaction.txHash,
      _id: { $ne: transaction._id }
    })

    if (existingTx) {
      return NextResponse.json({ error: 'Duplicate transaction hash detected' }, { status: 409 })
    }

    transaction.status = 'confirmed'
    transaction.confirmedAt = new Date()
    await transaction.save()
  }

  // 7. Return result
  return NextResponse.json({
    status: transaction.status,
    txHash: transaction.txHash
  })
}

export async function checkBlockchainConfirmation(txHash: string, currency: 'BTC' | 'USDT'): Promise<boolean> {
  try {
    if (currency === 'BTC') {
      const res = await fetch(`https://blockstream.info/api/tx/${txHash}/status`)
      if (!res.ok) {
        const text = await res.text();
        console.error('Blockstream API error:', text);
        return false;
      }
      let data
      try {
        data = await res.json()
      } catch(err) {console.error('Failed to parse JSON: ', err); return false};
      return data.confirmed === true
    } else if (currency === 'USDT') {
      const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
      const url = `https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${ETHERSCAN_API_KEY}`
      const res = await fetch(url)
      const data = await res.json()
      return data.status === '1' && data.result.status === '1'
    } else {
      throw new Error('Unsupported currency')
    }
  } catch (error) {
    console.error('Blockchain confirmation error:', error)
    return false
  }
}
