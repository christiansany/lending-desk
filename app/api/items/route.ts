import { readJson } from "@/server/body";
import { fail, handleRequest } from "@/server/http";
import {
  createItem,
  matchItems,
  paginate,
  parseItemQuery,
  validateItem,
  type ItemInput,
} from "@/server/items";
import { searchLatencyMs, sleep } from "@/server/latency";
import { validationFailed } from "@/server/problem";
import type { Item } from "@/server/types";

export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return handleRequest("items", request, async () => {
    const query = parseItemQuery(new URL(request.url));
    const matches = matchItems(query);
    // The more hits, the slower — see server/latency.ts.
    await sleep(searchLatencyMs(matches.length));
    return { body: paginate(matches, query) };
  });
}

export function POST(request: Request): Promise<Response> {
  return handleRequest("items", request, async () => {
    const input = (await readJson(request)) as unknown as ItemInput;
    const errors = validateItem(input);
    if (Object.keys(errors).length > 0) fail(validationFailed(errors));

    return {
      status: 201,
      body: createItem(
        input as {
          name: string;
          category: Item["category"];
          description: string;
          location: string;
          condition: Item["condition"];
          dailyRate: number;
        },
      ),
    };
  });
}
