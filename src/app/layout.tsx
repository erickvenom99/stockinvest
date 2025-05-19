import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { UserProvider } from "@/contexts/user/user-context"
import { TransactionProvider } from "@/contexts/transaction/transaction-context"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <TransactionProvider>
            {children}
            <Toaster position="top-right" />
          </TransactionProvider>
        </UserProvider>
      </body>
    </html>
  )
}
