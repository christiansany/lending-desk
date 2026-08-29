import { badRequest } from './problem'
import { fail } from './http'
import { getStore } from './store'
import { CATEGORIES } from './fixtures'
import type { Item } from './types'

export interface ItemQuery {
  q: string
  category: string | null
  page: number
  limit: number
}

const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as string[]

/** Rejects malformed query parameters with a 400 — not every error has a field. */
export function parseItemQuery(url: URL): ItemQuery {
  const rawPage = url.searchParams.get('page')
  const rawLimit = url.searchParams.get('limit')
  const category = url.searchParams.get('category')

  const page = rawPage === null ? 1 : Number(rawPage)
  const limit = rawLimit === null ? 12 : Number(rawLimit)

  if (!Number.isInteger(page) || page < 1) fail(badRequest(`'page' must be a positive integer, got '${rawPage}'`))
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    fail(badRequest(`'limit' must be an integer between 1 and 50, got '${rawLimit}'`))
  }
  if (category !== null && category !== '' && !CATEGORY_VALUES.includes(category)) {
    fail(badRequest(`unknown category '${category}'`))
  }

  return { q: (url.searchParams.get('q') ?? '').trim(), category: category || null, page, limit }
}

export function matchItems(query: ItemQuery): Item[] {
  const needle = query.q.toLowerCase()
  return getStore().items.filter((item) => {
    if (query.category && item.category !== query.category) return false
    if (!needle) return true
    return (
      item.name.toLowerCase().includes(needle) ||
      item.description.toLowerCase().includes(needle) ||
      item.serial.toLowerCase().includes(needle)
    )
  })
}

export interface ItemPage {
  items: Item[]
  total: number
  page: number
  limit: number
}

export function paginate(matches: Item[], query: ItemQuery): ItemPage {
  const start = (query.page - 1) * query.limit
  return {
    items: matches.slice(start, start + query.limit),
    total: matches.length,
    page: query.page,
    limit: query.limit,
  }
}

export function findItem(id: string): Item | undefined {
  return getStore().items.find((item) => item.id === id)
}
