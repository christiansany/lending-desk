# Exercise 5: remove the detail-page waterfall

Start from `course/ssr-and-csr-e5`.

The detail route performs three independent reads in sequence. Measure it once,
then start all independent work together. Finally, place the two slower facts
behind separate Suspense boundaries so useful content can arrive first.

| Version | First response content | Availability visible | Reservation count visible |
| --- | ---: | ---: | ---: |
| sequential | | | |
| parallel | | | |
| parallel and streamed | | | |

Use one item ID and the same production build for all three measurements. Record
the median of three runs. If the response is not chunked, confirm that the route
is dynamic before changing Suspense.

Done when the three promises start before the first await, the item shell has a
meaningful fallback, and the slow facts no longer block the shell.
