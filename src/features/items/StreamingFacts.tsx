export async function AvailabilityFact({
  result,
}: {
  result: Promise<{ reserved: boolean } | null>;
}) {
  const availability = await result;
  return (
    <span data-stream-marker="availability">
      {availability?.reserved ? "Currently reserved" : "Available now"}
    </span>
  );
}

export async function ReservationFact({ result }: { result: Promise<{ count: number } | null> }) {
  const reservations = await result;
  return (
    <span data-stream-marker="reservations">
      {reservations ? String(reservations.count) : "Unavailable"}
    </span>
  );
}
