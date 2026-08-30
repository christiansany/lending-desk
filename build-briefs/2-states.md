# Build brief 2 — states

Every screen has four states, not one: loading, empty, error, content.

## Must (20 min)

- Turn on Chaos `slow` and `flaky` and go through the list and the detail view. Every state is
  visible and none of them is a blank page.
- `src/ui/EmptyState.tsx` can say what is actually empty ("No items match 'zzzz'").
- `src/ui/ErrorState.tsx` renders an RFC 9457 problem body as text a human can read — including
  the `requestId`.

## Should

- Type into the search field with Chaos `slow` on: the result that arrives last must not
  overwrite a newer one. Fix `src/lib/useFetch.ts`, do not work around it in the component.
- A failed request can be retried without a page reload.

## Stretch

- `429` is handled with its `Retry-After` header instead of just failing.

## Acceptance

With every Chaos switch flipped on one after the other, no screen ends up blank, frozen, or
showing `[object Object]`.
