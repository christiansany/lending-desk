import { resetStore, getStore } from '@/server/store'
import type { ChaosSwitch } from '@/server/chaos'

export const BASE = 'http://localhost:3000'

export function get(path: string): Request {
  return new Request(`${BASE}${path}`)
}

export function post(path: string, body: unknown): Request {
  return new Request(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

export function params(id: string) {
  return { params: Promise.resolve({ id }) }
}

export async function json<T = any>(response: Response): Promise<T> {
  return (await response.json()) as T
}

export function fresh(): void {
  resetStore()
}

export function setChaos(...switches: ChaosSwitch[]): void {
  getStore().chaos = switches
}

/** YYYY-MM-DD, `offset` days from today. */
export function day(offset: number): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() + offset)
  return d.toISOString().slice(0, 10)
}
