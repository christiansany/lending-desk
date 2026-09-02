# SPEC: What the Lending Desk still needs

Two features are missing. The API for both is finished and documented in `docs/api.md`.

---

## 1. Browse and find an item

The list of items is the start page.

- Show the items with **pagination**. There are 47 of them and the API returns 12 per page.
- Four filters, all **combinable**:
  - free text search
  - reservation status: all / free / reserved
  - owner: all / mine / others
  - category
- Clicking an item opens its **detail view** with the full information.

## 2. The two forms

- **Reserve an item**, on the detail view. Who, when from, when to, what for.
- **Offer your own item**, on the list page. Name, category, description, location, condition, daily rate.

Both write to the API. The API validates and will reject invalid input.

---

## Boundaries

- Feature code goes in `src/features/`, routes under `app/`.
- Use the design system in `src/ui/`.
- **Do not change `app/api/` or `server/`.** The API is finished.
