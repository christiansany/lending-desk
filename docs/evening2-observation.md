# Exercise 1: what does the app actually send?

You will reconstruct one cold visit to the item list. Do not change application
code in this exercise.

## Before you start

Confirm that you are on the evening-2 starting point:

```bash
git branch --show-current
```

Your local branch should be `workshop/evening2-e1`, created from
`course/evening2-start`. Do not use `main`; the course keeps that branch for
evening 1.

Run the production application:

```bash
npm ci
npm run build
npm start
```

Open <http://localhost:3000> in a clean browser profile. In DevTools, open the
Network panel, select "Disable cache", and keep the panel recording.

## Part 1: collect evidence

Reload `/`, then fill in the table. Record where you found each answer so
another pair can verify it.

| Observation                                       | Result | Evidence location |
| ------------------------------------------------- | ------ | ----------------- |
| Does `MacBook Pro 14"` appear in View Source?     |        |                   |
| Does the item list work with JavaScript disabled? |        |                   |
| HTML document size                                |        |                   |
| JavaScript transferred before the list appears    |        |                   |
| Request that loads the item data                  |        |                   |
| Build symbol for `/`                              |        |                   |

Use the browser's literal **View Source** command. The Elements panel shows the
DOM after JavaScript changed it, so it cannot answer the first question.

## Part 2: reconstruct the request

Reload once more with the Network log cleared. Put the measured times above the
events. The exact values will differ between machines. The order matters.

```text
navigation     HTML arrives     JavaScript runs     API ends     first item appears
    0 ms            ___ ms             ___ ms          ___ ms            ___ ms
```

Use the request waterfall and Initiator column when two events look as if they
happened at the same time.

## Part 3: interpret it

Write short answers in `NOTES.md`.

1. What solved the full-page reload problem in this application?
2. What must finish before the first useful item appears on a cold visit?
3. Which wait would server rendering remove?
4. Which browser work would remain after server rendering?
5. Is that improvement valuable enough for this internal tool to justify more
   server work? What evidence would you need to decide?

## Done when

You can show another pair:

- the response body that does not contain an item name
- the page with JavaScript disabled
- the request that fetches the list
- the build symbol that describes `/` as static
- one request ladder with your timings
