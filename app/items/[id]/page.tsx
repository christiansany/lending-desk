import { notFound } from "next/navigation";
import { getItem } from "@/server/data";
import { ServerItemStarter } from "@/src/features/items/ServerItemStarter";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();
  return <ServerItemStarter item={item} />;
}
