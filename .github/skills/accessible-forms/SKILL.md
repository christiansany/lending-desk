---
name: accessible-forms
description: Implement or review accessible Lending Desk forms, validation, and submission feedback. Use whenever adding or changing a field, validation rule, form submission, or form error UI.
---

# Accessible form workflow

Read the API request and RFC 9457 error contract in `docs/api.md`, then inspect
the relevant `src/ui/` controls before implementing. The server remains the
authority; client validation makes errors easier to correct sooner.

## Form structure

1. Use a native semantic form layout and repository `Field`, `Select`, and
   `Button` components. Use an explicit, visible label for every control.
2. Choose native types and constraints that match the API (`email`, `date`,
   `number`, `required`, `min`, `max`, `step`). A placeholder is never a label
   or the only instruction.
3. Group controls that answer one question, such as a date range, with a
   `fieldset` and `legend`. Put format and date-range instructions before the
   relevant controls.
4. Keep a separate `useState` field for each value. Submit via the button
   `onClick`, not form `onSubmit`, due to this repository's explicit
   application convention.

## Validation and messages

- Validate local constraints in the submit action. Do not show errors while the
  user is merely typing unless a genuinely useful asynchronous check requires
  it; never steal focus for live feedback.
- On submit failure, retain every value, add a form-level error summary before
  the fields, and show the same concise corrective message at each invalid
  field. The summary links/focuses through capabilities provided by the design
  system.
- Map server 422 `errors` by request field name. Do not join them into one
  opaque alert message.
- Add an accessible error relationship and error styling in `src/ui/`, not in
  feature code. Controls need stable unique IDs; a hard-coded shared `id` is
  invalid and breaks label/error association.
- `alert()` may supplement a blocking global outcome under the existing
  product convention, but it is not adequate as the sole presentation of
  field-level validation.

## Focus and announcements

- On a submit with errors, move focus to the persistent summary through the
  design-system contract. Let users then follow summary links to controls.
- Do not move focus on a successful background refresh or advisory update.
- Let a design-system status region announce saving, saved, and changing result
  counts politely. Reserve urgent announcements for immediate, text-only
  failures; do not include buttons or links in urgent alert content.
- Maintain visible keyboard focus and DOM order that matches visual order.

## Submission safety

- Disable or otherwise make repeated activation safe while submitting, but do
  not disable a form so completely that its current contents disappear.
- For a 409 reservation conflict, retain the name, dates, and purpose; explain
  the changed availability and help the user choose a new period.
- For unknown network/timeout results of a write, do not claim success or
  automatically resend. State that completion is uncertain, retain entries,
  and offer a deliberate next step.

## Completion checklist

- Keyboard-only users can identify every field, instruction, error, and submit
  state.
- The label and descriptive/error text have a unique programmatic association
  through `src/ui/`.
- Field, summary, server, conflict, and unknown-outcome paths preserve input.
- The smallest relevant lint/typecheck command has passed.
