export async function AvailabilityFact({
  result,
}: {
  result: Promise<{ reserved: boolean } | null>;
}) {
  const availability = await result;
  return availability?.reserved ? "Currently reserved" : "Available now";
}

export async function ReservationFact({ result }: { result: Promise<{ count: number } | null> }) {
  const reservations = await result;
  return reservations ? String(reservations.count) : "Unavailable";
}
