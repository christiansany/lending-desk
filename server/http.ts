import { planChaos, type Endpoint } from "./chaos";
import { baseLatencyMs, sleep } from "./latency";
import { PROBLEM_CONTENT_TYPE, internalError, type Problem } from "./problem";
import { logRequest, newRequestId } from "./request-id";
import { getStore } from "./store";

export interface ApiResult {
  status?: number;
  body: unknown;
  headers?: Record<string, string>;
  contentType?: string;
}

/** Thrown by the route handlers; turned into an RFC 9457 response here. */
export class ProblemError extends Error {
  constructor(readonly problem: Problem) {
    super(problem.title);
    this.name = "ProblemError";
  }
}

export function fail(problem: Problem): never {
  throw new ProblemError(problem);
}

function listParams(url: URL): { page: number; limit: number } {
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "12");
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 12,
  };
}

/**
 * The one place where latency, chaos, request id and logging live. Every
 * route handler goes through it, so no response can be missing an
 * x-request-id and no endpoint can forget the chaos switches.
 */
export async function handleRequest(
  endpoint: Endpoint,
  request: Request,
  run: () => ApiResult | Promise<ApiResult>,
): Promise<Response> {
  const started = Date.now();
  const requestId = newRequestId();
  const url = new URL(request.url);
  const store = getStore();
  store.requestCount += 1;

  const respond = (result: ApiResult): Response => {
    const status = result.status ?? 200;
    const headers = new Headers(result.headers);
    headers.set("x-request-id", requestId);
    headers.set("content-type", result.contentType ?? "application/json");
    headers.set("cache-control", "no-store");
    logRequest({
      requestId,
      method: request.method,
      path: url.pathname + url.search,
      status,
      durationMs: Date.now() - started,
    });
    const body = typeof result.body === "string" ? result.body : JSON.stringify(result.body);
    return new Response(status === 204 ? null : body, { status, headers });
  };

  const plan = planChaos({
    switches: store.chaos,
    endpoint,
    method: request.method,
    requestCount: store.requestCount,
    list: listParams(url),
  });

  await sleep(baseLatencyMs() + plan.extraDelayMs);

  if (plan.hang) {
    // Never resolves. The client has to bring its own timeout.
    await new Promise(() => {});
  }

  if (plan.response) {
    return respond({
      status: plan.response.status,
      body: plan.response.text ?? plan.response.body,
      contentType: plan.response.contentType,
      headers: plan.response.headers,
    });
  }

  try {
    return respond(await run());
  } catch (error) {
    const problem =
      error instanceof ProblemError
        ? error.problem
        : internalError(error instanceof Error ? error.message : "Unknown error");
    return respond({
      status: problem.status,
      body: { ...problem, requestId },
      contentType: PROBLEM_CONTENT_TYPE,
    });
  }
}
