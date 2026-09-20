import Link from "next/link";
import { categoryLabel, formatMoney } from "@/src/lib/format";
import type { Item } from "./types";
import styles from "./items.module.css";

export function ServerItemDetail({
  item,
  availability,
  reservationCount,
}: {
  item: Item;
  availability: { reserved: boolean };
  reservationCount: number;
}) {
  return (
    <div className={styles.page}>
      <Link href="/" className={styles.backLink}>
        <span aria-hidden="true">‹</span> Back to equipment
      </Link>
      <section className={styles.detailLayout}>
        <article className={`${styles.serverCard} ${styles.detailCard}`}>
          <div className={styles.itemHeader}>
            <div>
              <p className={styles.eyebrow}>{categoryLabel(item.category)}</p>
              <h1>{item.name}</h1>
            </div>
            <span className={availability.reserved ? styles.reservedBadge : styles.freeBadge}>
              {availability.reserved ? "Reserved" : "Free"}
            </span>
          </div>
          <p className={styles.detailDescription}>{item.description}</p>
          <dl className={styles.detailMetadata}>
            <div>
              <dt>Owner</dt>
              <dd>{item.mine ? "You" : item.ownerName}</dd>
            </div>
            <div>
              <dt>Serial number</dt>
              <dd>{item.serial}</dd>
            </div>
            <div>
              <dt>Collection location</dt>
              <dd>{item.location}</dd>
            </div>
            <div>
              <dt>Condition</dt>
              <dd>{item.condition}</dd>
            </div>
            <div>
              <dt>Daily rate</dt>
              <dd>{formatMoney(item.dailyRate)}</dd>
            </div>
            <div>
              <dt>Upcoming reservations</dt>
              <dd>{reservationCount}</dd>
            </div>
          </dl>
        </article>
        <aside className={`${styles.serverCard} ${styles.detailAside}`}>
          <p className={styles.eyebrow}>Workshop measurement</p>
          <h2>Three independent reads</h2>
          <p>This version waits for the item, then availability, then reservations.</p>
          <code>350 ms + 650 ms + 900 ms</code>
        </aside>
      </section>
    </div>
  );
}
