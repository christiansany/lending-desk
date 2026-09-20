# UX baseline for the SSR and CSR workshop

The workshop starts from a deliberately client-rendered application, but it
should not start from an accidentally poor product. This audit records the UX
decisions that belong to the baseline before rendering strategy changes.

## Jobs the interface must support

1. Find suitable equipment quickly.
2. Judge availability, owner, collection location, and price before opening an
   item.
3. Reserve an item with confidence and recover from conflicts or outages.
4. Offer equipment without losing entered data after a validation or network
   failure.

## Baseline changes

- The page opens with a task-led heading and one primary action.
- Search and filters form one named region. Labels describe user concepts such
  as availability rather than implementation terms.
- Results have a real heading, a visible count, and a clear card affordance.
- Cards expose the attributes needed to decide whether opening the item is
  worthwhile, including collection location.
- Offer and reservation forms use native form submission. Enter works, controls
  have visible labels, and validation is summarized and linked to fields.
- Loading, refreshing, empty, validation, conflict, rate-limit, and temporary
  failure states remain distinct. Existing content and form values stay visible
  whenever recovery does not require replacing them.
- The application has a skip link, visible keyboard focus, descriptive metadata,
  and polite or assertive announcements for asynchronous state.
- The layout supports a narrow viewport without horizontal scrolling and keeps
  the reservation form available beside the item on wider screens.

## What remains deliberate

The list and detail routes still fetch their useful content after hydration.
That is the evidence exercise 1 needs. The workshop changes delivery strategy
in later branches without conflating that change with a visual redesign.

## Sources used for the review

- [WAI forms tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/)
- [GOV.UK pagination](https://design-system.service.gov.uk/components/pagination/)
- [GOV.UK notification banner](https://design-system.service.gov.uk/components/notification-banner/)
