import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAvailability, getItem, getReservationCount } from "@/server/data";
import { ServerItemDetail } from "@/src/features/items/ServerItemDetail";
import { AvailabilityFact, ReservationFact } from "@/src/features/items/StreamingFacts";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itemPromise = getItem(id);
  const availabilityPromise = getAvailability(id);
  const reservationsPromise = getReservationCount(id);

  const item = await itemPromise;
  if (!item) notFound();

  return (
    <ServerItemDetail
      item={item}
      availability={
        <Suspense fallback="Checking…">
          <AvailabilityFact result={availabilityPromise} />
        </Suspense>
      }
      reservations={
        <Suspense fallback="Counting…">
          <ReservationFact result={reservationsPromise} />
        </Suspense>
      }
    />
  );
}
