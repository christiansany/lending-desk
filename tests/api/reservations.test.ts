import { beforeEach, describe, expect, test } from 'vitest'
import { GET as listReservations, POST as createReservation } from '@/app/api/reservations/route'
import { day, fresh, get, json, post } from './helpers'

const valid = {
  itemId: 'item-002',
  name: 'Rahel Bosshard',
  email: 'rahel.bosshard@example.com',
  from: day(3),
  to: day(6),
  purpose: 'Field recording for the documentary module',
}

describe('GET /api/reservations', () => {
  beforeEach(fresh)

  test('lists the seed reservations', async () => {
    const body = await json(await listReservations(get('/api/reservations')))
    expect(body.total).toBe(3)
  })

  test('filters by itemId', async () => {
    const body = await json(await listReservations(get('/api/reservations?itemId=item-001')))
    expect(body.total).toBe(1)
    expect(body.reservations[0].itemId).toBe('item-001')
  })
})

describe('POST /api/reservations', () => {
  beforeEach(fresh)

  test('a valid reservation is a 201 and shows up in the list', async () => {
    const res = await createReservation(post('/api/reservations', valid))
    expect(res.status).toBe(201)
    const created = await json(res)
    expect(created).toMatchObject({ itemId: 'item-002', from: valid.from, to: valid.to })
    expect(created.id).toMatch(/^res-\d+$/)

    const list = await json(await listReservations(get('/api/reservations?itemId=item-002')))
    expect(list.total).toBe(1)
  })

  test('an overlapping period is a 409 with takenUntil', async () => {
    const res = await createReservation(
      post('/api/reservations', { ...valid, itemId: 'item-001', from: day(2), to: day(3) }),
    )
    expect(res.status).toBe(409)
    expect(res.headers.get('content-type')).toBe('application/problem+json')
    const body = await json(res)
    expect(body).toMatchObject({ status: 409, title: 'Period already taken', takenUntil: day(5) })
    expect(body.requestId).toBe(res.headers.get('x-request-id'))
  })

  test('a period touching the edge of an existing one still conflicts', async () => {
    const res = await createReservation(
      post('/api/reservations', { ...valid, itemId: 'item-001', from: day(5), to: day(7) }),
    )
    expect(res.status).toBe(409)
  })

  test('a period after an existing one is fine', async () => {
    const res = await createReservation(
      post('/api/reservations', { ...valid, itemId: 'item-001', from: day(6), to: day(7) }),
    )
    expect(res.status).toBe(201)
  })

  test('validation errors come back as a field map', async () => {
    const res = await createReservation(
      post('/api/reservations', {
        itemId: 'item-002',
        name: 'R',
        email: 'not-an-address',
        from: day(1),
        to: day(30),
        purpose: 'x',
      }),
    )
    expect(res.status).toBe(422)
    expect(res.headers.get('content-type')).toBe('application/problem+json')
    const body = await json(res)
    expect(body.title).toBe('Validation failed')
    expect(body.errors).toEqual({
      name: 'Please give your full name',
      email: 'This address is not reachable',
      to: 'Maximum 14 days',
      purpose: 'Tell us in one sentence what you need it for',
    })
    expect(body.requestId).toBe(res.headers.get('x-request-id'))
  })

  test.each([
    [{ from: day(-1) }, 'from', 'The start date is in the past'],
    [{ from: '02.09.2026' }, 'from', 'Please pick a start date'],
    [{ to: 'tomorrow' }, 'to', 'Please pick an end date'],
    [{ from: day(6), to: day(3) }, 'to', 'The end date is before the start date'],
    [{ itemId: 'item-999' }, 'itemId', 'Unknown item'],
  ])('%o is a 422 on %s', async (patch, field, message) => {
    const res = await createReservation(post('/api/reservations', { ...valid, ...patch }))
    expect(res.status).toBe(422)
    expect((await json(res)).errors[field]).toBe(message)
  })

  test('exactly 14 days is allowed, 15 is not', async () => {
    const ok = await createReservation(
      post('/api/reservations', { ...valid, itemId: 'item-003', from: day(1), to: day(14) }),
    )
    expect(ok.status).toBe(201)

    const tooLong = await createReservation(
      post('/api/reservations', { ...valid, itemId: 'item-004', from: day(1), to: day(15) }),
    )
    expect(tooLong.status).toBe(422)
    expect((await json(tooLong)).errors.to).toBe('Maximum 14 days')
  })

  test('a body that is not JSON is a 400, not a 500', async () => {
    const res = await createReservation(post('/api/reservations', '{ broken'))
    expect(res.status).toBe(400)
    expect((await json(res)).detail).toContain('JSON')
  })

  test('a failed reservation does not end up in the store', async () => {
    await createReservation(post('/api/reservations', { ...valid, email: 'nope' }))
    const list = await json(await listReservations(get('/api/reservations')))
    expect(list.total).toBe(3)
  })
})
