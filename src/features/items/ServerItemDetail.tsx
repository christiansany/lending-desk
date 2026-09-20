import Link from "next/link";
import type { ReactNode } from "react";
import { categoryLabel, formatMoney } from "@/src/lib/format";
import type { Item } from "./types";
import styles from "./items.module.css";

export function ServerItemDetail({
  item,
  availability,
  reservations,
  reservationPanel,
}: {
  item: Item;
  availability: ReactNode;
  reservations: ReactNode;
  reservationPanel?: ReactNode;
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
            <span className={item.reserved ? styles.reservedBadge : styles.freeBadge}>
              {item.reserved ? "Reserved" : "Free"}
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
              <dt>Live availability</dt>
              <dd>{availability}</dd>
            </div>
            <div>
              <dt>Upcoming reservations</dt>
              <dd>{reservations}</dd>
            </div>
          </dl>
        </article>
        <div className={styles.detailRail}>
          {reservationPanel}
          <aside className={`${styles.serverCard} ${styles.detailAside}`}>
            <p className={styles.eyebrow}>Workshop measurement</p>
            <h2>Independent work starts together</h2>
            <p>The shell can arrive while slower facts continue behind their own boundaries.</p>
            <code>max(350, 650, 900) ms</code>
          </aside>
        </div>
      </section>
    </div>
  );
}
