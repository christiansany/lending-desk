import Link from "next/link";
import styles from "@/src/features/items/items.module.css";

export default function ItemNotFound() {
  return (
    <section className={styles.routeState}>
      <p className={styles.eyebrow}>Equipment detail</p>
      <h1>This item is no longer available</h1>
      <p>It may have been removed. Return to the list to choose another item.</p>
      <Link href="/">Back to equipment</Link>
    </section>
  );
}
