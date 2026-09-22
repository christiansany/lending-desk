# Lending Desk

Internal application for lending out equipment: items and reservations.

This is a **brownfield project**. There is a design system, a data-fetching hook, a logger and a
finished API in place. Treat it like an inherited codebase, not a blank page.

## Getting started

```bash
npm install
npm run verify       # setup check
npm run dev          # http://localhost:3000
```

Node 24 or newer.

## SSR and CSR workshop

The workshop does not start from the default branch. Fetch the course remote
and create your local branch from `course/ssr-and-csr`:

```bash
git fetch course
git switch --create workshop/ssr-and-csr course/ssr-and-csr
```

Prepared recovery points are named `ssr-and-csr-e2` through
`ssr-and-csr-e6`. The reference result is `ssr-and-csr-solution`. The baseline
keeps the equipment list client-rendered so exercise 1 can measure that design
before changing it.

## What is where

| Path            | Contents                                                                             |
| --------------- | ------------------------------------------------------------------------------------ |
| `app/`          | Next.js app router. `app/api/` holds the API — **it is finished, do not change it.** |
| `server/`       | The API's data and logic: fixtures, in-memory store, error injection                 |
| `src/ui/`       | The design system                                                                    |
| `src/lib/`      | Data access, logging, formatting                                                     |
| `src/features/` | Your code goes here                                                                  |
| `docs/api.md`   | The API, with example payloads                                                       |
| `tests/`        | Tests for the API (`npm test`)                                                       |

## Notes

- The data lives **in memory** and is seeded on every server start: 47 items, five owners, three
  reservations. Whatever you add is gone when the server restarts. The Chaos Panel has a
  "Reset data" button.
- There is no login. `GET /api/me` says who "you" are — that is what the owner filter compares
  against.
- Every response carries an `x-request-id`, errors included. It also appears in the server log.
- The **Chaos Panel** (bottom right, dev only) injects errors into the API: slow, flaky, 500, empty,
  409, 429, timeout, garbage. While a switch is on, the page has a magenta border.
- `npm test` covers the API only. The UI has no tests — that is deliberate.
