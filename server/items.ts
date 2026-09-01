import { badRequest } from "./problem";
import { fail } from "./http";
import { getStore, nextId } from "./store";
import { CATEGORIES, CURRENT_USER } from "./fixtures";
import { today } from "./dates";
import type { Item, ItemWithStatus } from "./types";

export type StatusFilter = "all" | "free" | "reserved";
export type OwnerFilter = "all" | "me" | "others";

export interface ItemQuery {
  q: string;
  category: string | null;
  status: StatusFilter;
  owner: OwnerFilter;
  page: number;
  limit: number;
}

const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as string[];
const CONDITIONS: Item["condition"][] = ["new", "good", "worn"];
const STATUS_VALUES: StatusFilter[] = ["all", "free", "reserved"];
const OWNER_VALUES: OwnerFilter[] = ["all", "me", "others"];

/** Rejects malformed query parameters with a 400 — not every error has a field. */
export function parseItemQuery(url: URL): ItemQuery {
  const rawPage = url.searchParams.get("page");
  const rawLimit = url.searchParams.get("limit");
  const category = url.searchParams.get("category");
  const rawStatus = url.searchParams.get("status");
  const rawOwner = url.searchParams.get("owner");

  const page = rawPage === null ? 1 : Number(rawPage);
  const limit = rawLimit === null ? 12 : Number(rawLimit);

  if (!Number.isInteger(page) || page < 1)
    fail(badRequest(`'page' must be a positive integer, got '${rawPage}'`));
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    fail(badRequest(`'limit' must be an integer between 1 and 50, got '${rawLimit}'`));
  }
  if (category !== null && category !== "" && !CATEGORY_VALUES.includes(category)) {
    fail(badRequest(`unknown category '${category}'`));
  }
  if (
    rawStatus !== null &&
    rawStatus !== "" &&
    !STATUS_VALUES.includes(rawStatus as StatusFilter)
  ) {
    fail(badRequest(`'status' must be one of ${STATUS_VALUES.join(", ")}, got '${rawStatus}'`));
  }
  if (rawOwner !== null && rawOwner !== "" && !OWNER_VALUES.includes(rawOwner as OwnerFilter)) {
    fail(badRequest(`'owner' must be one of ${OWNER_VALUES.join(", ")}, got '${rawOwner}'`));
  }

  return {
    q: (url.searchParams.get("q") ?? "").trim(),
    category: category || null,
    status: (rawStatus || "all") as StatusFilter,
    owner: (rawOwner || "all") as OwnerFilter,
    page,
    limit,
  };
}

/**
 * The reservation that blocks an item right now or still lies ahead. Past
 * reservations do not make an item reserved.
 */
export function blockingReservation(itemId: string) {
  const now = today();
  return getStore()
    .reservations.filter((r) => r.itemId === itemId && r.to >= now)
    .sort((a, b) => a.from.localeCompare(b.from))[0];
}

export function withStatus(item: Item): ItemWithStatus {
  const blocking = blockingReservation(item.id);
  return {
    ...item,
    reserved: blocking !== undefined,
    takenUntil: blocking?.to ?? null,
    mine: item.ownerEmail === CURRENT_USER.email,
  };
}

/**
 * Fuzzy match. A hit is either a substring anywhere (name, description,
 * serial, owner) or the letters of the query in order in the name — so
 * `mcbk` finds `MacBook Pro 14"`. Higher score sorts first.
 */
export function fuzzyScore(item: Item, needle: string): number {
  const name = item.name.toLowerCase();
  if (name.startsWith(needle)) return 100 - name.length / 100;
  if (name.includes(needle)) return 80 - name.length / 100;
  if (item.serial.toLowerCase().includes(needle)) return 70;
  if (item.description.toLowerCase().includes(needle)) return 60;
  if (item.ownerName.toLowerCase().includes(needle)) return 50;
  return subsequenceScore(name, needle);
}

/** 0 when the letters do not appear in order; higher the tighter they sit. */
function subsequenceScore(haystack: string, needle: string): number {
  let index = 0;
  let gaps = 0;
  let last = -1;
  for (const char of needle) {
    const found = haystack.indexOf(char, index);
    if (found === -1) return 0;
    if (last !== -1) gaps += found - last - 1;
    last = found;
    index = found + 1;
  }
  return Math.max(1, 40 - gaps);
}

export function matchItems(query: ItemQuery): ItemWithStatus[] {
  const needle = query.q.toLowerCase();
  const scored = getStore()
    .items.map(withStatus)
    .filter((item) => {
      if (query.category && item.category !== query.category) return false;
      if (query.status === "free" && item.reserved) return false;
      if (query.status === "reserved" && !item.reserved) return false;
      if (query.owner === "me" && !item.mine) return false;
      if (query.owner === "others" && item.mine) return false;
      return true;
    })
    .map((item) => ({ item, score: needle ? fuzzyScore(item, needle) : 0 }))
    .filter(({ score }) => !needle || score > 0);

  if (needle) scored.sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
  return scored.map(({ item }) => item);
}

export interface ItemPage {
  items: ItemWithStatus[];
  total: number;
  page: number;
  limit: number;
}

export function paginate(matches: ItemWithStatus[], query: ItemQuery): ItemPage {
  const start = (query.page - 1) * query.limit;
  return {
    items: matches.slice(start, start + query.limit),
    total: matches.length,
    page: query.page,
    limit: query.limit,
  };
}

export function findItem(id: string): Item | undefined {
  return getStore().items.find((item) => item.id === id);
}

export interface ItemInput {
  name: unknown;
  category: unknown;
  description: unknown;
  location: unknown;
  condition: unknown;
  dailyRate: unknown;
}

/** Returns a field -> message map. Empty means valid. */
export function validateItem(input: ItemInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (typeof input.name !== "string" || input.name.trim().length < 2) {
    errors.name = "Please give the item a name";
  }
  if (typeof input.category !== "string" || !CATEGORY_VALUES.includes(input.category)) {
    errors.category = "Please pick a category";
  }
  if (typeof input.description !== "string" || input.description.trim().length < 10) {
    errors.description = "Describe the item in at least 10 characters";
  }
  if (typeof input.location !== "string" || input.location.trim().length < 2) {
    errors.location = "Where can it be picked up?";
  }
  if (
    typeof input.condition !== "string" ||
    !CONDITIONS.includes(input.condition as Item["condition"])
  ) {
    errors.condition = "Please pick a condition";
  }
  if (
    typeof input.dailyRate !== "number" ||
    !Number.isFinite(input.dailyRate) ||
    input.dailyRate < 0
  ) {
    errors.dailyRate = "A daily rate of 0 or more, in CHF";
  }

  return errors;
}

/** The owner is the current user — it is not taken from the request body. */
export function createItem(input: {
  name: string;
  category: Item["category"];
  description: string;
  location: string;
  condition: Item["condition"];
  dailyRate: number;
}): ItemWithStatus {
  const store = getStore();
  const item: Item = {
    id: nextId("item"),
    name: input.name.trim(),
    category: input.category,
    description: input.description.trim(),
    serial: `LD-${String(2000 + store.items.length).padStart(4, "0")}`,
    location: input.location.trim(),
    condition: input.condition,
    dailyRate: input.dailyRate,
    ownerName: CURRENT_USER.name,
    ownerEmail: CURRENT_USER.email,
  };
  store.items.push(item);
  return withStatus(item);
}
