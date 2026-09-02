---
name: lending-desk-review
description: Review a Lending Desk change for repository conventions, resilient UI, accessible forms, safe logging, and validation. Use for pull request reviews and before completing feature work.
---

# Lending Desk review checklist

Review only the requested change and its direct integration points. Report
concrete defects with the affected user scenario and the smallest safe remedy.

## Architecture

- Feature changes are in `src/features/`; reusable controls/state surfaces are
  in `src/ui/`; shared data/logging changes are in `src/lib/`.
- No incidental raw fetching, new data/form libraries, duplicate controls, or
  broad refactors.
- `app/api/` and `server/` remain unchanged unless the task explicitly required
  API work.

## Async behavior

- Initial loading, retained-content refresh, empty success, failure, and pending
  mutation are distinguishable.
- Filtered-empty and truly-empty collection messages are not generic.
- 404, 409, 422, 429, 500/503, timeout/network, and malformed JSON behavior is
  appropriate for every changed request.
- Server 422 fields are not flattened into a generic string; 409 preserves
  entered values; retries are explicit and safe.
- Changed requests have been exercised with the applicable Chaos Panel switch.

## Forms and accessibility

- Native controls have visible labels and compatible native input constraints.
- There is no feature-local ARIA wiring or hard-coded duplicate field ID.
- Validation produces persistent field guidance plus a summary for multi-field
  failure, and preserves input. Keyboard focus remains predictable.
- The button-driven submission convention is respected: no `onSubmit`.

## Logging and validation

- Unexpected and operationally significant outcomes use `src/lib/log.ts` with
  safe structured context and `requestId` when available.
- No personal data, free text, credentials, headers, or payloads are logged.
- The smallest relevant existing validation command has run; the review notes
  any command that was unavailable.
