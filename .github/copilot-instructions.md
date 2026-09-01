# Working agreement for this repository

## Stack

React 19 with TypeScript. No additional dependencies without discussion — we keep the bundle
small.

## Data access

Data is loaded with our hook `src/lib/useFetch.ts`. Please no bespoke fetch calls and no
data-fetching libraries.

## Forms

- Form state with `useState`, one state per field. No form or validation libraries.
  (`react-hook-form` and `zod` are still in package.json but are legacy and no longer used.)
- Validation directly in the submit function.
- Submitting happens via `onClick` on the submit button. We DO NOT use `onSubmit` on the `<form>`;
  that caused unwanted reloads in the past.

## Errors

We show errors with `alert()`. A toast system is planned.

## Accessibility

Do not set ARIA attributes yourself — our design system in `src/ui/` handles that.

## Miscellaneous

- `any` is allowed where proper typing would be disproportionate effort.
