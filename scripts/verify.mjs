#!/usr/bin/env node
/**
 * Setup check. Runs in well under a minute and prints one line you can paste
 * into the class chat.
 *
 *   npm run verify
 */
import { spawn } from 'node:child_process'
import { createConnection, createServer } from 'node:net'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PROBE_PORT = 3123
const MIN_NODE_MAJOR = 22

const results = []
let failed = false

function record(ok, label, detail = '') {
  results.push({ ok, label, detail })
  if (ok === false) failed = true
}

function line({ ok, label, detail }) {
  const icon = ok === true ? '✅' : ok === false ? '❌' : '⚠️ '
  return `${icon} ${label}${detail ? `   ${detail}` : ''}`
}

function portFree(port) {
  return new Promise((resolve) => {
    const server = createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => server.close(() => resolve(true)))
    server.listen(port, '127.0.0.1')
  })
}

function waitForPort(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  return new Promise((resolve) => {
    const attempt = () => {
      const socket = createConnection({ port, host: '127.0.0.1' })
      socket.once('connect', () => {
        socket.destroy()
        resolve(true)
      })
      socket.once('error', () => {
        socket.destroy()
        if (Date.now() > deadline) resolve(false)
        else setTimeout(attempt, 300)
      })
    }
    attempt()
  })
}

// 1 — Node
const major = Number(process.versions.node.split('.')[0])
record(major >= MIN_NODE_MAJOR, `Node ${process.versions.node}`, major >= MIN_NODE_MAJOR ? '' : `(need ${MIN_NODE_MAJOR}+)`)

// 2 — dependencies
const installed = existsSync(join(ROOT, 'node_modules', 'next', 'package.json'))
record(installed, 'npm install', installed ? 'ok' : 'missing — run `npm install`')

// 3 — the seed
try {
  const fixtures = readFileSync(join(ROOT, 'server', 'fixtures.ts'), 'utf8')
  const count = (fixtures.match(/^ {2}\['/gm) ?? []).length
  record(count === 47, 'seed', `${count} items`)
} catch {
  record(false, 'seed', 'server/fixtures.ts not readable')
}

// 4 — port 3000
const free = await portFree(3000)
record(free ? true : null, 'port 3000', free ? 'free' : 'in use — `npm run dev` will pick another one')

// 5 — the API
let server
if (installed) {
  server = spawn('npx', ['next', 'dev', '--port', String(PROBE_PORT)], {
    cwd: ROOT,
    stdio: 'ignore',
    env: { ...process.env, LENDING_DESK_QUIET: '1' },
  })

  const up = await waitForPort(PROBE_PORT, 60_000)
  if (!up) {
    record(false, 'API', 'the dev server did not start within 60 s')
  } else {
    try {
      const res = await fetch(`http://127.0.0.1:${PROBE_PORT}/api/items`)
      const body = await res.json()
      const requestId = res.headers.get('x-request-id')
      record(
        res.ok && body.total === 47 && Boolean(requestId),
        'API responds',
        `${body.total} items, x-request-id: ${requestId ?? 'missing'}`,
      )

      const chaos = await fetch(`http://127.0.0.1:${PROBE_PORT}/api/dev/chaos`)
      record(chaos.ok, 'chaos endpoint', chaos.ok ? 'reachable' : `status ${chaos.status}`)
    } catch (error) {
      record(false, 'API', error.message)
    }
  }
  server.kill('SIGTERM')
} else {
  record(false, 'API', 'skipped — dependencies missing')
}

// 6 — the test suite
record(
  existsSync(join(ROOT, 'node_modules', '.bin', 'vitest')),
  'npm test',
  'vitest installed',
)

// 7 — Copilot
record(null, 'Copilot', 'cannot be checked from here — open the chat and send "hello"')

console.log('')
for (const result of results) console.log(line(result))
console.log('')
console.log(failed ? '❌ Something is missing — please post this output.' : '✅ Ready. Please post this output.')

process.exit(failed ? 1 : 0)
