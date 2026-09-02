/**
 * 120-400 ms of normal latency. Enough that a missing loading state becomes
 * visible, little enough not to be annoying. Switched off in the test suite.
 */
const OFF = process.env.LENDING_DESK_LATENCY === "off" || process.env.NODE_ENV === "test";

export function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function baseLatencyMs(): number {
  if (OFF) return 0;
  return 120 + Math.floor(Math.random() * 281);
}

/**
 * Search is deliberately slower the more hits it produces. A short query
 * ("l") is therefore slower than a long one ("lap") — which is exactly how a
 * response to an earlier keystroke arrives last and overwrites the newer one.
 * No chaos switch needed for the race condition.
 */
export function searchLatencyMs(matchCount: number): number {
  if (OFF) return 0;
  return Math.min(matchCount * 6, 300);
}
