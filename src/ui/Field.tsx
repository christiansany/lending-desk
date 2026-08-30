'use client'

import type { InputHTMLAttributes } from 'react'
import styles from './Field.module.css'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function Field({ label, error, hint, className = '', ...rest }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor="field" className={styles.label}>
        {label}
      </label>
      <input className={`${styles.input} ${className}`} {...rest} />
      {hint && <small className={styles.hint}>{hint}</small>}
      {error && <small className={styles.error}>{error}</small>}
    </div>
  )
}
