"use client";

import { Card } from "@/src/ui";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <h1 className={styles.title}>Lending Desk</h1>
        <p className={styles.lead}>
          Internal application for lending out equipment. The API is finished and lives under{" "}
          <code>/api</code>. The screens are not.
        </p>
      </section>

      <section>
        <Card>
          <h2 className={styles.subtitle}>What to build</h2>
          <p className={styles.body}>
            The list, the filters, the two forms and the states. The API behind them is in{" "}
            <code>docs/api.md</code>.
          </p>
        </Card>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Where things are</h2>
        <ul className={styles.list}>
          <li>
            <code>docs/api.md</code> — the API, with example payloads
          </li>
          <li>
            <code>src/ui/</code> — the design system
          </li>
          <li>
            <code>src/lib/</code> — data access, logging, formatting
          </li>
          <li>
            <code>src/features/</code> — your code goes here
          </li>
          <li>
            <code>robustness-sheet.md</code> — the checklist for the evening
          </li>
        </ul>
      </section>
    </div>
  );
}
