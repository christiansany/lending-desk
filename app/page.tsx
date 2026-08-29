'use client'

import { Card } from '@/src/ui'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Lending Desk</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Internal application for lending out equipment. The API is finished and lives under{' '}
          <code className="rounded bg-slate-200 px-1">/api</code>. The screens are not.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-1 text-base font-semibold">Brief A — Item list and reservation</h2>
          <p className="text-sm text-slate-600">
            Search, filter, detail view, reservation form. See{' '}
            <code className="rounded bg-slate-200 px-1">briefs/A-item-list-and-reservation.md</code>.
          </p>
        </Card>
        <Card>
          <h2 className="mb-1 text-base font-semibold">Brief B — Damage report</h2>
          <p className="text-sm text-slate-600">
            Report damage on an item, list existing reports. See{' '}
            <code className="rounded bg-slate-200 px-1">briefs/B-damage-report.md</code>.
          </p>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Where things are</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            <code className="rounded bg-slate-200 px-1">docs/api.md</code> — the API, with example
            payloads
          </li>
          <li>
            <code className="rounded bg-slate-200 px-1">src/ui/</code> — the design system
          </li>
          <li>
            <code className="rounded bg-slate-200 px-1">src/lib/</code> — data access, logging,
            formatting
          </li>
          <li>
            <code className="rounded bg-slate-200 px-1">src/features/</code> — your code goes here
          </li>
          <li>
            <code className="rounded bg-slate-200 px-1">robustness-sheet.md</code> — the checklist
            for the evening
          </li>
        </ul>
      </section>
    </div>
  )
}
