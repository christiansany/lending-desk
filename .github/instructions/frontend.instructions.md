---
applyTo: "app/**/*.ts,app/**/*.tsx,src/features/**/*.ts,src/features/**/*.tsx,src/ui/**/*.ts,src/ui/**/*.tsx"
---

# Frontend instructions

## State design

- Determine whether a request is initial load, a refresh with usable content,
  an empty success, or a failure before choosing UI. Retain prior content while
  refreshing where doing so avoids layout collapse or blocked work.
- Use `Spinner`, `EmptyState`, and `ErrorState` only when their presentation
  and contract fit the state. Improve a shared state component when several
  consumers need richer copy, actions, or accessibility; do not duplicate it
  in feature CSS.
- Empty is successful absence. Explain what is absent, why when known, and the
  next useful action. Distinguish "no equipment yet" from "no items match these
  filters"; never call either an error.
- Keep state changes localized: a reservation submission should not hide item
  detail; a filter refresh should not blank a usable list.

## Error decisions

- Parse the documented RFC 9457 problem response and preserve status,
  `detail`, field `errors`, `takenUntil`, `Retry-After`, and `requestId` at the
  shared client boundary when the feature needs them. A successful status can
  still have malformed JSON; network errors and a timeout do not have an HTTP
  problem body.
- Use field-level messages plus a form-level error summary for 422. Preserve
  values and direct users to correction; do not flatten the field map into an
  alert string.
- For 409, say that availability changed, preserve the form, and offer a
  meaningful next action such as refreshing availability. For 404, render a
  clear missing-resource path. For 429/503, honor `Retry-After` when supplied
  and avoid automatic retry loops. For timeout/network/500/malformed data,
  show safe generic copy, a retry action where appropriate, and the request ID
  when available.
- Inline errors belong immediately beside the affected control or compact
  content region. If that space is unavailable, would distort a dense layout,
  or the fault affects multiple controls, use a persistent page/form-level
  error panel near the affected heading or submit action. Do not rely on a
  transient toast for validation or a failure that needs action.
- Use `alert()` only for the application's existing concise acknowledgement
  convention. It supplements, rather than replaces, persistent corrective
  feedback.

## Forms and accessibility

- Use `Field`, `Select`, and `Button`; retain their native semantics and a
  visible label. Use the right input type, `required`, `min`, `max`, and `step`
  where the server contract supports them. Placeholder text is supplementary.
- Keep submit validation in the button's `onClick`, as required by this app.
  Use `type="button"` for non-submit controls. Do not add `onSubmit`.
- For a custom validation experience, make the design system generate stable,
  unique field IDs; associate label, hint, and persistent error text through
  its component contract. Group related controls in a `fieldset` with `legend`.
  Feature code must not add bespoke ARIA attributes.
- On a submit with multiple errors, present a persistent error summary before
  the controls, focus that summary through the design system, and provide
  matching inline messages. Do not move focus during ordinary typing or a
  non-blocking refresh.
- Status updates such as "Saving" or filter result counts should be announced
  politely by the design system. Use an urgent announcement only for
  time-critical text-only failures; never place interactive controls in it.

## Observability

- Log unexpected failures and meaningful action outcomes through `log`, using
  safe structured context and the response `requestId`. Do not log field
  values, descriptions, names, or email addresses.
