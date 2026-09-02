"use client";

import { useEffect, useState } from "react";

/**
 * Our data-fetching hook. Used everywhere, please do not write bespoke
 * fetch calls.
 */
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(url)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail ?? json.title ?? "Request failed");
        return json;
      })
      .then((json) => {
        if (!active) return;
        setData(json);
        setError(null);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [url]);

  return { data, loading, error };
}

export async function requestJson<T>(url: string, method: "POST", body: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) {
    const errors = json.errors ? Object.values(json.errors).join("\n") : null;
    throw new Error(errors || json.detail || json.title || "Request failed");
  }
  return json as T;
}
