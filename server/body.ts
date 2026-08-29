import { fail } from './http'
import { badRequest } from './problem'

/** A body that is not JSON is a 400, not a 500. */
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  let parsed: unknown
  try {
    parsed = await request.json()
  } catch {
    fail(badRequest('Request body is not valid JSON'))
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    fail(badRequest('Request body must be a JSON object'))
  }
  return parsed as Record<string, unknown>
}
