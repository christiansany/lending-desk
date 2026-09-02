"use client";

import type { ReactNode } from "react";
import styles from "./Status.module.css";

export function Status({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`${styles.status} ${className}`} aria-live="polite">
      {children}
    </span>
  );
}
