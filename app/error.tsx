"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/ui";
import { log } from "@/src/lib/log";
import styles from "@/src/features/items/items.module.css";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    log("error", "Equipment route failed", {
      event: "route.items.failed",
      route: "/",
      action: "route.render",
      outcome: "error",
    });
  }, [error]);

  function retry() {
    reset();
    router.refresh();
  }

  return (
    <section className={styles.routeState}>
      <p className={styles.eyebrow}>Equipment library</p>
      <h1>We couldn’t load the equipment</h1>
      <p>This may be temporary. Your browser can ask the route to render again.</p>
      <Button type="button" onClick={retry}>
        Try again
      </Button>
    </section>
  );
}
