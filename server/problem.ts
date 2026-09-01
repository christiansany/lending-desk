/**
 * Error responses per RFC 9457 (application/problem+json).
 * Every problem carries the `requestId`, so a screenshot from a student is
 * enough to find the request in the server log.
 */
export interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: string;
  requestId?: string;
  /** Field name -> message. Only on 422. */
  errors?: Record<string, string>;
  /** Only on 409. ISO date until which the item is taken. */
  takenUntil?: string;
}

const BASE = "https://lending-desk.local/problems";

export const PROBLEM_TYPES = {
  badRequest: `${BASE}/bad-request`,
  notFound: `${BASE}/not-found`,
  conflict: `${BASE}/conflict`,
  validation: `${BASE}/validation`,
  rateLimit: `${BASE}/rate-limit`,
  internal: `${BASE}/internal`,
} as const;

export function problem(init: Problem): Problem {
  return init;
}

export function badRequest(detail: string): Problem {
  return { type: PROBLEM_TYPES.badRequest, title: "Bad request", status: 400, detail };
}

export function notFound(detail: string): Problem {
  return { type: PROBLEM_TYPES.notFound, title: "Not found", status: 404, detail };
}

export function conflict(detail: string, takenUntil: string): Problem {
  return {
    type: PROBLEM_TYPES.conflict,
    title: "Period already taken",
    status: 409,
    detail,
    takenUntil,
  };
}

export function validationFailed(errors: Record<string, string>): Problem {
  return { type: PROBLEM_TYPES.validation, title: "Validation failed", status: 422, errors };
}

export function rateLimited(): Problem {
  return {
    type: PROBLEM_TYPES.rateLimit,
    title: "Too many requests",
    status: 429,
    detail: "Slow down.",
  };
}

export function internalError(detail = "Something went wrong on our side."): Problem {
  return { type: PROBLEM_TYPES.internal, title: "Internal server error", status: 500, detail };
}

export const PROBLEM_CONTENT_TYPE = "application/problem+json";
