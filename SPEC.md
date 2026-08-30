# Lending Desk — what exists, what is missing

Start here. This is the whole scope. Ask your AI assistant to read this file together with
`README.md` and `docs/api.md` before it writes anything.

## What this is

An internal app for lending out equipment. Colleagues currently phone the desk to ask whether a
camera is free, and they email a colleague when they want to offer up something of their own.
Both should be self-service.

## What already exists

| | |
|---|---|
| `app/api/` + `server/` | The complete API. **Finished — do not change it.** `docs/api.md` describes it |
| `src/ui/` | The design system |
| `src/lib/` | The data-fetching hook, the logger, formatters |
| `app/ChaosPanel.tsx` | Dev-only panel that injects failures into the API |
| `tests/` | Tests for the API. `npm test` is green from the start |

The data is seeded on every server start: 47 items across six categories, five owners (one of
them you), three reservations. It lives in memory and is gone when the server restarts — the
Chaos Panel has a reset button.

There is no login. `GET /api/me` says who "you" are.

## What is missing

Everything the user sees. One page, `/items`, plus a detail view underneath it.

### 1. The item list

- All items with name, category, location, owner and whether they are currently reserved.
- Paginated — 47 items at 12 per page is four pages.
- Click an item to reach its detail view with the full description and its reservation state.

### 2. Filtering the list

Four filters, combinable, all backed by `GET /api/items`:

- **Free text** — fuzzy, so a typo still finds the item.
- **Reservation status** — everything / only free / only reserved.
- **Owner** — everything / mine / other people's.
- **Category**.

### 3. Reserving an item

A form on the detail view: name, email, from, to, purpose. It has to survive the period being
taken already (`409`) and the API rejecting single fields (`422`).

### 4. Offering an item of your own

A form on the list page to add an item you want to lend out: name, category, description,
location, condition, daily rate. It appears in the list afterwards, owned by you.

### 5. The states, everywhere

Every screen and both forms have four states, not one: **loading**, **empty**, **error**,
**content**. The list has two distinct empty states — no items at all, and no items matching the
current filters. Errors carry an `x-request-id`; the user has to be able to quote it.

## Ground rules

- Your code goes in `src/features/`, routes in `app/items/`.
- Use the design system in `src/ui/`. Use the working agreement in
  `.github/copilot-instructions.md`.
- Do not touch `app/api/` or `server/`.

## Done when

Someone can find a free camera, reserve it, and offer up their own tripod — without calling the
desk, and without the screen going blank when something goes wrong.
