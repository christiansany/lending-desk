# Lending Desk — agent instructions

Internal equipment lending app. Next.js 16, React 19, TypeScript, CSS Modules.

## Commands

```bash
npm run dev        # http://localhost:3000
npm test           # API tests, green from the start
npm run lint
npm run typecheck
```

Node 24 or newer.

## Where things go

- Feature code: `src/features/`
- Routes: `app/` — the root page is the items list; add further routes alongside it
- Design system: `src/ui/` — always use it, never hand-roll a button or an input.
- **Do not touch `app/api/` or `server/`.** The API is finished.

The detailed working agreement is in `.github/copilot-instructions.md`. Follow it.

## Data

Server state goes through `@tanstack/react-query` — that is the standard here and it is already
installed. `src/lib/useFetch.ts` is the older wrapper; it already cancels stale requests, so
races are handled for you either way.

`GET /api/items` returns the full list, so filtering and pagination are done on the client.

## Forms

- Form state with `useState`, one state per field. No form or validation libraries.
  (`react-hook-form` and `zod` are still in package.json but are legacy and no longer used.)
- Validation directly in the submit function.
- Submitting happens via `onClick` on the submit button. We DO NOT use `onSubmit` on the `<form>`;
  that caused unwanted reloads in the past.

## Errors and logging

Report failures to the user with `alert()`. A toast system is planned.

`src/lib/log.ts` already has levels and forwards to `POST /api/logs`, so just call it — no need
to wire anything up.

## Accessibility

The design system in `src/ui/` handles labels and ARIA. Do not set ARIA attributes yourself.

## Important

- ONLY DO THE THINGS ASKED OF YOU.
- NEVER ask question unless told otherwise.
- Use existing components as they are and don't alter them.
