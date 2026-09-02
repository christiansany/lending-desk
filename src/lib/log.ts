"use client";

type LogLevel = "debug" | "info" | "warn" | "error";
type LogValue = string | number | boolean | undefined;

interface LogContext {
  event: string;
  route: string;
  action: string;
  outcome: string;
  httpStatus?: number;
  requestId?: string;
  durationMs?: number;
  retryCount?: number;
}

/** Sends allowlisted operational events without affecting product behavior. */
export function log(level: LogLevel, message: string, context: LogContext): void {
  const safeContext = Object.fromEntries(
    Object.entries(context).filter((entry): entry is [string, LogValue] => entry[1] !== undefined),
  );

  void fetch("/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level, message, context: safeContext }),
  }).catch(() => undefined);
}
