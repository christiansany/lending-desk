import { beforeEach, describe, expect, test } from 'vitest'
import { GET as listItems } from '@/app/api/items/route'
import { GET as getItem } from '@/app/api/items/[id]/route'
import { POST as createReservation } from '@/app/api/reservations/route'
import { newRequestId } from '@/server/request-id'
import { fresh, get, json, params, post } from './helpers'

describe('the request pipeline', () => {
  beforeEach(fresh)

  test('request ids are unique', () => {
    const ids = new Set(Array.from({ length: 500 }, newRequestId))
    expect(ids.size).toBe(500)
  })

  test('success, client error and server-side rejection all carry a request id', async () => {
    const responses = [
      await listItems(get('/api/items')),
      await listItems(get('/api/items?page=abc')),
      await getItem(get('/api/items/nope'), params('nope')),
      await createReservation(post('/api/reservations', { itemId: 'item-001' })),
    ]
    for (const res of responses) {
      expect(res.headers.get('x-request-id')).toBeTruthy()
      expect(res.headers.get('cache-control')).toBe('no-store')
    }
  })

  test('the request id in the body matches the header on every error', async () => {
    const res = await listItems(get('/api/items?limit=999'))
    expect((await json(res)).requestId).toBe(res.headers.get('x-request-id'))
  })

  test('errors use application/problem+json, successes plain json', async () => {
    expect((await listItems(get('/api/items'))).headers.get('content-type')).toBe('application/json')
    expect((await listItems(get('/api/items?page=0'))).headers.get('content-type')).toBe(
      'application/problem+json',
    )
  })
})
