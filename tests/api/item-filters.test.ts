import { beforeEach, describe, expect, test } from 'vitest'
import { GET as listItems, POST as addItem } from '@/app/api/items/route'
import { GET as getMe } from '@/app/api/me/route'
import { CURRENT_USER } from '@/server/fixtures'
import { fresh, get, json, post } from './helpers'

const validItem = {
  name: 'Nintendo Switch 2',
  category: 'misc',
  description: 'Docked and handheld, two joycon pairs.',
  location: 'Shelf B2',
  condition: 'good',
  dailyRate: 8,
}

describe('fuzzy search', () => {
  beforeEach(fresh)

  test('finds an item from the letters of its name, in order', async () => {
    const body = await json(await listItems(get('/api/items?q=mcbk')))
    expect(body.items[0].name).toContain('MacBook')
  })

  test('an exact name match beats a loose one', async () => {
    const body = await json(await listItems(get('/api/items?q=quest')))
    expect(body.items[0].name).toContain('Quest')
  })

  test('letters that do not appear in order are no hit', async () => {
    const body = await json(await listItems(get('/api/items?q=zzzzz')))
    expect(body).toMatchObject({ items: [], total: 0 })
  })
})

describe('status filter', () => {
  beforeEach(fresh)

  test('every item carries its reservation state', async () => {
    const body = await json(await listItems(get('/api/items?q=MacBook Pro 14')))
    expect(body.items[0]).toMatchObject({ id: 'item-001', reserved: true })
    expect(body.items[0].takenUntil).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  test('free and reserved together are all items', async () => {
    const free = await json(await listItems(get('/api/items?status=free')))
    const reserved = await json(await listItems(get('/api/items?status=reserved')))
    expect(free.total + reserved.total).toBe(47)
    expect(reserved.total).toBe(3)
  })

  test('status=free hides the reserved ones', async () => {
    const body = await json(await listItems(get('/api/items?status=free&limit=50')))
    expect(body.items.every((i: { reserved: boolean }) => i.reserved === false)).toBe(true)
  })
})

describe('owner filter', () => {
  beforeEach(fresh)

  test('GET /api/me says who the current user is', async () => {
    expect(await json(await getMe(get('/api/me')))).toEqual(CURRENT_USER)
  })

  test('mine and others together are all items', async () => {
    const mine = await json(await listItems(get('/api/items?owner=me')))
    const others = await json(await listItems(get('/api/items?owner=others')))
    expect(mine.total + others.total).toBe(47)
    expect(mine.total).toBeGreaterThan(0)
  })

  test('owner=me only returns items marked mine', async () => {
    const body = await json(await listItems(get('/api/items?owner=me&limit=50')))
    expect(body.items.every((i: { mine: boolean }) => i.mine === true)).toBe(true)
    expect(body.items.every((i: { ownerEmail: string }) => i.ownerEmail === CURRENT_USER.email)).toBe(true)
  })

  test.each([
    ['status=sometimes', 'status'],
    ['owner=nobody', 'owner'],
  ])('%s is a 400', async (query, mentioned) => {
    const res = await listItems(get(`/api/items?${query}`))
    expect(res.status).toBe(400)
    expect((await json(res)).detail).toContain(mentioned)
  })
})

describe('POST /api/items', () => {
  beforeEach(fresh)

  test('adds an item and hands it back, owned by the current user', async () => {
    const res = await addItem(post('/api/items', validItem))
    expect(res.status).toBe(201)
    const body = await json(res)
    expect(body).toMatchObject({
      name: 'Nintendo Switch 2',
      ownerEmail: CURRENT_USER.email,
      mine: true,
      reserved: false,
      takenUntil: null,
    })
    expect(body.id).toMatch(/^item-\d+$/)
  })

  test('the new item shows up in the list and under owner=me', async () => {
    await addItem(post('/api/items', validItem))
    expect((await json(await listItems(get('/api/items')))).total).toBe(48)
    const mine = await json(await listItems(get('/api/items?q=Nintendo&owner=me')))
    expect(mine.total).toBe(1)
  })

  test.each([
    [{ name: 'X' }, 'name'],
    [{ category: 'spaceships' }, 'category'],
    [{ description: 'short' }, 'description'],
    [{ location: '' }, 'location'],
    [{ condition: 'mint' }, 'condition'],
    [{ dailyRate: -5 }, 'dailyRate'],
    [{ dailyRate: '8' }, 'dailyRate'],
  ])('%o is a 422 with the field named', async (patch, field) => {
    const res = await addItem(post('/api/items', { ...validItem, ...patch }))
    expect(res.status).toBe(422)
    expect(res.headers.get('content-type')).toBe('application/problem+json')
    const body = await json(res)
    expect(body.status).toBe(422)
    expect(Object.keys(body.errors)).toContain(field)
    expect(body.requestId).toBe(res.headers.get('x-request-id'))
  })

  test('a body that is not JSON is a 400', async () => {
    const res = await addItem(post('/api/items', 'not json at all'))
    expect(res.status).toBe(400)
  })
})
