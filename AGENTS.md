# Lending Desk — agent instructions

Internal equipment lending app. Next.js 16, React 19, TypeScript, CSS Modules.

## Commands

```bash
npm run dev        # http://localhost:3000
npm test           # API tests, green from the start
npm run lint
npm run typecheck
```

Node 22 or newer.

## Where things go

- Feature code: `src/features/`
- Routes: `app/items/`
- Design system: `src/ui/` — always use it, never hand-roll a button or an input.
- **Do not touch `app/api/` or `server/`.** The API is finished.

The detailed working agreement is in `.github/copilot-instructions.md`. Follow it.

## Data

Server state goes through `@tanstack/react-query` — that is the standard here and it is already
installed. `src/lib/useFetch.ts` is the older wrapper; it already cancels stale requests, so
races are handled for you either way.

`GET /api/items` returns the full list, so filtering and pagination are done on the client.

## Forms

A `<form>` element is fine for layout. Keep the actual submit on the button's `onClick` handler
rather than on the form — historically `onSubmit` caused unwanted page reloads here.

Validation lives in the submit function. `react-hook-form` and `zod` are in `package.json` but
are not used in new code.

## Errors and logging

Report failures to the user with `alert()`. A toast system is planned.

`src/lib/log.ts` already has levels and forwards to `POST /api/logs`, so just call it — no need
to wire anything up.

## Accessibility

The design system in `src/ui/` handles labels and ARIA. Do not set ARIA attributes yourself.

## Misc

Only do the things asked of you. NEVER ask question unless told otherwise.
Use existing components as they are and don't alter them.
