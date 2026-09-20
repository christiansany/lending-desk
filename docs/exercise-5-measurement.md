# Exercise 5: remove the detail-page waterfall

Start from `course/ssr-and-csr-e5`.

The detail route performs three independent reads in sequence. Measure it once,
then start all independent work together. Finally, place the two slower facts
behind separate Suspense boundaries so useful content can arrive first.

| Version | Loading fallback | First useful item | Availability | Full response |
| --- | ---: | ---: | ---: |
| sequential | | | | |
| parallel | | | | |
| parallel and streamed | | | | |

Use one item ID and record the median of three fresh requests. After each code
change, stop the server, run `npm run build`, and start it again before measuring.
If the response is not chunked, confirm that the route is dynamic before changing
Suspense.

```bash
curl --trace-time --trace-ascii - -s http://localhost:3000/items/item-001 -o /dev/null 2>&1 | grep "Recv data"
```

Done when the three promises start before the first await, the item shell has a
meaningful fallback, and the slow facts no longer block the shell.
