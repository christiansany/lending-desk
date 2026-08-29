import { daysBetween, isIsoDate, overlaps, today } from './dates'
import { findItem } from './items'
import { getStore, nextId } from './store'
import type { Reservation } from './types'

export const MAX_DAYS = 14

export interface ReservationInput {
  itemId: unknown
  name: unknown
  email: unknown
  from: unknown
  to: unknown
  purpose: unknown
}

/**
 * Returns a field -> message map. Empty means valid.
 * The messages are the ones the UI is expected to show verbatim.
 */
export function validateReservation(input: ReservationInput): Record<string, string> {
  const errors: Record<string, string> = {}

  if (typeof input.itemId !== 'string' || !findItem(input.itemId)) {
    errors.itemId = 'Unknown item'
  }
  if (typeof input.name !== 'string' || input.name.trim().length < 2) {
    errors.name = 'Please give your full name'
  }
  if (typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email)) {
    errors.email = 'This address is not reachable'
  }
  if (!isIsoDate(input.from)) {
    errors.from = 'Please pick a start date'
  } else if (input.from < today()) {
    errors.from = 'The start date is in the past'
  }
  if (!isIsoDate(input.to)) {
    errors.to = 'Please pick an end date'
  }
  if (isIsoDate(input.from) && isIsoDate(input.to) && !errors.from) {
    const days = daysBetween(input.from, input.to)
    if (days < 0) errors.to = 'The end date is before the start date'
    else if (days + 1 > MAX_DAYS) errors.to = `Maximum ${MAX_DAYS} days`
  }
  if (typeof input.purpose !== 'string' || input.purpose.trim().length < 5) {
    errors.purpose = 'Tell us in one sentence what you need it for'
  }

  return errors
}

/** The reservation that blocks [from, to] for this item, if there is one. */
export function findConflict(itemId: string, from: string, to: string): Reservation | undefined {
  return getStore().reservations.find(
    (r) => r.itemId === itemId && overlaps(from, to, r.from, r.to),
  )
}

export function createReservation(input: {
  itemId: string
  name: string
  email: string
  from: string
  to: string
  purpose: string
}): Reservation {
  const reservation: Reservation = {
    id: nextId('res'),
    itemId: input.itemId,
    name: input.name.trim(),
    email: input.email.trim(),
    from: input.from,
    to: input.to,
    purpose: input.purpose.trim(),
    createdAt: new Date().toISOString(),
  }
  getStore().reservations.push(reservation)
  return reservation
}

export interface Availability {
  free: boolean
  takenUntil: string | null
}

export function checkAvailability(itemId: string, from: string, to: string): Availability {
  const conflict = findConflict(itemId, from, to)
  return conflict ? { free: false, takenUntil: conflict.to } : { free: true, takenUntil: null }
}
