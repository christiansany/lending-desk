"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { categoryLabel, formatDate, formatMoney } from "@/src/lib/format";
import { log } from "@/src/lib/log";
import { requestJson, RequestError, useFetch } from "@/src/lib/useFetch";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  ErrorSummary,
  Field,
  Pagination,
  Select,
  Spinner,
  Status,
} from "@/src/ui";
import {
  CATEGORIES,
  CONDITIONS,
  isItemList,
  isItemResponse,
  type Category,
  type Condition,
} from "./types";
import styles from "./items.module.css";

const LIMIT = 12;
const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  ...CATEGORIES.map((category) => ({ value: category, label: categoryLabel(category) })),
];

const OFFER_FIELD_IDS = {
  name: "offer-name",
  category: "offer-category",
  description: "offer-description",
  location: "offer-location",
  condition: "offer-condition",
  dailyRate: "offer-daily-rate",
};

type OfferValues = {
  name: string;
  category: Category | "";
  description: string;
  location: string;
  condition: Condition | "";
  dailyRate: string;
};

const INITIAL_OFFER_VALUES: OfferValues = {
  name: "",
  category: "",
  description: "",
  location: "",
  condition: "",
  dailyRate: "",
};

function listFailureMessage(error: RequestError): string {
  if (error.status === 429) {
    return `Too many requests. Try again${error.retryAfter ? ` in ${error.retryAfter} seconds` : " shortly"}.`;
  }
  if (error.status === 503)
    return "Equipment is temporarily unavailable. Please try again shortly.";
  return "We couldn't load equipment. Try again.";
}

function offerFailureMessage(error: RequestError): string {
  if (error.status === 429) {
    return `Too many requests. Try again${error.retryAfter ? ` in ${error.retryAfter} seconds` : " shortly"}.`;
  }
  if (error.status === 503)
    return "Offering equipment is temporarily unavailable. Please try again shortly.";
  if (error.kind === "timeout" || error.kind === "network") {
    return "We could not confirm whether your item was offered. Check the list before trying again.";
  }
  return "We couldn't offer this item. Try again.";
}

function failureOutcome(error: RequestError): string {
  if (error.status === 429) return "rate_limited";
  if (error.status === 503) return "unavailable";
  return error.kind;
}

function offerErrors(values: OfferValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.name.trim().length < 2) errors.name = "Enter an item name with at least 2 characters.";
  if (!values.category) errors.category = "Choose a category.";
  if (values.description.trim().length < 10) {
    errors.description = "Describe the item in at least 10 characters.";
  }
  if (!values.location.trim()) errors.location = "Enter where the item can be collected.";
  if (!values.condition) errors.condition = "Choose the item condition.";
  const rate = Number(values.dailyRate);
  if (values.dailyRate === "" || !Number.isFinite(rate) || rate < 0) {
    errors.dailyRate = "Enter a daily rate of zero or more.";
  }
  return errors;
}

export function ItemsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [offerOpen, setOfferOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const url = useMemo(() => {
    const params = new URLSearchParams({ status, owner, page: String(page), limit: String(LIMIT) });
    if (deferredSearch.trim()) params.set("q", deferredSearch.trim());
    if (category) params.set("category", category);
    return `/api/items?${params}`;
  }, [category, deferredSearch, owner, page, status]);

  const items = useFetch(url, isItemList);

  useEffect(() => {
    if (!items.error) return;
    log(items.error.status === 429 ? "warn" : "error", "Equipment list request failed", {
      event: "item.list.load.failed",
      route: "/",
      action: "item.list.load",
      outcome: failureOutcome(items.error),
      httpStatus: items.error.status,
      requestId: items.error.requestId,
    });
  }, [items.error]);

  const resetPage = () => setPage(1);
  const hasFilters = Boolean(search || category || status !== "all" || owner !== "all");
  const initialError = items.error && items.data === null ? items.error : null;

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <h1>Equipment</h1>
          <p>Find equipment to borrow or offer something from your own kit.</p>
        </div>
        <Button type="button" onClick={() => setOfferOpen((open) => !open)}>
          {offerOpen ? "Close offer form" : "Offer an item"}
        </Button>
      </header>

      {offerOpen && (
        <OfferItemForm
          onComplete={() => {
            setOfferOpen(false);
            resetPage();
            items.refetch();
          }}
        />
      )}

      <Card className={styles.filters}>
        <Field
          label="Search equipment"
          value={search}
          placeholder="Name, description, serial, or owner"
          onChange={(event) => {
            setSearch(event.target.value);
            resetPage();
          }}
        />
        <Select
          label="Reservation status"
          value={status}
          options={[
            { value: "all", label: "All items" },
            { value: "free", label: "Free" },
            { value: "reserved", label: "Reserved" },
          ]}
          onChange={(event) => {
            setStatus(event.target.value);
            resetPage();
          }}
        />
        <Select
          label="Owner"
          value={owner}
          options={[
            { value: "all", label: "All owners" },
            { value: "me", label: "Mine" },
            { value: "others", label: "Others" },
          ]}
          onChange={(event) => {
            setOwner(event.target.value);
            resetPage();
          }}
        />
        <Select
          label="Category"
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={(event) => {
            setCategory(event.target.value);
            resetPage();
          }}
        />
      </Card>

      {items.isInitialLoading && (
        <div className={styles.loading}>
          <Spinner /> Loading equipment...
        </div>
      )}

      {initialError && (
        <section className={styles.state}>
          <ErrorState requestId={initialError.requestId}>
            {listFailureMessage(initialError)}
          </ErrorState>
          <Button type="button" variant="secondary" onClick={items.refetch}>
            Try again
          </Button>
        </section>
      )}

      {items.data && (
        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <p>
              {items.data.total} {items.data.total === 1 ? "item" : "items"} found
            </p>
            {items.isRefreshing && <Status>Updating results...</Status>}
          </div>
          {items.error && (
            <div className={styles.errorWithAction}>
              <ErrorState requestId={items.error.requestId}>
                {listFailureMessage(items.error)}
              </ErrorState>
              <Button type="button" variant="secondary" onClick={items.refetch}>
                Try again
              </Button>
            </div>
          )}
          {items.data.items.length === 0 ? (
            <EmptyState>
              <p>
                {hasFilters
                  ? "No items match these filters. Try clearing a filter or search."
                  : "No equipment has been offered yet. Offer an item to get started."}
              </p>
              {hasFilters ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    setStatus("all");
                    setOwner("all");
                    setCategory("");
                    resetPage();
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button type="button" variant="secondary" onClick={() => setOfferOpen(true)}>
                  Offer an item
                </Button>
              )}
            </EmptyState>
          ) : (
            <>
              <div className={styles.grid}>
                {items.data.items.map((item) => (
                  <Link key={item.id} href={`/items/${item.id}`} className={styles.itemLink}>
                    <Card className={styles.itemCard}>
                      <div className={styles.itemHeader}>
                        <h2>{item.name}</h2>
                        <Badge tone={item.reserved ? "warning" : "success"}>
                          {item.reserved ? "Reserved" : "Free"}
                        </Badge>
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
                    </Card>
                  </Link>
                ))}
              </div>
              <Pagination
                page={items.data.page}
                total={items.data.total}
                limit={items.data.limit}
                onPageChange={setPage}
              />
            </>
          )}
        </section>
      )}
    </div>
  );
}

function OfferItemForm({ onComplete }: { onComplete: () => void }) {
  const [values, setValues] = useState<OfferValues>(INITIAL_OFFER_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<RequestError | null>(null);
  const [saving, setSaving] = useState(false);
  const [focusErrors, setFocusErrors] = useState(false);

  function setValue<Key extends keyof OfferValues>(key: Key, value: OfferValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function offerItem() {
    const localErrors = offerErrors(values);
    setFocusErrors(true);
    setFormError(null);
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    const startedAt = performance.now();
    try {
      await requestJson(
        "/api/items",
        {
          ...values,
          name: values.name.trim(),
          description: values.description.trim(),
          location: values.location.trim(),
          dailyRate: Number(values.dailyRate),
        },
        isItemResponse,
      );
      log("info", "Item offered", {
        event: "item.offer.succeeded",
        route: "/",
        action: "item.offer",
        outcome: "success",
        httpStatus: 201,
        durationMs: Math.round(performance.now() - startedAt),
      });
      onComplete();
    } catch (reason: unknown) {
      if (!(reason instanceof RequestError)) return;
      if (reason.status === 422 && reason.fields) {
        setErrors(reason.fields);
        return;
      }
      setFormError(reason);
      log(reason.status === 429 ? "warn" : "error", "Offering equipment failed", {
        event: "item.offer.failed",
        route: "/",
        action: "item.offer",
        outcome: failureOutcome(reason),
        httpStatus: reason.status,
        requestId: reason.requestId,
        durationMs: Math.round(performance.now() - startedAt),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className={styles.formCard}>
      <div className={styles.formHeading}>
        <h2>Offer an item</h2>
        <p>Share equipment that colleagues can borrow.</p>
      </div>
      {formError && (
        <ErrorState requestId={formError.requestId} title="We couldn't offer this item">
          {offerFailureMessage(formError)}
        </ErrorState>
      )}
      <ErrorSummary errors={errors} fieldIds={OFFER_FIELD_IDS} focusOnRender={focusErrors} />
      <form className={styles.form}>
        <Field
          id={OFFER_FIELD_IDS.name}
          label="Item name"
          value={values.name}
          required
          minLength={2}
          error={errors.name}
          onChange={(event) => setValue("name", event.target.value)}
        />
        <Select
          id={OFFER_FIELD_IDS.category}
          label="Category"
          value={values.category}
          required
          error={errors.category}
          options={[{ value: "", label: "Choose a category" }, ...CATEGORY_OPTIONS.slice(1)]}
          onChange={(event) => setValue("category", event.target.value as Category | "")}
        />
        <Field
          id={OFFER_FIELD_IDS.description}
          label="Description"
          multiline
          value={values.description}
          required
          minLength={10}
          error={errors.description}
          onChange={(event) => setValue("description", event.target.value)}
        />
        <Field
          id={OFFER_FIELD_IDS.location}
          label="Collection location"
          value={values.location}
          required
          error={errors.location}
          onChange={(event) => setValue("location", event.target.value)}
        />
        <Select
          id={OFFER_FIELD_IDS.condition}
          label="Condition"
          value={values.condition}
          required
          error={errors.condition}
          options={[
            { value: "", label: "Choose a condition" },
            ...CONDITIONS.map((condition) => ({
              value: condition,
              label: condition[0].toUpperCase() + condition.slice(1),
            })),
          ]}
          onChange={(event) => setValue("condition", event.target.value as Condition | "")}
        />
        <Field
          id={OFFER_FIELD_IDS.dailyRate}
          label="Daily rate (CHF)"
          type="number"
          value={values.dailyRate}
          required
          min="0"
          step="0.01"
          error={errors.dailyRate}
          onChange={(event) => setValue("dailyRate", event.target.value)}
        />
        <div className={styles.formActions}>
          <Button type="button" loading={saving} disabled={saving} onClick={offerItem}>
            Offer item
          </Button>
          {saving && <Status>Offering item...</Status>}
        </div>
      </form>
    </Card>
  );
}
