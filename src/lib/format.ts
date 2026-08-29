'use client'

const CATEGORY_LABELS: Record<string, string> = {
  laptops: 'Laptops',
  cameras: 'Cameras',
  audio: 'Audio',
  tools: 'Tools',
  vr: 'VR',
  misc: 'Misc',
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

/** '2026-09-02' -> '2 Sep 2026' */
export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function formatRange(from: string, to: string): string {
  return `${formatDate(from)} – ${formatDate(to)}`
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(amount)
}

/** Today as YYYY-MM-DD, for date input min values. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
