import Link from "next/link";
import { categoryLabel, formatDate, formatMoney } from "@/src/lib/format";
import { CATEGORIES, type ItemList } from "./types";
import { RenderedAt } from "./RenderedAt";
import styles from "./items.module.css";

export interface ServerItemFilters {
  q: string;
  category: string;
  status: "all" | "free" | "reserved";
  owner: "all" | "me" | "others";
  page: number;
}

export function ServerItemsPage({ data, filters }: { data: ItemList; filters: ServerItemFilters }) {
  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Equipment library</p>
          <h1>Borrow what you need</h1>
          <p>Search equipment shared by colleagues, then reserve it for up to 14 days.</p>
        </div>
        <Link className={styles.secondaryAction} href="/csr">
          Compare CSR version
        </Link>
      </header>

      <form className={styles.filterPanel} action="/" method="get">
        <div className={styles.filterHeading}>
          <div>
            <h2>Find equipment</h2>
            <p>Submit filters to request server-rendered results.</p>
          </div>
          <button className={styles.filterSubmit} type="submit">
            Apply filters
          </button>
        </div>
        <div className={styles.filters}>
          <label className={styles.nativeField}>
            <span>Search</span>
            <input name="q" defaultValue={filters.q} placeholder="Try ‘camera’ or an owner" />
          </label>
          <label className={styles.nativeField}>
            <span>Availability</span>
            <select name="status" defaultValue={filters.status}>
              <option value="all">Any availability</option>
              <option value="free">Available now</option>
              <option value="reserved">Currently reserved</option>
            </select>
          </label>
          <label className={styles.nativeField}>
            <span>Owner</span>
            <select name="owner" defaultValue={filters.owner}>
              <option value="all">Anyone</option>
              <option value="me">My equipment</option>
              <option value="others">Other colleagues</option>
            </select>
          </label>
          <label className={styles.nativeField}>
            <span>Category</span>
            <select name="category" defaultValue={filters.category}>
              <option value="">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {categoryLabel(category)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form>

      <section className={styles.results} aria-labelledby="results-heading">
        <div className={styles.resultsHeader}>
          <h2 id="results-heading">
            {data.total} {data.total === 1 ? "item" : "items"}
          </h2>
          <p className={styles.renderedAt}>
            Rendered at <RenderedAt />
          </p>
        </div>
        {data.items.length === 0 ? (
          <div className={styles.emptyServerResult}>
            <h3>No matching equipment</h3>
            <p>Clear a filter or try a broader search.</p>
            <Link href="/">Clear filters</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {data.items.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`} className={styles.itemLink}>
                <article className={`${styles.itemCard} ${styles.serverCard}`}>
                  <div className={styles.itemHeader}>
                    <h2>{item.name}</h2>
                    <span className={item.reserved ? styles.reservedBadge : styles.freeBadge}>
                      {item.reserved ? "Reserved" : "Free"}
                    </span>
                  </div>
                  <p className={styles.description}>{item.description}</p>
                  <dl className={styles.metadata}>
                    <div>
                      <dt>Category</dt>
                      <dd>{categoryLabel(item.category)}</dd>
                    </div>
                    <div>
                      <dt>Owner</dt>
                      <dd>{item.mine ? "You" : item.ownerName}</dd>
                    </div>
                    <div>
                      <dt>Collection</dt>
                      <dd>{item.location}</dd>
                    </div>
                    <div>
                      <dt>Rate</dt>
                      <dd>{formatMoney(item.dailyRate)} per day</dd>
                    </div>
                    {item.takenUntil && (
                      <div>
                        <dt>Available after</dt>
                        <dd>{formatDate(item.takenUntil)}</dd>
                      </div>
                    )}
                  </dl>
                  <span className={styles.viewDetails}>View details</span>
                </article>
              </Link>
            ))}
          </div>
        )}
        <nav className={styles.serverPagination} aria-label="Pagination">
          {data.page > 1 ? <Link href={pageHref(filters, data.page - 1)}>Previous</Link> : <span />}
          <span>
            Page {data.page} of {Math.max(1, Math.ceil(data.total / data.limit))}
          </span>
          {data.page * data.limit < data.total ? (
            <Link href={pageHref(filters, data.page + 1)}>Next</Link>
          ) : (
            <span />
          )}
        </nav>
      </section>
    </div>
  );
}

function pageHref(filters: ServerItemFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.owner !== "all") params.set("owner", filters.owner);
  params.set("page", String(page));
  return `/?${params}`;
}
