import { beforeEach, describe, expect, test } from 'vitest'
import { createItems, createReservations, CATEGORIES, ITEM_COUNT } from '@/server/fixtures'
import { getStore, resetStore } from '@/server/store'

describe('fixtures', () => {
  beforeEach(() => resetStore())

  test('the seed has exactly 47 items — four pages at the default limit of 12', () => {
    expect(ITEM_COUNT).toBe(47)
    expect(createItems()).toHaveLength(47)
  })

  test('item ids and serials are unique', () => {
    const items = createItems()
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length)
    expect(new Set(items.map((i) => i.serial)).size).toBe(items.length)
  })

  test('every item has a known category', () => {
    const known = CATEGORIES.map((c) => c.value)
    for (const item of createItems()) expect(known).toContain(item.category)
  })

  test('every seed reservation points at an existing item', () => {
    const ids = new Set(createItems().map((i) => i.id))
    for (const reservation of createReservations()) expect(ids.has(reservation.itemId)).toBe(true)
  })

  test('resetStore brings the data back', () => {
    getStore().items = []
    getStore().reservations = []
    const store = resetStore()
    expect(store.items).toHaveLength(47)
    expect(store.reservations).toHaveLength(3)
  })
})
