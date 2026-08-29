# The API in this repo

Base URL `http://localhost:3000/api`. Everything is JSON. Every response — errors included —
carries an `x-request-id` header; the same id appears in the server log and in the body of every
error.

Responses take 120–400 ms. Search takes longer the more hits it produces.

---

## `GET /api/items`

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `q` | string | `''` | substring match on name, description, serial |
| `category` | string | — | one of `laptops`, `cameras`, `audio`, `tools`, `vr`, `misc` |
| `page` | integer ≥ 1 | `1` | |
| `limit` | integer 1–50 | `12` | |

There are 47 items in total.

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
      "dailyRate": 5
    }
  ],
  "total": 47,
  "page": 1,
  "limit": 12
}
```

A malformed `page`, `limit` or `category` gives a **400**.

## `GET /api/items/:id`

Returns a single item, or a **404** if the id does not exist.

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

## `GET /api/reports?itemId=item-001` · `POST /api/reports`

```jsonc
// request
{
  "itemId": "item-001",
  "reporter": "Timo Widmer",
  "email": "timo.widmer@example.com",
  "severity": "limited",          // "cosmetic" | "limited" | "unusable"
  "description": "The left hinge is loose, the display wobbles."
}
```

Rules: reporter at least 2 characters · a reachable email address · a valid severity ·
description at least 10 characters. Answers **201**, otherwise **422**.

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
