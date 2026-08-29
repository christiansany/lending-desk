'use client'

import type { InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function Field({ label, error, hint, className = '', ...rest }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="field" className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        className={`rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 ${className}`}
        {...rest}
      />
      {hint && <small className="text-xs text-slate-500">{hint}</small>}
      {error && <small className="text-xs text-red-600">{error}</small>}
    </div>
  )
}
