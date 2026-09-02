# Repository-wide Copilot instructions

- This is a brownfield Next.js 16 / React 19 / TypeScript equipment-lending app.
  Read nearby code and [docs/api.md](../docs/api.md) before changing a feature.
- Put feature code in `src/features/`, routes in `app/`, reusable controls and
  state UI in `src/ui/`, and shared client utilities in `src/lib/`.
- Reuse `src/ui/` and the data-access pattern already used by the feature. Do
  not introduce raw fetches, React Query, React Hook Form, Zod, or dependencies
  as incidental work.
- `app/api/` and `server/` are finished: do not modify them unless explicitly
  requested.
- Treat loading, empty, error, and retry states as first-class UI states. Use
  the repository skills for resilient UI, accessible forms, and client logging.
- Preserve form input on errors. Keep user messages actionable and safe; never
  expose raw exceptions or log personal data, free text, credentials, or bodies.
- Validate the changed behavior with the smallest relevant existing command
  before completing work.
