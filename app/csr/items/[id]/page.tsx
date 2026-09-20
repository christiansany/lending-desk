import { ItemDetail } from "@/src/features/items/ItemDetail";

export default async function CsrItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ItemDetail itemId={id} backHref="/csr" />;
}
