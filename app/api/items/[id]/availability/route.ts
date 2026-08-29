import { handleRequest, fail } from '@/server/http'
import { findItem } from '@/server/items'
import { isIsoDate } from '@/server/dates'
import { badRequest, notFound } from '@/server/problem'
import { checkAvailability } from '@/server/reservations'

export const dynamic = 'force-dynamic'

export function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handleRequest('availability', request, async () => {
    const { id } = await context.params
    if (!findItem(id)) fail(notFound(`No item with id '${id}'`))

    const url = new URL(request.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    if (!isIsoDate(from)) fail(badRequest("'from' must be a date in the form YYYY-MM-DD"))
    if (!isIsoDate(to)) fail(badRequest("'to' must be a date in the form YYYY-MM-DD"))
    if (to < from) fail(badRequest("'to' is before 'from'"))

    return { body: checkAvailability(id, from, to) }
  })
}
