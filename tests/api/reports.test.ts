import { beforeEach, describe, expect, test } from 'vitest'
import { GET as listReports, POST as createReport } from '@/app/api/reports/route'
import { fresh, get, json, post } from './helpers'

const valid = {
  itemId: 'item-001',
  reporter: 'Timo Widmer',
  email: 'timo.widmer@example.com',
  severity: 'limited',
  description: 'The left hinge is loose, the display wobbles.',
}

describe('/api/reports', () => {
  beforeEach(fresh)

  test('starts empty', async () => {
    expect(await json(await listReports(get('/api/reports')))).toEqual({ reports: [], total: 0 })
  })

  test('a valid report is a 201 and shows up under its item', async () => {
    const res = await createReport(post('/api/reports', valid))
    expect(res.status).toBe(201)
    expect((await json(res)).id).toMatch(/^rep-\d+$/)

    const mine = await json(await listReports(get('/api/reports?itemId=item-001')))
    expect(mine.total).toBe(1)
    const other = await json(await listReports(get('/api/reports?itemId=item-002')))
    expect(other.total).toBe(0)
  })

  test('validation errors come back as a field map', async () => {
    const res = await createReport(
      post('/api/reports', { itemId: 'item-001', reporter: 'T', email: 'x', severity: 'broken', description: 'nope' }),
    )
    expect(res.status).toBe(422)
    expect(await json(res).then((b) => b.errors)).toEqual({
      reporter: 'Please give your full name',
      email: 'This address is not reachable',
      severity: 'Please pick a severity',
      description: 'Please describe the damage in at least 10 characters',
    })
  })

  test('an unknown item is a 422 on the itemId field', async () => {
    const res = await createReport(post('/api/reports', { ...valid, itemId: 'item-999' }))
    expect(res.status).toBe(422)
    expect((await json(res)).errors.itemId).toBe('Unknown item')
  })

  test('every severity is accepted', async () => {
    for (const severity of ['cosmetic', 'limited', 'unusable']) {
      const res = await createReport(post('/api/reports', { ...valid, severity }))
      expect(res.status).toBe(201)
    }
  })
})
