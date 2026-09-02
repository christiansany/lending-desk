export const CATEGORIES = ["laptops", "cameras", "audio", "tools", "vr", "misc"] as const;
export const CONDITIONS = ["new", "good", "worn"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Condition = (typeof CONDITIONS)[number];

export interface Item {
  id: string;
  name: string;
  category: Category;
  description: string;
  serial: string;
  location: string;
  condition: Condition;
  dailyRate: number;
  ownerName: string;
  ownerEmail: string;
  reserved: boolean;
  takenUntil: string | null;
  mine: boolean;
}

export interface ItemList {
  items: Item[];
  total: number;
  page: number;
  limit: number;
}

export interface CurrentUser {
  name: string;
  email: string;
}

export interface Reservation {
  id: string;
  itemId: string;
  name: string;
  email: string;
  from: string;
  to: string;
  purpose: string;
  createdAt: string;
}

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && CATEGORIES.includes(value as Category);
}

function isCondition(value: unknown): value is Condition {
  return typeof value === "string" && CONDITIONS.includes(value as Condition);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isItem(value: unknown): value is Item {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    isString(item.id) &&
    isString(item.name) &&
    isCategory(item.category) &&
    isString(item.description) &&
    isString(item.serial) &&
    isString(item.location) &&
    isCondition(item.condition) &&
    typeof item.dailyRate === "number" &&
    isString(item.ownerName) &&
    isString(item.ownerEmail) &&
    typeof item.reserved === "boolean" &&
    (item.takenUntil === null || isString(item.takenUntil)) &&
    typeof item.mine === "boolean"
  );
}

export function isItemList(value: unknown): value is ItemList {
  if (typeof value !== "object" || value === null) return false;
  const list = value as Record<string, unknown>;
  return (
    Array.isArray(list.items) &&
    list.items.every(isItem) &&
    typeof list.total === "number" &&
    typeof list.page === "number" &&
    typeof list.limit === "number"
  );
}

export function isItemResponse(value: unknown): value is Item {
  return isItem(value);
}

export function isCurrentUser(value: unknown): value is CurrentUser {
  if (typeof value !== "object" || value === null) return false;
  const user = value as Record<string, unknown>;
  return isString(user.name) && isString(user.email);
}

export function isReservation(value: unknown): value is Reservation {
  if (typeof value !== "object" || value === null) return false;
  const reservation = value as Record<string, unknown>;
  return (
    isString(reservation.id) &&
    isString(reservation.itemId) &&
    isString(reservation.name) &&
    isString(reservation.email) &&
    isString(reservation.from) &&
    isString(reservation.to) &&
    isString(reservation.purpose) &&
    isString(reservation.createdAt)
  );
}
