import Link from "next/link";
import { categoryLabel, formatMoney } from "@/src/lib/format";
import type { Item } from "./types";
import styles from "./items.module.css";

export function ServerItemStarter({ item }: { item: Item }) {
  return (
    <div className={styles.page}>
      <Link href="/" className={styles.backLink}>
        <span aria-hidden="true">‹</span> Back to equipment
      </Link>
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
        </dl>
      </article>
    </div>
  );
}
