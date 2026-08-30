import { handleRequest } from '@/server/http'
import { CURRENT_USER } from '@/server/fixtures'

export const dynamic = 'force-dynamic'

/** There is no login. This is who "me" is, for the owner filter and the forms. */
export function GET(request: Request): Promise<Response> {
  return handleRequest('me', request, () => ({ body: CURRENT_USER }))
}
