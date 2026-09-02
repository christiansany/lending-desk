---
applyTo: "app/api/**,server/**"
---

# Finished API boundary

These files implement the finished in-memory API and its testable failure
injection behavior. Treat them as read-only unless the user explicitly asks for
an API or server change.

When feature work needs a different client outcome, first adapt the client
against the documented contract in `docs/api.md`; do not silently change status
codes, problem response fields, request-ID behavior, or Chaos Panel scenarios.
If an authorized API change is necessary, preserve RFC 9457 problem responses,
`x-request-id` on every response, and the existing focused API tests.
