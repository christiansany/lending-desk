"use client";

import { useCallback, useEffect, useState } from "react";

const REQUEST_TIMEOUT_MS = 10_000;

export type RequestFailureKind = "http" | "network" | "timeout" | "malformed";

export class RequestError extends Error {
  constructor(
    public readonly kind: RequestFailureKind,
    public readonly status?: number,
    public readonly fields?: Record<string, string>,
    public readonly requestId?: string,
    public readonly takenUntil?: string,
    public readonly retryAfter?: number,
  ) {
    super("Request failed");
  }
}

type UnknownRecord = Record<string, unknown>;
type DataGuard<T> = (value: unknown) => value is T;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function fieldErrors(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) return undefined;

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

async function responseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    throw new RequestError("malformed", response.status, undefined, response.headers.get("x-request-id") ?? undefined);
  }
}

async function readJson<T>(response: Response, guard: DataGuard<T>): Promise<T> {
  const body = await responseBody(response);
  const problem = isRecord(body) ? body : undefined;
  const requestId =
    stringValue(problem?.requestId) ?? response.headers.get("x-request-id") ?? undefined;
  const retryAfterValue = response.headers.get("Retry-After");
  const retryAfter =
    retryAfterValue && Number.isFinite(Number(retryAfterValue)) ? Number(retryAfterValue) : undefined;

  if (!response.ok) {
    throw new RequestError(
      "http",
      response.status,
      fieldErrors(problem?.errors),
      requestId,
      stringValue(problem?.takenUntil),
      retryAfter,
    );
  }

  if (!guard(body)) {
    throw new RequestError("malformed", response.status, undefined, requestId);
  }

  return body;
}

async function fetchJson<T>(
  url: string,
  guard: DataGuard<T>,
  init?: RequestInit,
  signal?: AbortSignal,
): Promise<T> {
  let timedOut = false;
  const timeoutController = new AbortController();
  const requestSignal = signal
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;
  const timeout = window.setTimeout(() => {
    timedOut = true;
    timeoutController.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...init, signal: requestSignal });
    return await readJson(response, guard);
  } catch (error: unknown) {
    if (error instanceof RequestError) throw error;
    if (timedOut) throw new RequestError("timeout");
    throw new RequestError("network");
  } finally {
    window.clearTimeout(timeout);
  }
}

export function useFetch<T>(url: string, guard: DataGuard<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<RequestError | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestNumber, setRequestNumber] = useState(0);

  const refetch = useCallback(() => {
    setRequestNumber((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);

    void fetchJson(url, guard, undefined, controller.signal)
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (active && reason instanceof RequestError) setError(reason);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [guard, requestNumber, url]);

  return {
    data,
    error,
    loading,
    isInitialLoading: loading && data === null,
    isRefreshing: loading && data !== null,
    refetch,
  };
}

export function requestJson<T>(
  url: string,
  body: unknown,
  guard: DataGuard<T>,
): Promise<T> {
  return fetchJson(
    url,
    guard,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}
