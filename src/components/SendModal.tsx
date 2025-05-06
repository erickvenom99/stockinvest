// components/SendModal.tsx
'use client'
import { useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react"
import { QRCodeSVG } from 'qrcode.react'
import Image from "next/image"
import * as Select from '@radix-ui/react-select'
import { Plan, PLANS } from '@/types/plan'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/user/user-context'

interface SendModalProps {
  currency: 'BTC' | 'USDT'
  selectedPlan: Plan | null
  verificationStatus: 'idle' | 'pending' | 'verified' | 'failed'
  isCopied: boolean
  setCurrency: (currency: 'BTC' | 'USDT') => void
  setSelectedPlan: (plan: Plan | null) => void
  setVerificationStatus: (status: 'idle' | 'pending' | 'verified' | 'failed') => void
  setVerificationStarted: (started: boolean) => void
  setIsCopied: (copied: boolean) => void
}



// Wallet configuration with fallback addresses
const walletConfig = {
  BTC: {
    address: process.env.NEXT_PUBLIC_BTC_ADDRESS || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    network: 'Bitcoin Network',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
  },
  USDT: {
    address: process.env.NEXT_PUBLIC_USDT_ADDRESS || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    network: 'ERC20 Network',
    image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png'
  }
}

export default function SendModal({
  currency,
  selectedPlan,
  verificationStatus,
  isCopied,
  setCurrency,
  setSelectedPlan,
  setVerificationStatus,
  setVerificationStarted,
  setIsCopied
}: SendModalProps) {
  const { user, loading } = useUser();
  const router = useRouter()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const createTransactionRecord = async () => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          amount: selectedPlan!.minAmount,
          currency,
          toAddress: walletConfig[currency].address
        })
      })

      if (!response.ok) throw new Error('Failed to create transaction')
        return await response.json()
      } catch (error) {
        console.error('Transaction creation failed:', error)
        setVerificationStatus('failed')
      }
    }
  
   const startVerification = () => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }
    if (!selectedPlan) return

    setVerificationStarted(true)
    setVerificationStatus('pending')

    // Spin up the 30-minute timeout
    timerRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
        setVerificationStatus('failed')
    }, 30 * 60 * 1000) // 30 minutes

    // Kick off the async flow
    ;(async () => {
      let address: string
      try {
        // a) create the DB record
        const { _id } = await createTransactionRecord()
        address = _id

        // b) begin polling every 15s
        intervalRef.current = setInterval(async () => {
          const r = await fetch(
            `/api/transactions/${address}/verify` +
            `?currency=${currency}` +
            `&minAmount=${selectedPlan.minAmount}`
          )
          const { status } = await r.json()
          if (status === 'confirmed') {
            if (timerRef.current) clearTimeout(timerRef.current)
            if (intervalRef.current) clearInterval(intervalRef.current)
            setVerificationStatus('verified')
            
            // reset after a pause
            setTimeout(() => {
              setSelectedPlan(null)
              setVerificationStatus('idle')
              setVerificationStarted(false)
            }, 5000)
          }
        }, 15000)
      } catch (err) {
        clearTimeout(timerRef.current!)
        console.error(err)
        setVerificationStatus('failed')
      }
    })()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletConfig[currency].address)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }


  return (
    <div className="space-y-6">
      {/* Plan Selection Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-muted-foreground">
          Select Investment Tier
        </label>
        
        <Select.Root 
          value={selectedPlan?.name || ''} 
          onValueChange={(value) => {
            const plan = PLANS.find(p => p.name === value)
            setSelectedPlan(plan || null)
          }}
        >
          <Select.Trigger className="w-full flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
            <Select.Value placeholder="Choose investment tier">
              {selectedPlan ? (
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${selectedPlan.color.replace('border', 'bg')}`} />
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
              ) : "Choose investment tier"}
            </Select.Value>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Select.Trigger>

          <Select.Content 
            position="popper"
            className="w-[var(--radix-select-trigger-width)] rounded-lg border bg-background shadow-lg overflow-hidden"
          >
            <Select.Viewport className="p-2 max-h-60 overflow-auto">
              {PLANS.map((plan) => (
                <Select.Item 
                  key={plan.name}
                  value={plan.name}
                  className={`p-3 rounded-md cursor-pointer transition-all ${plan.color} data-[state=checked]:bg-opacity-50 data-[highlighted]:scale-[0.98]`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${plan.color.replace('border', 'bg')}`} />
                      <span className="font-medium">{plan.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{plan.range}</div>
                    <div className="text-sm text-green-600">{plan.bonus}</div>
                    <div className="text-xs text-muted-foreground">Duration: {plan.duration}</div>
                  </div>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Root>
      </div>

      {/* Currency Selection Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-muted-foreground">
          Select Settlement Currency
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={currency === 'BTC' ? 'default' : 'secondary'}
            onClick={() => setCurrency('BTC')}
            className="h-12 flex items-center justify-center gap-2"
          >
            <Image
              src={walletConfig.BTC.image}
              alt="Bitcoin"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span>BTC</span>
          </Button>
          <Button
            variant={currency === 'USDT' ? 'default' : 'secondary'}
            onClick={() => setCurrency('USDT')}
            className="h-12 flex items-center justify-center gap-2"
          >
            <Image
              src={walletConfig.USDT.image}
              alt="Tether"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span>USDT</span>
          </Button>
        </div>
      </div>

      {/* Conditional Content Display */}
        <AnimatePresence initial={false}>
        {selectedPlan && currency && (
          <motion.div
            key={`${currency}-${selectedPlan.name}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.1 }}
            className="space-y-6 overflow-hidden"
          >
          {/* Payment Instructions */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Send exactly ${selectedPlan.minAmount.toLocaleString()} {currency} to the {walletConfig[currency].network} address below
                </p>
                <p className="text-xs text-muted-foreground">
                  Payments to incorrect addresses will not be credited. Ensure you&apos;re sending 
                  through the {walletConfig[currency].network}.
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="space-y-4 flex-grow overflow-y-auto">
            <div className="p-4 bg-muted rounded-lg text-center">
              <QRCodeSVG 
                value={walletConfig[currency].address}
                size={200}
                className="mx-auto"
              />
            </div>

            {/* Address Field with Copy Functionality */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={walletConfig[currency].address}
                readOnly
                className="flex-1 p-2 bg-background rounded-lg border font-mono text-sm"
              />
              <Button
                onClick={handleCopyAddress}
                variant="outline"
                size="sm"
                disabled={isCopied}
              >
                {isCopied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Verification Controls */}
          <div className="space-y-4 sticky bottom-0 bg-background pt-4 border-t">
            <Button
              onClick={startVerification}
              className="w-full"
              disabled={!selectedPlan || verificationStatus !== 'idle'}
            >
              {selectedPlan ? (
                `Verify ${selectedPlan.name} Payment`
              ) : (
                "Select a Plan to Continue"
              )}
            </Button>

            {/* Verification Status Indicators */}
            {verificationStatus !== 'idle' && (
              <div className="text-center space-y-2">
                {verificationStatus === 'pending' && (
                  <div className="flex items-center justify-center gap-2 text-blue-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <span>Verifying transaction...</span>
                  </div>
                )}
                {verificationStatus === 'verified' && (
                  <div className="flex items-center justify-center gap-2 text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Payment verified!</span>
                    <Button 
                      size="sm" 
                      onClick={() => setVerificationStatus('idle')}
                      className="mt-2"
                    >
                      New Transaction
                    </Button>
                  </div>
                )}
                {verificationStatus === 'failed' && (
                  <div className="flex items-center justify-center gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <span>Verification failed. Please try again.</span>
                  </div>
                )}
              </div>
            )}
          </div>
          </motion.div>
        )}
        </AnimatePresence>
    </div>
  )
}