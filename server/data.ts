import { matchItems, paginate, type ItemQuery } from "./items";
import { findItem, withStatus } from "./items";
import { searchLatencyMs, sleep } from "./latency";

export interface ItemSearchInput {
  q?: string;
  category?: string;
  status?: ItemQuery["status"];
  owner?: ItemQuery["owner"];
  page?: string;
}

export async function getItems(input: ItemSearchInput = {}) {
  const query: ItemQuery = {
    q: input.q?.trim() ?? "",
    category: input.category || null,
    status: input.status ?? "all",
    owner: input.owner ?? "all",
    page: positiveInteger(input.page, 1),
    limit: 12,
  };
  const matches = matchItems(query);
  await sleep(searchLatencyMs(matches.length));
  return paginate(matches, query);
}

export async function getItem(id: string) {
  await sleep(350);
  const item = findItem(id);
  return item ? withStatus(item) : null;
}

export async function getAvailability(id: string) {
  await sleep(650);
  const item = findItem(id);
  return item ? { reserved: withStatus(item).reserved } : null;
}

export async function getReservationCount(id: string) {
  await sleep(900);
  const item = findItem(id);
  return item ? { count: withStatus(item).reserved ? 1 : 0 } : null;
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
