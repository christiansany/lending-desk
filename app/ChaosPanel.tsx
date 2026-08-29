'use client'

import { useCallback, useEffect, useState } from 'react'

interface ChaosOption {
  value: string
  label: string
}

/**
 * Dev-only control panel for the error injection in the API.
 * The state lives on the server (`/api/dev/chaos`), so the panel and the test
 * suite drive the same switches.
 */
export function ChaosPanel() {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ChaosOption[]>([])
  const [active, setActive] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/dev/chaos', { cache: 'no-store' })
    const json = await res.json()
    setOptions(json.available ?? [])
    setActive(json.switches ?? [])
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (process.env.NODE_ENV === 'production') return null

  async function send(body: unknown) {
    setBusy(true)
    try {
      const res = await fetch('/api/dev/chaos', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      setActive(json.switches ?? [])
    } finally {
      setBusy(false)
    }
  }

  const toggle = (value: string) =>
    send({ switches: active.includes(value) ? active.filter((s) => s !== value) : [...active, value] })

  return (
    <>
      {active.length > 0 && (
        <div
          className="pointer-events-none fixed inset-0 z-40 border-4 border-fuchsia-500"
          aria-hidden="true"
        />
      )}
      <div className="fixed right-4 bottom-4 z-50 w-72 font-sans">
        {open && (
          <div className="mb-2 rounded-lg border border-slate-300 bg-white p-3 shadow-lg">
            <p className="mb-2 text-xs font-semibold text-slate-500 uppercase">Chaos</p>
            <ul className="space-y-1">
              {options.map((option) => (
                <li key={option.value}>
                  <label className="flex items-start gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={active.includes(option.value)}
                      disabled={busy}
                      onChange={() => toggle(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-xs"
                disabled={busy}
                onClick={() => send({ switches: [] })}
              >
                All off
              </button>
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-xs"
                disabled={busy}
                onClick={() => send({ reset: true })}
              >
                Reset data
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          className={`w-full rounded-lg px-3 py-2 text-xs font-semibold text-white shadow-lg ${
            active.length > 0 ? 'bg-fuchsia-600' : 'bg-slate-900'
          }`}
          onClick={() => setOpen((value) => !value)}
        >
          {active.length > 0 ? `Chaos on (${active.length})` : 'Chaos'}
        </button>
      </div>
    </>
  )
}
