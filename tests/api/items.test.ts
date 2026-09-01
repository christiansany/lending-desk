import { beforeEach, describe, expect, test } from "vitest";
import { GET as listItems } from "@/app/api/items/route";
import { GET as getItem } from "@/app/api/items/[id]/route";
import { fresh, get, json, params } from "./helpers";

describe("GET /api/items", () => {
  beforeEach(fresh);

  test("returns the first page with 12 of 47 items", async () => {
    const res = await listItems(get("/api/items"));
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.items).toHaveLength(12);
    expect(body).toMatchObject({ total: 47, page: 1, limit: 12 });
  });

  test("every response carries an x-request-id", async () => {
    const res = await listItems(get("/api/items"));
    expect(res.headers.get("x-request-id")).toMatch(/^[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{8}$/);
  });

  test("the last page is short", async () => {
    const body = await json(await listItems(get("/api/items?page=4")));
    expect(body.items).toHaveLength(47 - 3 * 12);
    expect(body.page).toBe(4);
  });

  test("a page beyond the end is empty, not an error", async () => {
    const res = await listItems(get("/api/items?page=99"));
    expect(res.status).toBe(200);
    expect((await json(res)).items).toEqual([]);
  });

  test("search matches name, description and serial", async () => {
    const byName = await json(await listItems(get("/api/items?q=ThinkPad")));
    expect(byName.total).toBe(2);

    const byDescription = await json(await listItems(get("/api/items?q=gimbal")));
    expect(byDescription.total).toBe(1);

    const bySerial = await json(await listItems(get("/api/items?q=LD-1000")));
    expect(bySerial.items[0].id).toBe("item-001");
  });

  test("search is case insensitive", async () => {
    const lower = await json(await listItems(get("/api/items?q=thinkpad")));
    const upper = await json(await listItems(get("/api/items?q=THINKPAD")));
    expect(lower.total).toBe(upper.total);
  });

  test("a search without hits is a 200 with an empty list", async () => {
    const res = await listItems(get("/api/items?q=zzzzz"));
    expect(res.status).toBe(200);
    expect(await json(res)).toMatchObject({ items: [], total: 0 });
  });

  test("the category filter narrows the result", async () => {
    const body = await json(await listItems(get("/api/items?category=vr")));
    expect(body.total).toBe(6);
    expect(body.items.every((i: { category: string }) => i.category === "vr")).toBe(true);
  });

  test("search and category combine", async () => {
    const body = await json(await listItems(get("/api/items?q=quest&category=vr")));
    expect(body.total).toBe(2);
  });

  test.each([
    ["page=abc", "page"],
    ["page=0", "page"],
    ["page=-1", "page"],
    ["limit=0", "limit"],
    ["limit=500", "limit"],
    ["category=spaceships", "category"],
  ])("%s is a 400 — not every error has a field", async (query, mentioned) => {
    const res = await listItems(get(`/api/items?${query}`));
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toBe("application/problem+json");
    const body = await json(res);
    expect(body).toMatchObject({ status: 400, title: "Bad request" });
    expect(body.detail).toContain(mentioned);
    expect(body.requestId).toBe(res.headers.get("x-request-id"));
    expect(body.errors).toBeUndefined();
  });
});

describe("GET /api/items/:id", () => {
  beforeEach(fresh);

  test("returns a single item", async () => {
    const res = await getItem(get("/api/items/item-001"), params("item-001"));
    expect(res.status).toBe(200);
    expect(await json(res)).toMatchObject({ id: "item-001", category: "laptops" });
  });

  test("an unknown id is a 404 with a request id", async () => {
    const res = await getItem(get("/api/items/does-not-exist"), params("does-not-exist"));
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toBe("application/problem+json");
    const body = await json(res);
    expect(body).toMatchObject({ status: 404, title: "Not found" });
    expect(body.requestId).toBe(res.headers.get("x-request-id"));
  });
});
