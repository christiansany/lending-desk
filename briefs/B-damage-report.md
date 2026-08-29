# LD-158 · Damage report

**Reporter:** Anna Frei (Facility Services) · **Priority:** high · **Sprint:** current

Damage is currently reported by email and gets lost. We want it on the item.

## What we need

A page where damage on an item can be reported.

- A list of all items to pick the damaged one from.
- A search field over the item name.
- A filter by category.
- Click on an item to get to its detail view with the existing reports on it.
- On the detail view a form to report damage: your name, email, severity, description.
- After sending the report the user should see that it worked.

The API is already there, `docs/api.md` describes it.

## Notes

- Please put your code in `src/features/`.
- Design system is in `src/ui/`, please use it.
- Route: `/reports` for the list, the detail view underneath it.

## Done when

Damage on an item is visible to everyone without an email going around.
