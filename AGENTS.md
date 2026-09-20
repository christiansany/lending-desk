# Lending Desk agent guide

Lending Desk is a brownfield internal equipment-lending application built with
Next.js 16, React 19, TypeScript, and CSS Modules. Improve the existing system;
do not replace its architecture with a new stack.

## Course branch

- This branch is the canonical starting point for course evening 2. Do not move
  evening-2 preparation to `main`; the course still uses `main` for evening 1.
- Preserve the client-rendered list and detail startup path until exercise 1 has
  measured it. UX fixes may change presentation and behavior, but the first
  response must remain an application shell on `evening2-start`.
- Derive later exercise branches from `evening2-start` and document the branch
  used by each exercise.

## Start with the repository

- Read the affected feature, its shared dependencies, and [docs/api.md](docs/api.md)
  before changing code. The API document is the client contract.
- Feature code belongs in `src/features/`; routes belong in `app/`; reusable UI
  belongs in `src/ui/`; shared client infrastructure belongs in `src/lib/`.
- Treat `app/api/` and `server/` as finished and read-only unless the user
  explicitly asks to change them.
- Reuse the established data client for the affected feature. Current item
  features use `src/lib/useFetch.ts`; do not introduce raw `fetch`, React Query,
  React Hook Form, Zod, or another data/form library as incidental feature work.
- Reuse the design system. Do not create feature-local buttons, fields, selects,
  spinners, state panels, or ad-hoc ARIA wiring. If a broadly needed accessible
  capability is missing, make a small, deliberate `src/ui/` change only when
  the task authorizes a design-system change.

## Product and API facts

- The root route lists equipment with combined client-side search, availability,
  owner, category, and pagination filters. Item detail supports reservations;
  the root page also offers an item.
- The API has in-memory data and returns `x-request-id` on every response.
  RFC 9457 (`application/problem+json`) errors can include `detail`,
  field-level `errors`, `takenUntil`, and `requestId`.
- The development Chaos Panel deliberately produces slow, flaky/503, 500,
  empty, 409, 429 with `Retry-After`, hanging timeout, and malformed JSON
  scenarios. When changing client data behavior, handle and exercise the
  applicable scenarios instead of assuming a successful JSON response.

## UI quality bar

- Model the full lifecycle: initial loading, refresh/loading-with-content,
  success, meaningful empty result, recoverable failure, and submitted/saving
  state. Never render a generic "No data" state for every empty result.
- Preserve useful content and form entries during retries and failures. Avoid
  full-page spinners for a local action or refresh when existing content can
  remain usable.
- Map expected failures to their resolution: field errors (422), a changed
  reservation (409), a missing item (404), cooldown (429), retryable temporary
  outage/timeout, and generic unexpected failures. Do not expose raw exception
  text or implementation details to users.
- Use the available `requestId` as a support reference for unexpected failures
  and in the corresponding structured log context.
- Use the `resilient-ui`, `accessible-forms`, and `client-observability` skills
  for work in those domains. They define the required decision process.

## Forms and accessibility

- Prefer native semantic HTML and existing design-system controls. Each control
  needs an unambiguous visible label; placeholders do not replace labels.
- Keep one `useState` value per field. Validate in the button action and submit
  through the button's `onClick`; do not attach `onSubmit` in this application.
- Client checks improve feedback but do not replace the server as the authority.
  Keep submitted values on any failure and surface server 422 field messages at
  their matching controls.
- A global `alert()` can acknowledge a concise blocking outcome in accordance
  with the current app convention, but it must not be the only feedback for
  multi-field validation. Use an error summary and persistent field-level
  guidance when the task includes validation UX.
- Do not set ARIA attributes in feature code. Design-system components own
  accessible relationships, focus behavior, and live announcements.

## Logging and privacy

- Call `src/lib/log.ts`; do not add `console.*` calls in feature code. Keep
  logging failure-independent: telemetry must not change the user-visible
  success/failure result.
- Emit stable, structured events with a level, event/message, route or action,
  outcome, HTTP status when applicable, and `requestId` when available.
- Never log request/response bodies, free-text purpose/description fields,
  names, email addresses, authentication material, tokens, or secrets. Prefer
  a safe allowlist of operational context over redaction after the fact.

## Delivery

- Make targeted changes, preserve unrelated work in a dirty tree, and avoid
  destructive Git commands or force pushes.
- Check types and API shapes at boundaries. Do not use casts to hide a mismatch.
- Run the smallest existing validation that covers the change; use `npm test`
  for API work, and `npm run lint` and/or `npm run typecheck` for affected
  client TypeScript. Report commands that could not be run and why.
- Review the changed user flow at narrow viewport width and keyboard-only
  navigation when UI behavior, states, or forms change.
