'use client'

import { Button } from './Button'

interface PaginationProps {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, total, limit, onPageChange }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / limit))
  return (
    <nav className="flex items-center gap-3" aria-label="Pagination">
      <Button
        type="button"
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-slate-600" aria-live="polite">
        Page {page} of {pages}
      </span>
      <Button
        type="button"
        variant="secondary"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  )
}
