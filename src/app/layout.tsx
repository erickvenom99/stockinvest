import type { Metadata } from 'next'
import { RecaptchaProvider } from '@/components/recaptcha-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stock Invest',
  description: 'Created with v0',
  generator: 'v0.dev',
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
