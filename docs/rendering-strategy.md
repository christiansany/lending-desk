# Rendering strategy

One entry per route. Each records the user-visible wait or constraint the route
answers, the strategy chosen for it, the evidence that verifies the choice, and
who owns freshness and failure. A build symbol alone is not a justification.

### `/`

- User-visible wait: the catalogue should be useful in the first response.
- Strategy: request-time server rendering, with filter state in the URL.
- Evidence: a known item appears in response HTML and the build marks the route `ƒ`.
- Freshness owner: the server list operation.
- Failure owner: the route error boundary.

### `/csr`

- User-visible constraint: preserve a complete interaction-heavy CSR comparison.
- Strategy: client rendering is intentional on this control route.
- Evidence: response HTML contains the shell, then `/api/items` supplies the list;
  item links remain under `/csr/items/[id]` and fetch detail in the browser.
- Freshness owner: the client data hook.
- Failure owner: the list component with retry and preserved content.

### `/items/[id]`

- User-visible wait: item identity should arrive before the slower availability
  and reservation facts.
- Strategy: request-time server rendering with streamed facts and a client
  reservation form.
- Evidence: the item arrives near 350 ms, the independent facts near 650 and
  900 ms, and the reservation form remains interactive after hydration.
- Freshness owner: the server detail reads; the client refreshes them after a
  successful reservation.
- Failure owner: the item route boundary for reads and the form for mutations.

### `/reservations`

- User-visible constraint: results differ by the current request and user.
- Strategy: request-time rendering. The workshop uses a seeded user as an auth stand-in.
- Evidence: `cookies()` makes the request dependency explicit and the build marks `ƒ`.
- Freshness owner: the request-time server read.
- Failure owner: the route boundary.
