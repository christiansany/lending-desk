# Build brief 3 — logging

The server already logs every request with an `x-request-id`. The client throws that thread away.

## Must (20 min)

- `src/lib/log.ts` gains levels (`debug` / `info` / `warn` / `error`) and stops being silent
  outside development.
- Every failed request is logged with the `x-request-id` from the response — errors carry it in
  the body too (`docs/api.md`).
- The id is visible to the user on the error screen, so they can quote it.

## Should

- Client logs are sent to `POST /api/logs` and show up in the server terminal.
- Logging is not scattered through components — one place owns it.

## Stretch

- No `console.log` left in `src/features/`.

## Acceptance

Trigger a `500` from the Chaos Panel, read the id off the screen, and find the matching line in
the server terminal — without guessing.
