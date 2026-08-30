# Robustness sheet

> Fill this in **after** your first run, while going through the Chaos Panel. Write down what you
> *observed*, not what you expected.

Six axes plus the context line. Every line is an instruction with an expected observation, doable
in ≤ 90 seconds.

| # | Axis | Do this | Expect to see | Observed | Severity | Error class |
|---|---|---|---|---|---|---|
| T1 | Time | Chaos `slow` on, open the item list | A loading state, not a blank page |  |  |  |
| T2 | Time | Chaos `slow` on, type `mac` into the search field quickly | The newest query wins — not the slowest response |  |  |  |
| E1 | Errors | Chaos `500` on, reload the list | A readable message plus the request id |  |  |  |
| E2 | Errors | Chaos `409` on, submit the form | *What* is taken and until when |  |  |  |
| E3 | Errors | Chaos `garbage` on, reload | No crash, no `[object Object]` |  |  |  |
| Z1 | Emptiness | Search for `zzzz` | An empty state that names the search term |  |  |  |
| Z2 | Emptiness | Filter `owner=mine` + `status=reserved` until nothing matches | An empty state that says *which* filters are to blame |  |  |  |
| Z3 | Emptiness | Chaos `empty` on, reload the list | Empty state — not a loading spinner forever |  |  |  |
| C1 | Concurrency | Chaos `slow` on, click submit twice | Exactly one reservation is created |  |  |  |
| C2 | Concurrency | Chaos `slow` on, switch category twice in a row | The list matches the selected category |
| C3 | Concurrency | Add an item, then reload the list | It is there, under `owner=mine` too |  |  |  |
| A1 | Accessibility | Click on a form label | The matching input gets focus |  |  |  |
| A2 | Accessibility | Fill the form with the keyboard only, submit with Enter | It submits |  |  |  |
| A3 | Accessibility | Provoke a validation error, tab to the field | The error is linked to the field, not just coloured |  |  |  |
| D1 | Diagnosis | Trigger a `500`, copy the `x-request-id` from the screen | The same id in the server terminal |  |  |  |
| D2 | Diagnosis | Look at the browser console after a failed request | A log line with level and request id |  |  |  |
| X1 | Context | Find out which files your agent reads automatically | The list of instruction files — and who wrote them |  |  |  |
