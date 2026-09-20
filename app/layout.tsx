import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ChaosPanel } from "./ChaosPanel";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: {
    default: "Lending Desk",
    template: "%s · Lending Desk",
  },
  description: "Borrow and share equipment with colleagues.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={styles.body}>
        <a className={styles.skipLink} href="#main-content">
          Skip to main content
        </a>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.brand}>
              <span className={styles.brandMark} aria-hidden="true">
                LD
              </span>
              <span>
                <strong>Lending Desk</strong>
                <small>Equipment shared by colleagues</small>
              </span>
            </Link>
            <nav aria-label="Primary navigation">
              <Link href="/" className={styles.navLink}>
                Equipment
              </Link>
            </nav>
          </div>
        </header>
        <main id="main-content" className={styles.main}>
          {children}
        </main>
        <ChaosPanel />
      </body>
    </html>
  );
}
