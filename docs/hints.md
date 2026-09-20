# Workshop hint ladder

Reveal one hint at a time.

## Exercise 1

1. Elements is the current DOM. The question asks what arrived over the wire.
2. Use View Source, disable JavaScript, and inspect the `/api/items` initiator.
3. Search the source for a known item name such as `MacBook Pro 14`.

## Exercise 2

1. Keep the complete interactive application at `/csr`. The new `/` may be a
   read-only server-rendered catalogue for this exercise.
2. `server/data.ts` exposes the list operation without a browser round trip.
3. A small semantic list is enough. Do not rebuild every client interaction.

## Exercise 3

1. Compare the server text and the client's first render, not the final DOM.
2. Time and locale output are common sources of disagreement.
3. Compute one ISO value on the server and pass that exact value to the client.

## Exercise 4

1. The starting branch already moves item reads into the route. Add state files,
   not another data layer.
2. Next.js discovers `loading.tsx`, `not-found.tsx`, and `error.tsx` by location.
3. In `error.tsx`, call both `reset()` and `router.refresh()` so retry clears
   the boundary and requests a fresh server render. Keep a return path in
   `not-found.tsx`. The `force-error` trigger is permanent, so confirm the new
   request in Network even though it deliberately fails again.

## Exercise 5

1. Independent promises do not need independent start times.
2. Start all three operations before awaiting the item.
3. Put slow facts in async children behind separate Suspense boundaries.

## Exercise 6

1. A build symbol is evidence about production output, not a product requirement.
2. Ask whether the response varies by request, user, or time.
3. `/imprint` should be static. `/reservations` deliberately simulates a per-user route.

## Exercise 7

1. Name the user-visible wait before naming a rendering technique.
2. Consider freshness, interactivity, failure isolation, and operational cost.
3. A valid answer may keep CSR where a warm, private workflow gains little from SSR.
