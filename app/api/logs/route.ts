import { readJson } from "@/server/body";
import { fail, handleRequest } from "@/server/http";
import { badRequest } from "@/server/problem";

export const dynamic = "force-dynamic";

const LEVELS = ["debug", "info", "warn", "error"] as const;
type Level = (typeof LEVELS)[number];

const COLOUR: Record<Level, string> = {
  debug: "\x1b[90m",
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";

/**
 * The client log sink. Everything that arrives here is printed to the server
 * terminal in colour — that is the point: your client error shows up where
 * you can actually see it.
 */
export function POST(request: Request): Promise<Response> {
  return handleRequest("logs", request, async () => {
    const body = await readJson(request);
    const level = body.level;
    if (typeof level !== "string" || !(LEVELS as readonly string[]).includes(level)) {
      fail(badRequest(`'level' must be one of ${LEVELS.join(", ")}`));
    }
    if (typeof body.message !== "string" || body.message.length === 0) {
      fail(badRequest("'message' is required"));
    }

    const entry = {
      level: level as Level,
      message: body.message,
      context: (body.context ?? {}) as Record<string, unknown>,
      receivedAt: new Date().toISOString(),
    };

    if (process.env.LENDING_DESK_QUIET !== "1") {
      const context =
        Object.keys(entry.context).length > 0 ? ` ${JSON.stringify(entry.context)}` : "";
      console.log(
        `${COLOUR[entry.level]}[client ${entry.level}]${RESET} ${entry.message}${DIM}${context}${RESET}`,
      );
    }

    return { status: 202, body: { accepted: true } };
  });
}
