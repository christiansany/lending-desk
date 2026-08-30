# The API in this repo

Base URL `http://localhost:3000/api`. Everything is JSON. Every response — errors included —
carries an `x-request-id` header; the same id appears in the server log and in the body of every
error.

Responses take 120–400 ms. Search takes longer the more hits it produces.

---

## `GET /api/items`

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `q` | string | `''` | fuzzy match, see below |
| `category` | string | — | one of `laptops`, `cameras`, `audio`, `tools`, `vr`, `misc` |
| `status` | string | `all` | `all`, `free` or `reserved` |
| `owner` | string | `all` | `all`, `me` or `others` |
| `page` | integer ≥ 1 | `1` | |
| `limit` | integer 1–50 | `12` | |

There are 47 items in total. All filters combine.

`q` matches a substring in name, description, serial or owner name — and, failing that, the
letters of the query in order in the name, so `mcbk` finds `MacBook Pro 14"`. With a `q` the
result is sorted by match quality, otherwise by id.

```jsonc
// 200
{
  "items": [
    {
      "id": "item-001",
      "name": "MacBook Pro 14\"",
      "category": "laptops",
      "description": "M4 Pro, 32 GB RAM, 1 TB SSD. Charger included.",
      "serial": "LD-1000",
      "location": "Shelf A1",
      "condition": "new",
      "dailyRate": 5,
      "ownerName": "Rahel Bosshard",
      "ownerEmail": "rahel.bosshard@example.com",
      "reserved": true,
      "takenUntil": "2026-09-06",
      "mine": true
    }
  ],
  "total": 47,
  "page": 1,
  "limit": 12
}
```

`reserved` is true while a reservation is running or still ahead; `takenUntil` is its last day,
or `null`. `mine` is true when the item belongs to the current user.

A malformed `page`, `limit`, `category`, `status` or `owner` gives a **400**.

## `POST /api/items`

Adds an item to lend out. The owner is always the current user — it is not read from the body.

```jsonc
// request
{
  "name": "Nintendo Switch 2",
  "category": "misc",
  "description": "Docked and handheld, two joycon pairs.",
  "location": "Shelf B2",
  "condition": "good",        // "new" | "good" | "worn"
  "dailyRate": 8
}
// 201 — the created item, in the same shape as in the list
```

Rules: name at least 2 characters · a known category · description at least 10 characters ·
a location · a valid condition · `dailyRate` a number ≥ 0. Answers **201**, otherwise **422**.

## `GET /api/items/:id`

Returns a single item in the same shape as in the list, or a **404** if the id does not exist.

## `GET /api/me`

```jsonc
// 200
{ "name": "Rahel Bosshard", "email": "rahel.bosshard@example.com" }
```

There is no login. This is who "me" is, for the owner filter and for prefilling forms.

## `GET /api/items/:id/availability?from=YYYY-MM-DD&to=YYYY-MM-DD`

```jsonc
// 200 — free
{ "free": true, "takenUntil": null }
// 200 — taken
{ "free": false, "takenUntil": "2026-09-06" }
```

Missing or malformed dates give a **400**, an unknown item a **404**.

## `GET /api/reservations?itemId=item-001`

```jsonc
// 200
{ "reservations": [ /* … */ ], "total": 3 }
```

## `POST /api/reservations`

```jsonc
// request
{
  "itemId": "item-001",
  "name": "Rahel Bosshard",
  "email": "rahel.bosshard@example.com",
  "from": "2026-09-10",
  "to": "2026-09-14",
  "purpose": "Field recording for the documentary module"
}
// 201
{
  "id": "res-101",
  "itemId": "item-001",
  "name": "Rahel Bosshard",
  "email": "rahel.bosshard@example.com",
  "from": "2026-09-10",
  "to": "2026-09-14",
  "purpose": "Field recording for the documentary module",
  "createdAt": "2026-09-02T17:31:04.000Z"
}
```

Rules: name at least 2 characters · a reachable email address · `from` not in the past · `to` not
before `from` · at most 14 days including both ends · purpose at least 5 characters.

## `POST /api/logs`

```jsonc
// request
{ "level": "error", "message": "Reservation failed", "context": { "requestId": "8f3c-…" } }
// 202
{ "accepted": true }
```

`level` is one of `debug`, `info`, `warn`, `error`. Everything sent here is printed to the **server
terminal** in colour.

## `GET|POST /api/dev/chaos`

Development only. `GET` returns the active switches plus the available ones; `POST { "switches":
[…] }` sets them, `POST { "reset": true }` resets the data. Same endpoint the Chaos Panel uses.

---

## Errors

Errors follow RFC 9457 with `Content-Type: application/problem+json`.

```jsonc
// 422
{
  "type": "https://lending-desk.local/problems/validation",
  "title": "Validation failed",
  "status": 422,
  "requestId": "8f3c-4a1b-9d2e0f77",
  "errors": {
    "email": "This address is not reachable",
    "to": "Maximum 14 days"
  }
}
```

| Status | When | Body |
|---|---|---|
| 400 | malformed query parameters or body | `detail` |
| 404 | unknown item | `detail` |
| 409 | the period is already taken | `detail`, `takenUntil` |
| 422 | validation failed | `errors` — a field → message map |
| 429 | rate limit | `detail`, header `Retry-After: 5` |
| 500 | server error | `detail` |
| 503 | temporarily unavailable | `detail` |

The keys in `errors` are the field names from the request body.
