import { handleRequest } from '@/server/http'
import { matchItems, paginate, parseItemQuery } from '@/server/items'
import { searchLatencyMs, sleep } from '@/server/latency'

export const dynamic = 'force-dynamic'

export function GET(request: Request): Promise<Response> {
  return handleRequest('items', request, async () => {
    const query = parseItemQuery(new URL(request.url))
    const matches = matchItems(query)
    // The more hits, the slower — see server/latency.ts.
    await sleep(searchLatencyMs(matches.length))
    return { body: paginate(matches, query) }
  })
}
