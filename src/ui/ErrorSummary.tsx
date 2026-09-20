"use client";

import { useEffect, useRef } from "react";
import styles from "./ErrorSummary.module.css";

interface ErrorSummaryProps {
  errors: Record<string, string>;
  fieldIds?: Record<string, string>;
  focusOnRender?: boolean;
}

export function ErrorSummary({ errors, fieldIds, focusOnRender = false }: ErrorSummaryProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const entries = Object.entries(errors);

  useEffect(() => {
    if (focusOnRender && entries.length > 0) summaryRef.current?.focus();
  }, [focusOnRender, entries.length]);

  if (entries.length === 0) return null;

  return (
    <div ref={summaryRef} className={styles.summary} tabIndex={-1} role="alert">
      <strong>There is a problem</strong>
      <ul>
        {entries.map(([field, message]) => (
          <li key={field}>
            {fieldIds?.[field] ? <a href={`#${fieldIds[field]}`}>{message}</a> : message}
          </li>
        ))}
      </ul>
    </div>
  );
}
