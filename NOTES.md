# Notes

- On the items list, when the filter triggers a new API request, and the request returns an error, the error message is displayed above the existing list instead of replacing the list (list is stale)
- Error handling in the list in general is not that great. Needs to be improved.
- forms are completely inaccessible
  - form errors are only shown when submitting the form and they're in an alert, instead of inline with the field
- the offer form is under the list and this is confusing
- every change in the search input of the list triggers a new API request, even when typing really fast.
- after offering an item, we simply get the message that the item is offered, we don't see the item in the list and we don't get a link to it's detail page.
- the empty state simply sais that there is no data.
