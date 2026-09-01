export type Category = "laptops" | "cameras" | "audio" | "tools" | "vr" | "misc";

export interface Item {
  id: string;
  name: string;
  category: Category;
  description: string;
  serial: string;
  location: string;
  condition: "new" | "good" | "worn";
  dailyRate: number;
  ownerName: string;
  ownerEmail: string;
}

/** An item plus the reservation state the list and the detail view show. */
export interface ItemWithStatus extends Item {
  /** True while a reservation is running or still ahead. */
  reserved: boolean;
  /** Last day of the blocking reservation, or null when the item is free. */
  takenUntil: string | null;
  /** True when `ownerEmail` is the current user. */
  mine: boolean;
}

export interface Reservation {
  id: string;
  itemId: string;
  name: string;
  email: string;
  /** ISO date, YYYY-MM-DD */
  from: string;
  /** ISO date, YYYY-MM-DD */
  to: string;
  purpose: string;
  createdAt: string;
}
