'use client'

import type { ReactNode } from 'react'
import styles from './Badge.module.css'

type Tone = 'neutral' | 'success' | 'warning' | 'danger'

const TONES: Record<Tone, string> = {
  neutral: styles.neutral,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`${styles.badge} ${TONES[tone]}`}>{children}</span>
}
