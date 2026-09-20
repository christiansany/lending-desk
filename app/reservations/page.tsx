import { cookies } from "next/headers";
import Link from "next/link";
import { CURRENT_USER } from "@/server/fixtures";
import { getStore } from "@/server/store";

export default async function ReservationsPage() {
  await cookies();
  const reservations = getStore().reservations.filter(
    (reservation) => reservation.email === CURRENT_USER.email,
  );

  return (
    <section>
      <h1>Your reservations</h1>
      <p>
        This workshop route reads request state and uses the seeded current user to simulate a
        per-user response.
      </p>
      {reservations.length === 0 ? (
        <p>You have no reservations.</p>
      ) : (
        <ul>
          {reservations.map((reservation) => (
            <li key={reservation.id}>
              <Link href={`/items/${reservation.itemId}`}>{reservation.itemId}</Link>, from{" "}
              {reservation.from} to {reservation.to}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
