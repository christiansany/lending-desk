"use client";

export function RenderedAt({ value }: { value: string }) {
  return <time dateTime={value}>{value}</time>;
}
