"use client";

import type { ReactNode } from "react";
import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  title?: string;
  children: ReactNode;
  requestId?: string;
}

export function ErrorState({ title = "Something went wrong", children, requestId }: ErrorStateProps) {
  return (
    <div className={styles.error}>
      <strong>{title}</strong>
      <div className={styles.message}>{children}</div>
      {requestId && <p className={styles.reference}>Support reference: {requestId}</p>}
    </div>
  );
}
