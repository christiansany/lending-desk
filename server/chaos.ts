/**
 * Error injection.
 *
 * `planChaos` is a pure function: switches + what the endpoint intended to do
 * -> what actually happens. The route handlers use it, and so does the test
 * suite. One mechanism, not two, so the suite cannot drift away from the API.
 */

export const CHAOS_SWITCHES = [
  "slow",
  "flaky",
  "error:items",
  "empty",
  "conflict",
  "ratelimit",
  "timeout",
  "garbage",
] as const;

export type ChaosSwitch = (typeof CHAOS_SWITCHES)[number];

export const CHAOS_LABELS: Record<ChaosSwitch, string> = {
  slow: "Slow (+3 s on everything)",
  flaky: "Flaky (every 3rd request 503)",
  "error:items": "Items endpoint returns 500",
  empty: "Item list is empty",
  conflict: "Reservation always 409",
  ratelimit: "429 with Retry-After: 5",
  timeout: "Response never completes",
  garbage: "JSON header, HTML body",
};

export type Endpoint = "items" | "item" | "availability" | "reservations" | "logs" | "chaos" | "me";

export interface ChaosInput {
  switches: readonly ChaosSwitch[];
  endpoint: Endpoint;
  method: string;
  /** Running request counter. `flaky` fails every third request. */
  requestCount: number;
  /** Pagination the endpoint would have answered with — used by `empty`. */
  list?: { page: number; limit: number };
}

export interface ChaosResponse {
  status: number;
  /** Serialised as JSON unless `text` is set. */
  body?: unknown;
  text?: string;
  contentType: string;
  headers?: Record<string, string>;
}

export interface ChaosPlan {
  /** Added on top of the normal latency. */
  extraDelayMs: number;
  /** The response never completes. */
  hang: boolean;
  /** Set when chaos replaces the real response. */
  response: ChaosResponse | null;
}

const ITEM_ENDPOINTS: Endpoint[] = ["items", "item", "availability"];

export function isChaosSwitch(value: unknown): value is ChaosSwitch {
  return typeof value === "string" && (CHAOS_SWITCHES as readonly string[]).includes(value);
}

export function parseSwitches(value: unknown): ChaosSwitch[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isChaosSwitch);
}

export function planChaos(input: ChaosInput): ChaosPlan {
  const on = (s: ChaosSwitch) => input.switches.includes(s);
  const plan: ChaosPlan = { extraDelayMs: 0, hang: false, response: null };

  // The chaos endpoint itself is never sabotaged — otherwise you could not
  // switch chaos off again.
  if (input.endpoint === "chaos") return plan;

  if (on("slow")) plan.extraDelayMs += 3000;

  if (on("timeout")) {
    plan.hang = true;
    return plan;
  }

  if (on("garbage")) {
    plan.response = {
      status: 200,
      text: "<!doctype html><html><body><h1>502 Bad Gateway</h1><p>nginx</p></body></html>",
      contentType: "application/json",
    };
    return plan;
  }

  if (on("flaky") && input.requestCount % 3 === 0) {
    plan.response = {
      status: 503,
      body: {
        type: "https://lending-desk.local/problems/unavailable",
        title: "Service temporarily unavailable",
        status: 503,
        detail: "Upstream is having a moment. Try again.",
      },
      contentType: "application/problem+json",
    };
    return plan;
  }

  if (on("ratelimit")) {
    plan.response = {
      status: 429,
      body: {
        type: "https://lending-desk.local/problems/rate-limit",
        title: "Too many requests",
        status: 429,
        detail: "Slow down.",
      },
      contentType: "application/problem+json",
      headers: { "Retry-After": "5" },
    };
    return plan;
  }

  if (on("error:items") && ITEM_ENDPOINTS.includes(input.endpoint)) {
    plan.response = {
      status: 500,
      body: {
        type: "https://lending-desk.local/problems/internal",
        title: "Internal server error",
        status: 500,
        detail: "Something went wrong on our side.",
      },
      contentType: "application/problem+json",
    };
    return plan;
  }

  if (on("empty") && input.endpoint === "items" && input.method === "GET") {
    plan.response = {
      status: 200,
      body: { items: [], total: 0, page: input.list?.page ?? 1, limit: input.list?.limit ?? 12 },
      contentType: "application/json",
    };
    return plan;
  }

  if (on("conflict") && input.endpoint === "reservations" && input.method === "POST") {
    const takenUntil = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
    plan.response = {
      status: 409,
      body: {
        type: "https://lending-desk.local/problems/conflict",
        title: "Period already taken",
        status: 409,
        detail: "Someone else was faster.",
        takenUntil,
      },
      contentType: "application/problem+json",
    };
    return plan;
  }

  return plan;
}
