"use client";

import Link from "next/link";
import { Button } from "@/src/ui";
import styles from "@/src/features/items/items.module.css";

export default function ItemError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className={styles.routeState}>
      <p className={styles.eyebrow}>Equipment detail</p>
      <h1>We couldn’t load this item</h1>
      <p>Try this request again, or return to the equipment list.</p>
      <div className={styles.stateActions}>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link href="/">Back to equipment</Link>
      </div>
    </section>
  );
}
