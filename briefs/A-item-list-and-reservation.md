# LD-142 · Item list and reservation

**Reporter:** Anna Frei (Facility Services) · **Priority:** high · **Sprint:** current

Colleagues currently phone the desk to ask whether a camera is free. That should be
self-service.

## What we need

A page where you can find equipment and reserve it.

- A list of all items with name, category and location.
- A search field over the item name.
- A filter by category.
- Click on an item to get to its detail view with the full description.
- On the detail view a form to reserve the item: name, email, from, to, purpose.
- After sending the reservation the user should see that it worked.

The API is already there, `docs/api.md` describes it.

## Notes

- Please put your code in `src/features/`.
- Design system is in `src/ui/`, please use it.
- Route: `/items` for the list, the detail view underneath it.

## Done when

The desk staff can find an item and reserve it without calling anyone.
