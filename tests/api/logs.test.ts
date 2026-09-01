import { describe, expect, test } from "vitest";
import { POST as sendLog } from "@/app/api/logs/route";
import { json, post } from "./helpers";

describe("POST /api/logs", () => {
  test("accepts a structured entry", async () => {
    const res = await sendLog(
      post("/api/logs", {
        level: "error",
        message: "Reservation failed",
        context: { requestId: "8f3c-4a1b-9d2e0f77", itemId: "item-001" },
      }),
    );
    expect(res.status).toBe(202);
    expect(await json(res)).toEqual({ accepted: true });
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });

  test("context is optional", async () => {
    const res = await sendLog(post("/api/logs", { level: "info", message: "Page opened" }));
    expect(res.status).toBe(202);
  });

  test.each(["debug", "info", "warn", "error"])("level %s is accepted", async (level) => {
    expect((await sendLog(post("/api/logs", { level, message: "hello" }))).status).toBe(202);
  });

  test("an unknown level is a 400", async () => {
    const res = await sendLog(post("/api/logs", { level: "shout", message: "hello" }));
    expect(res.status).toBe(400);
    expect((await json(res)).detail).toContain("level");
  });

  test("a missing message is a 400", async () => {
    const res = await sendLog(post("/api/logs", { level: "info" }));
    expect(res.status).toBe(400);
    expect((await json(res)).detail).toContain("message");
  });
});
