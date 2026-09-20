import { notFound } from "next/navigation";
import { getAvailability, getItem, getReservationCount } from "@/server/data";
import { ServerItemDetail } from "@/src/features/items/ServerItemDetail";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  const availability = await getAvailability(id);
  if (!availability) notFound();

  const reservations = await getReservationCount(id);
  if (!reservations) notFound();

  return (
    <ServerItemDetail
      item={item}
      availability={availability}
      reservationCount={reservations.count}
    />
  );
}
