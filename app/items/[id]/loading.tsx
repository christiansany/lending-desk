import styles from "@/src/features/items/items.module.css";

export default function LoadingItem() {
  return (
    <section className={styles.routeState} aria-labelledby="loading-item-heading">
      <p className={styles.eyebrow}>Equipment detail</p>
      <h1 id="loading-item-heading">Loading item</h1>
      <p>Checking the item and its availability.</p>
    </section>
  );
}
