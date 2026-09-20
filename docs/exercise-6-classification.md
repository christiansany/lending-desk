# Exercise 6: choose a rendering strategy per route

Predict first. Then run `npm run build`, inspect the route table, and correct the
last column with evidence from the route's data and user needs.

| Route | User need | Prediction | Build symbol | Decision and reason |
| --- | --- | --- | --- | --- |
| `/imprint` | stable public information | | | |
| `/` | filterable shared catalogue | | | |
| `/items/[id]` | item plus live availability | | | |
| `/reservations` | current user's data | | | |
| `/csr` | explicit client-rendered comparison | | | |

The build symbol describes what Next.js produced, not whether the choice is good.
Your decision must name the wait or constraint it addresses.
