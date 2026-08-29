'use client'

import './globals.css'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChaosPanel } from './ChaosPanel'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <title>Lending Desk</title>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-base font-semibold">
              Lending Desk
            </Link>
            <span className="text-xs text-slate-500">Internal equipment lending</span>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        <ChaosPanel />
      </body>
    </html>
  )
}
