import styles from "@/src/features/items/items.module.css";

export default function Loading() {
  return (
    <section className={styles.routeState} aria-labelledby="loading-heading">
      <p className={styles.eyebrow}>Equipment library</p>
      <h1 id="loading-heading">Loading equipment</h1>
      <p>The catalogue is on its way.</p>
      <div className={styles.skeletonGrid} aria-hidden="true">
        <span />
        <span />
      </div>
    </section>
  );
}
