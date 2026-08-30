import { createItems, createReservations } from './fixtures'
import type { Item, Reservation } from './types'
import type { ChaosSwitch } from './chaos'

export interface Store {
  items: Item[]
  reservations: Reservation[]
  chaos: ChaosSwitch[]
  /** Counts every API request. `flaky` uses it to fail every third one. */
  requestCount: number
  nextId: number
}

function create(): Store {
  return {
    items: createItems(),
    reservations: createReservations(),
    chaos: [],
    requestCount: 0,
    nextId: 100,
  }
}

/**
 * The state lives on `globalThis` so it survives the dev server's module
 * reloads. It is in memory on purpose: no database, no native dependency,
 * nothing to install. It is gone when the server restarts.
 */
const globalStore = globalThis as typeof globalThis & { __lendingDesk?: Store }

export function getStore(): Store {
  globalStore.__lendingDesk ??= create()
  return globalStore.__lendingDesk
}

export function resetStore(): Store {
  globalStore.__lendingDesk = create()
  return globalStore.__lendingDesk
}

export function nextId(prefix: string): string {
  const store = getStore()
  store.nextId += 1
  return `${prefix}-${store.nextId}`
}
