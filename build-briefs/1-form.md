# Build brief 1 — the form

## Must (20 min)

Take the reservation form or the "offer your own item" form and make it behave like a form:

- Submitting works with the **Enter** key from inside a text field.
- Every input has a label that is actually bound to it — clicking the label focuses the input.
- Validation errors are shown **at the field**, not in a dialog.
- While the request is in flight the submit button is disabled; a double click cannot send twice.

## Should

- Field errors from a `422` (`errors` in the problem body, see `docs/api.md`) are mapped back
  onto the matching fields.
- A `409` says *what* is taken and until when, not just "failed".
- Success is announced, not just rendered.

## Stretch

- The form is usable with the keyboard only, from first field to confirmation.

## Acceptance

With the Chaos Panel on `409` and on `500`, a user with a keyboard and no mouse can tell what
went wrong and what to do next.
