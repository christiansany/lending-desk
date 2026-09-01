import { beforeEach, describe, expect, test } from "vitest";
import { CHAOS_SWITCHES, planChaos } from "@/server/chaos";
import { GET as listItems } from "@/app/api/items/route";
import { GET as getItem } from "@/app/api/items/[id]/route";
import { POST as createReservation } from "@/app/api/reservations/route";
import { GET as readChaos, POST as writeChaos } from "@/app/api/dev/chaos/route";
import { day, fresh, get, json, params, post, setChaos } from "./helpers";
import { getStore } from "@/server/store";

const validReservation = {
  itemId: "item-002",
  name: "Rahel Bosshard",
  email: "rahel.bosshard@example.com",
  from: day(3),
  to: day(6),
  purpose: "Field recording for the documentary module",
};

describe("planChaos — the pure function behind panel and tests", () => {
  const base = { switches: [], endpoint: "items", method: "GET", requestCount: 1 } as const;

  test("no switches means no interference", () => {
    expect(planChaos(base)).toEqual({ extraDelayMs: 0, hang: false, response: null });
  });

  test("slow adds three seconds", () => {
    expect(planChaos({ ...base, switches: ["slow"] }).extraDelayMs).toBe(3000);
  });

  test("flaky fails every third request", () => {
    const statuses = [1, 2, 3, 4, 5, 6].map(
      (requestCount) =>
        planChaos({ ...base, switches: ["flaky"], requestCount }).response?.status ?? 200,
    );
    expect(statuses).toEqual([200, 200, 503, 200, 200, 503]);
  });

  test("timeout never resolves and outranks everything else", () => {
    const plan = planChaos({ ...base, switches: ["timeout", "garbage", "ratelimit"] });
    expect(plan.hang).toBe(true);
    expect(plan.response).toBeNull();
  });

  test("error:items only hits the item endpoints", () => {
    expect(planChaos({ ...base, switches: ["error:items"] }).response?.status).toBe(500);
    expect(
      planChaos({ ...base, switches: ["error:items"], endpoint: "availability" }).response?.status,
    ).toBe(500);
    expect(
      planChaos({ ...base, switches: ["error:items"], endpoint: "reservations" }).response,
    ).toBeNull();
  });

  test("the chaos endpoint itself is never sabotaged", () => {
    for (const chaosSwitch of CHAOS_SWITCHES) {
      const plan = planChaos({ ...base, switches: [chaosSwitch], endpoint: "chaos" });
      expect(plan).toEqual({ extraDelayMs: 0, hang: false, response: null });
    }
  });
});

describe("the chaos switches through the API", () => {
  beforeEach(fresh);

  test("error:items turns the list into a 500 but leaves reservations alone", async () => {
    setChaos("error:items");
    const list = await listItems(get("/api/items"));
    expect(list.status).toBe(500);
    expect(list.headers.get("x-request-id")).toBeTruthy();

    const detail = await getItem(get("/api/items/item-001"), params("item-001"));
    expect(detail.status).toBe(500);

    const reservation = await createReservation(post("/api/reservations", validReservation));
    expect(reservation.status).toBe(201);
  });

  test("empty gives a 200 with nothing in it — no error to show", async () => {
    setChaos("empty");
    const res = await listItems(get("/api/items?page=2&limit=6"));
    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ items: [], total: 0, page: 2, limit: 6 });
  });

  test("conflict makes every reservation a 409, free item or not", async () => {
    setChaos("conflict");
    const res = await createReservation(post("/api/reservations", validReservation));
    expect(res.status).toBe(409);
    expect((await json(res)).takenUntil).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("ratelimit answers 429 with Retry-After", async () => {
    setChaos("ratelimit");
    const res = await listItems(get("/api/items"));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("5");
  });

  test("garbage sends HTML with a JSON content type", async () => {
    setChaos("garbage");
    const res = await listItems(get("/api/items"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/json");
    const text = await res.text();
    expect(text).toContain("<html>");
    await expect(new Response(text).json()).rejects.toThrow();
  });

  test("flaky fails every third request", async () => {
    setChaos("flaky");
    const statuses: number[] = [];
    for (let i = 0; i < 6; i += 1) statuses.push((await listItems(get("/api/items"))).status);
    expect(statuses).toEqual([200, 200, 503, 200, 200, 503]);
  });

  test("timeout never answers", async () => {
    setChaos("timeout");
    const pending = listItems(get("/api/items"));
    const race = await Promise.race([
      pending.then(() => "answered"),
      new Promise((resolve) => setTimeout(() => resolve("still waiting"), 50)),
    ]);
    expect(race).toBe("still waiting");
  });
});

describe("/api/dev/chaos", () => {
  beforeEach(fresh);

  test("GET lists the active and the available switches", async () => {
    const body = await json(await readChaos(get("/api/dev/chaos")));
    expect(body.switches).toEqual([]);
    expect(body.available.map((o: { value: string }) => o.value)).toEqual([...CHAOS_SWITCHES]);
  });

  test("POST sets the switches and they take effect immediately", async () => {
    const res = await writeChaos(post("/api/dev/chaos", { switches: ["empty", "conflict"] }));
    expect(await json(res).then((b) => b.switches)).toEqual(["empty", "conflict"]);
    expect((await json(await listItems(get("/api/items")))).total).toBe(0);
  });

  test("an unknown switch is a 400", async () => {
    const res = await writeChaos(post("/api/dev/chaos", { switches: ["explode"] }));
    expect(res.status).toBe(400);
    expect((await json(res)).detail).toContain("explode");
  });

  test("switches is required", async () => {
    expect((await writeChaos(post("/api/dev/chaos", { nope: true }))).status).toBe(400);
  });

  test("reset brings the data back but keeps the switches", async () => {
    setChaos("conflict");
    await createReservation(post("/api/reservations", { ...validReservation, itemId: "item-002" }));
    getStore().chaos = ["conflict"];
    const res = await writeChaos(post("/api/dev/chaos", { reset: true }));
    const body = await json(res);
    expect(body.reset).toBe(true);
    expect(body.switches).toEqual(["conflict"]);
    expect(getStore().reservations).toHaveLength(3);
    expect(getStore().items).toHaveLength(47);
  });
});
