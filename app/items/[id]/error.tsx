"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/src/ui";
import styles from "@/src/features/items/items.module.css";

export default function ItemError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  function retry() {
    reset();
    router.refresh();
  }

  return (
    <section className={styles.routeState}>
      <p className={styles.eyebrow}>Equipment detail</p>
      <h1>We couldn’t load this item</h1>
      <p>Try this request again, or return to the equipment list.</p>
      <div className={styles.stateActions}>
        <Button type="button" onClick={retry}>
          Try again
        </Button>
        <Link href="/">Back to equipment</Link>
      </div>
    </section>
  );
}
