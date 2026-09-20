"use client";

import type { HTMLAttributes } from "react";
import styles from "./Card.module.css";

export function Card({ children, className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${styles.card} ${className}`} {...rest}>
      {children}
    </div>
  );
}
