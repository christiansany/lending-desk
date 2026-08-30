'use client'

import './globals.css'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChaosPanel } from './ChaosPanel'
import styles from './layout.module.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={styles.body}>
        <title>Lending Desk</title>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.brand}>
              Lending Desk
            </Link>
            <span className={styles.tagline}>Internal equipment lending</span>
          </div>
        </header>
        <main className={styles.main}>{children}</main>
        <ChaosPanel />
      </body>
    </html>
  )
}
