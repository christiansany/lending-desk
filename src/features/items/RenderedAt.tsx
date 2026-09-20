"use client";

export function RenderedAt() {
  return <time dateTime={new Date().toISOString()}>{new Date().toISOString()}</time>;
}
