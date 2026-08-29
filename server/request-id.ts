/** Every response carries an x-request-id — errors included. */
export function newRequestId(): string {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 16)}`
}

export interface RequestLogEntry {
  requestId: string
  method: string
  path: string
  status: number
  durationMs: number
}

const DIM = '\x1b[2m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREEN = '\x1b[32m'
const RESET = '\x1b[0m'

function statusColour(status: number): string {
  if (status >= 500) return RED
  if (status >= 400) return YELLOW
  return GREEN
}

export function logRequest(entry: RequestLogEntry): void {
  if (process.env.LENDING_DESK_QUIET === '1') return
  const { requestId, method, path, status, durationMs } = entry
  console.log(
    `${statusColour(status)}${status}${RESET} ${method.padEnd(6)} ${path} ` +
      `${DIM}${durationMs}ms  request-id=${requestId}${RESET}`,
  )
}
