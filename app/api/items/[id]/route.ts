import { handleRequest, fail } from '@/server/http'
import { findItem, withStatus } from '@/server/items'
import { notFound } from '@/server/problem'

export const dynamic = 'force-dynamic'

export function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handleRequest('item', request, async () => {
    const { id } = await context.params
    const item = findItem(id)
    if (!item) fail(notFound(`No item with id '${id}'`))
    return { body: withStatus(item) }
  })
}
