---
name: client-observability
description: Add or review Lending Desk client logging and failure diagnostics. Use when changing asynchronous client actions, error handling, logging, request correlation, or telemetry.
---

# Client observability workflow

Use `src/lib/log.ts` as the sole feature-level logging entry point. Read
`docs/api.md` and the existing logger before changing log behavior. The API log
sink accepts `debug`, `info`, `warn`, or `error` and a context object.

## Event design

Use a stable event name and a small, allowlisted context. Relevant keys are:

```text
event, level, route, action, outcome, httpStatus, requestId, durationMs, retryCount
```

Examples:

```text
reservation.create.failed  { action: "reservation.create", outcome: "conflict", httpStatus: 409, requestId }
item.offer.succeeded       { action: "item.offer", outcome: "success", httpStatus: 201, durationMs }
item.list.load.failed      { action: "item.list.load", outcome: "timeout" }
```

Use the response header/body `requestId` to correlate a client report with the
server log. Preserve the existing logger API or migrate all its callers
deliberately if the shared utility is enhanced.

## Safety rules

- Logging must not control user-facing behavior. A logging failure cannot turn a
  completed action into a displayed failure or prevent a retry.
- Never log raw request/response bodies, form values, names, email addresses,
  locations, item descriptions, serial numbers, free-text purpose, headers,
  cookies, tokens, credentials, stack traces, or secrets.
- Do not use `console.*` in feature code. Avoid high-volume success logs and
  logs inside render paths or keystroke handlers.
- Use `error` for unexpected failures, `warn` for expected but operationally
  useful conditions such as rate limiting, and lower levels sparingly.
- User-facing support references must be safe request IDs or generated support
  codes, never internal exception text.

## Error classification

At the shared request boundary, distinguish HTTP problem responses from network
failures, timeout/abort, malformed JSON, and unexpected client errors. Record
only the classification, HTTP status, retry metadata, and request ID. Do not
serialize the caught error object wholesale.

## Completion checklist

- Event names are stable and context is allowlisted.
- A matching server request can be found using `requestId` when available.
- No protected or personal information reaches `log`.
- The user message remains actionable even if logging fails.
