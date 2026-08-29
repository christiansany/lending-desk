import { beforeEach, describe, expect, test } from 'vitest'
import { GET as availability } from '@/app/api/items/[id]/availability/route'
import { day, fresh, get, json, params } from './helpers'

function ask(id: string, from: string, to: string) {
  return availability(get(`/api/items/${id}/availability?from=${from}&to=${to}`), params(id))
}

describe('GET /api/items/:id/availability', () => {
  beforeEach(fresh)

  test('a free period', async () => {
    const res = await ask('item-002', day(1), day(3))
    expect(res.status).toBe(200)
    expect(await json(res)).toEqual({ free: true, takenUntil: null })
  })

  test('a taken period reports until when', async () => {
    const res = await ask('item-001', day(2), day(3))
    expect(await json(res)).toEqual({ free: false, takenUntil: day(5) })
  })

  test('a period after the reservation is free again', async () => {
    expect(await json(await ask('item-001', day(6), day(8)))).toEqual({
      free: true,
      takenUntil: null,
    })
  })

  test.each([
    ['?from=2026-09-01', 'to'],
    ['?to=2026-09-05', 'from'],
    ['?from=01.09.2026&to=2026-09-05', 'from'],
    ['', 'from'],
  ])('missing or malformed dates are a 400 (%s)', async (query, mentioned) => {
    const res = await availability(get(`/api/items/item-001/availability${query}`), params('item-001'))
    expect(res.status).toBe(400)
    expect((await json(res)).detail).toContain(mentioned)
  })

  test('to before from is a 400', async () => {
    const res = await ask('item-001', day(5), day(2))
    expect(res.status).toBe(400)
  })

  test('an unknown item is a 404', async () => {
    const res = await ask('item-999', day(1), day(2))
    expect(res.status).toBe(404)
  })
})
