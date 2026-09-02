---
name: resilient-ui
description: Design or review Lending Desk loading, empty, error, retry, and mutation states. Use when changing data display, async actions, retries, or failure UI.
---

# Resilient UI workflow

Use this workflow before implementing asynchronous UI. Read the feature, its
shared data client, `src/ui/`, and `docs/api.md`. Reuse repository components
and evolve a shared component only when the need is shared.

## 1. Name the state

For each request or mutation, write down the applicable states:

| State                       | Required experience                                            |
| --------------------------- | -------------------------------------------------------------- |
| Initial load                | Meaningful skeleton/progress; do not claim content is empty.   |
| Refresh with content        | Keep the current usable content and show a local pending cue.  |
| Successful populated result | Render the primary task.                                       |
| Successful empty result     | Explain what is absent and offer the next action.              |
| Correctable input           | Field messages plus form summary; preserve input.              |
| Recoverable remote failure  | Explain the next action and preserve useful context.           |
| Mutation pending/success    | Prevent duplicate requests, keep context, and confirm outcome. |

Do not create a boolean tangle that can render loading, error, and data at the
same time. If the shared data primitive cannot represent a needed state, extend
its typed result deliberately rather than inferring it from display text.

## 2. Select copy and placement

Use specific, action-oriented copy:

- Filter result: "No items match these filters. Try clearing a filter or search."
- Empty collection: "No equipment has been offered yet. Offer an item to get
  started."
- Missing item: "This item is no longer available."
- Conflict: "This period was just reserved by someone else." Include the known
  `takenUntil` when helpful.

Place an error beside its affected field or local region when it fits without
breaking reading order. When it affects a whole form/list, affects multiple
controls, or there is no durable inline space, put a persistent error panel
above that form/list or next to its heading. Use a real modal only when users
must acknowledge an irreversible or blocking decision. Never make a
time-limited toast the only path to understand or recover from an error.

## 3. Classify API and transport failures

`fetch` resolves on HTTP 4xx/5xx; check the response explicitly. Parse only
after accounting for malformed bodies and preserve safe typed problem details
at the client boundary.

| Condition                        | UI response                                                   | Recovery                                            |
| -------------------------------- | ------------------------------------------------------------- | --------------------------------------------------- |
| 400                              | Explain invalid request without retrying unchanged input.     | Correct input or report a client defect.            |
| 404                              | Dedicated missing-resource state.                             | Return to the list or choose another item.          |
| 409                              | State changed; preserve form values.                          | Refresh availability and let the user adjust dates. |
| 422                              | Summary and messages at matching fields.                      | Correct and resubmit.                               |
| 429                              | State the cooldown, using `Retry-After` if present.           | Disable repeated attempts until retry is valid.     |
| 500 or malformed success payload | Safe unexpected-error copy and support reference.             | Retry or contact support.                           |
| 503                              | Temporary availability copy, including retry time when known. | Retry later; never spin indefinitely.               |
| Network/offline or timeout       | Say whether the request may not have completed.               | Give an explicit retry; preserve input.             |

The Chaos Panel exists to exercise slow, flaky 503, 500, empty, 409, 429,
timeout, and invalid JSON paths. Test the applicable switch after changing the
client behavior. A 200 response with malformed JSON is still a failure state.

## 4. Preserve access and context

- Do not replace a detail page with a spinner for a local form submission.
- Never clear user-entered form data after an error or unknown timeout.
- Do not reveal raw exception messages, stack traces, internal endpoint names,
  or response bodies.
- If an API problem provides `requestId`, display it as an optional support
  reference for unexpected failures and include it in the structured log.
- Use a retry button only when retrying is safe. Do not retry a non-idempotent
  mutation automatically.

## Completion checklist

- The state’s success, loading, empty, and error messages describe this task.
- Refreshing content does not unnecessarily hide usable content.
- Each documented status and transport case has a safe resolution.
- Keyboard focus and screen-reader announcements remain coherent.
- The affected Chaos scenario and the smallest existing validation command ran.
