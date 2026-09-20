import { getItems } from "@/server/data";
import { ServerItemsPage, type ServerItemFilters } from "@/src/features/items/ServerItemsPage";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const input = await searchParams;
  const filters: ServerItemFilters = {
    q: scalar(input.q),
    category: scalar(input.category),
    status: oneOf(scalar(input.status), ["free", "reserved"], "all"),
    owner: oneOf(scalar(input.owner), ["me", "others"], "all"),
    page: positiveInteger(scalar(input.page)),
  };
  const data = await getItems({ ...filters, page: String(filters.page) });
  return <ServerItemsPage data={data} filters={filters} renderedAt={new Date().toISOString()} />;
}

function scalar(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function oneOf<Value extends string, Fallback extends string>(
  value: string,
  allowed: readonly Value[],
  fallback: Fallback,
): Value | Fallback {
  return allowed.includes(value as Value) ? (value as Value) : fallback;
}

function positiveInteger(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}
