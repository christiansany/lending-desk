import { readJson } from '@/server/body'
import { fail, handleRequest } from '@/server/http'
import { CHAOS_LABELS, CHAOS_SWITCHES, parseSwitches } from '@/server/chaos'
import { badRequest } from '@/server/problem'
import { getStore, resetStore } from '@/server/store'

export const dynamic = 'force-dynamic'

/**
 * The chaos switches live on the server, not in a cookie — so the Chaos Panel
 * and the test suite drive the exact same state.
 */
export function GET(request: Request): Promise<Response> {
  return handleRequest('chaos', request, () => ({
    body: {
      switches: getStore().chaos,
      available: CHAOS_SWITCHES.map((value) => ({ value, label: CHAOS_LABELS[value] })),
    },
  }))
}

export function POST(request: Request): Promise<Response> {
  return handleRequest('chaos', request, async () => {
    const body = await readJson(request)

    if (body.reset === true || body.reset === 'data') {
      const switches = getStore().chaos
      const store = resetStore()
      store.chaos = switches
      return { body: { switches: store.chaos, reset: true } }
    }

    if (!Array.isArray(body.switches)) {
      fail(badRequest("'switches' must be an array, or send { reset: true }"))
    }
    const unknown = body.switches.filter(
      (s: unknown) => typeof s !== 'string' || !(CHAOS_SWITCHES as readonly string[]).includes(s),
    )
    if (unknown.length > 0) fail(badRequest(`unknown switch(es): ${unknown.join(', ')}`))

    const store = getStore()
    store.chaos = parseSwitches(body.switches)
    return { body: { switches: store.chaos, reset: false } }
  })
}
