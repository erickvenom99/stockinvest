import type { Metadata } from 'next'
import { RecaptchaProvider } from '@/components/recaptcha-provider'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Stock Invest',
  description: 'Invest in crypto assets',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <RecaptchaProvider>
        {children}
        </RecaptchaProvider>
      </body>
    </html>
  )
}
