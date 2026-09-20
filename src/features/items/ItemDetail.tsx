"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { categoryLabel, formatDate, formatMoney, formatRange, todayIso } from "@/src/lib/format";
import { log } from "@/src/lib/log";
import { requestJson, RequestError, useFetch } from "@/src/lib/useFetch";
import { Badge, Button, Card, ErrorState, ErrorSummary, Field, Spinner, Status } from "@/src/ui";
import { isCurrentUser, isItemResponse, isReservation, type CurrentUser, type Item } from "./types";
import styles from "./items.module.css";

const RESERVATION_FIELD_IDS = {
  name: "reservation-name",
  email: "reservation-email",
  from: "reservation-from",
  to: "reservation-to",
  purpose: "reservation-purpose",
};

type ReservationValues = {
  name: string;
  email: string;
  from: string;
  to: string;
  purpose: string;
};

function failureOutcome(error: RequestError): string {
  if (error.status === 429) return "rate_limited";
  if (error.status === 503) return "unavailable";
  return error.kind;
}

function itemFailureMessage(error: RequestError): string {
  if (error.status === 429) {
    return `Too many requests. Try again${error.retryAfter ? ` in ${error.retryAfter} seconds` : " shortly"}.`;
  }
  if (error.status === 503)
    return "This equipment is temporarily unavailable. Please try again shortly.";
  return "We couldn't load this item. Try again.";
}

function reservationFailureMessage(error: RequestError): string {
  if (error.status === 409) {
    return error.takenUntil
      ? `This period was just reserved by someone else. It is taken until ${formatDate(error.takenUntil)}.`
      : "This period was just reserved by someone else. Refresh availability and choose another period.";
  }
  if (error.status === 429) {
    return `Too many reservation attempts. Try again${error.retryAfter ? ` in ${error.retryAfter} seconds` : " shortly"}.`;
  }
  if (error.status === 503)
    return "Reservations are temporarily unavailable. Please try again shortly.";
  if (error.kind === "timeout" || error.kind === "network") {
    return "We could not confirm whether your reservation was made. Check availability before trying again.";
  }
  return "We couldn't make this reservation. Try again.";
}

function maxReservationDate(from: string): string | undefined {
  if (!from) return undefined;
  const date = new Date(`${from}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  date.setUTCDate(date.getUTCDate() + 13);
  return date.toISOString().slice(0, 10);
}

function reservationErrors(values: ReservationValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.name.trim().length < 2) errors.name = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a reachable email address.";
  }
  const today = todayIso();
  if (!values.from || values.from < today)
    errors.from = "Choose a start date that is not in the past.";
  if (!values.to) errors.to = "Choose an end date.";
  if (values.from && values.to && values.to < values.from) {
    errors.to = "The end date must be on or after the start date.";
  }
  if (values.from && values.to) {
    const days =
      (Date.parse(`${values.to}T00:00:00Z`) - Date.parse(`${values.from}T00:00:00Z`)) / 86_400_000 +
      1;
    if (days > 14) errors.to = "A reservation can last at most 14 days.";
  }
  if (values.purpose.trim().length < 5)
    errors.purpose = "Tell us in at least 5 characters what you need it for.";
  return errors;
}

export function ItemDetail({ itemId, backHref = "/" }: { itemId: string; backHref?: string }) {
  const item = useFetch(`/api/items/${encodeURIComponent(itemId)}`, isItemResponse);

  useEffect(() => {
    if (!item.error) return;
    log(item.error.status === 429 ? "warn" : "error", "Equipment detail request failed", {
      event: "item.detail.load.failed",
      route: `/items/${itemId}`,
      action: "item.detail.load",
      outcome: failureOutcome(item.error),
      httpStatus: item.error.status,
      requestId: item.error.requestId,
    });
  }, [item.error, itemId]);

  if (item.isInitialLoading) {
    return (
      <div className={styles.loading}>
        <Spinner /> Loading equipment...
      </div>
    );
  }

  if (item.error && item.data === null) {
    const missing = item.error.status === 404;
    return (
      <section className={styles.state}>
        <ErrorState
          title={missing ? "This item is no longer available." : "We couldn't load this item"}
          requestId={item.error.requestId}
        >
          {missing
            ? "Return to the equipment list to choose another item."
            : itemFailureMessage(item.error)}
        </ErrorState>
        {missing ? (
          <Link href="/" className={styles.backLink}>
            Return to equipment
          </Link>
        ) : (
          <Button type="button" variant="secondary" onClick={item.refetch}>
            Try again
          </Button>
        )}
      </section>
    );
  }

  if (!item.data) return null;

  return (
    <div className={styles.page}>
      <Link href={backHref} className={styles.backLink}>
        <span aria-hidden="true">‹</span> Back to equipment
      </Link>
      {item.error && (
        <ErrorState requestId={item.error.requestId}>{itemFailureMessage(item.error)}</ErrorState>
      )}
      <section className={styles.detailLayout}>
        <Card className={styles.detailCard}>
          <div className={styles.itemHeader}>
            <div>
              <p className={styles.eyebrow}>{categoryLabel(item.data.category)}</p>
              <h1>{item.data.name}</h1>
            </div>
            <Badge tone={item.data.reserved ? "warning" : "success"}>
              {item.data.reserved ? "Reserved" : "Free"}
            </Badge>
          </div>
          <p className={styles.detailDescription}>{item.data.description}</p>
          <dl className={styles.detailMetadata}>
            <div>
              <dt>Owner</dt>
              <dd>{item.data.mine ? "You" : item.data.ownerName}</dd>
            </div>
            <div>
              <dt>Serial number</dt>
              <dd>{item.data.serial}</dd>
            </div>
            <div>
              <dt>Collection location</dt>
              <dd>{item.data.location}</dd>
            </div>
            <div>
              <dt>Condition</dt>
              <dd>{item.data.condition}</dd>
            </div>
            <div>
              <dt>Daily rate</dt>
              <dd>{formatMoney(item.data.dailyRate)}</dd>
            </div>
            {item.data.takenUntil && (
              <div>
                <dt>Currently reserved until</dt>
                <dd>{formatDate(item.data.takenUntil)}</dd>
              </div>
            )}
          </dl>
        </Card>
        <ReservationForm item={item.data} onReservationCreated={item.refetch} />
      </section>
    </div>
  );
}

function ReservationForm({
  item,
  onReservationCreated,
}: {
  item: Item;
  onReservationCreated: () => void;
}) {
  const user = useFetch("/api/me", isCurrentUser);
  const didPrefill = useRef(false);
  const [values, setValues] = useState<ReservationValues>({
    name: "",
    email: "",
    from: "",
    to: "",
    purpose: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<RequestError | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedRange, setSavedRange] = useState<string | null>(null);
  const [focusErrors, setFocusErrors] = useState(false);

  useEffect(() => {
    prefillReservationUser(user.data, didPrefill, setValues);
  }, [user.data]);

  function setValue<Key extends keyof ReservationValues>(key: Key, value: ReservationValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function reserveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const localErrors = reservationErrors(values);
    setFocusErrors(true);
    setFormError(null);
    setSavedRange(null);
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    const startedAt = performance.now();
    try {
      await requestJson(
        "/api/reservations",
        {
          itemId: item.id,
          name: values.name.trim(),
          email: values.email.trim(),
          from: values.from,
          to: values.to,
          purpose: values.purpose.trim(),
        },
        isReservation,
      );
      setSavedRange(formatRange(values.from, values.to));
      setValues((current) => ({ ...current, from: "", to: "", purpose: "" }));
      onReservationCreated();
      log("info", "Reservation created", {
        event: "reservation.create.succeeded",
        route: `/items/${item.id}`,
        action: "reservation.create",
        outcome: "success",
        httpStatus: 201,
        durationMs: Math.round(performance.now() - startedAt),
      });
    } catch (reason: unknown) {
      if (!(reason instanceof RequestError)) return;
      if (reason.status === 422 && reason.fields) {
        setErrors(reason.fields);
        return;
      }
      setFormError(reason);
      log(reason.status === 429 ? "warn" : "error", "Creating reservation failed", {
        event: "reservation.create.failed",
        route: `/items/${item.id}`,
        action: "reservation.create",
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
        <h2>Reserve this item</h2>
        <p>Choose a period of up to 14 days.</p>
      </div>
      {user.error && (
        <ErrorState title="We couldn't prefill your details" requestId={user.error.requestId}>
          Enter your name and email address to continue.
        </ErrorState>
      )}
      {formError && (
        <ErrorState requestId={formError.requestId} title="We couldn't make this reservation">
          {reservationFailureMessage(formError)}
          {formError.status === 409 && (
            <>
              {" "}
              <Button type="button" variant="secondary" onClick={onReservationCreated}>
                Refresh availability
              </Button>
            </>
          )}
        </ErrorState>
      )}
      {savedRange && <Status className={styles.success}>Reserved for {savedRange}.</Status>}
      <ErrorSummary errors={errors} fieldIds={RESERVATION_FIELD_IDS} focusOnRender={focusErrors} />
      <form className={styles.form} noValidate onSubmit={reserveItem}>
        <Field
          id={RESERVATION_FIELD_IDS.name}
          label="Your name"
          value={values.name}
          required
          minLength={2}
          error={errors.name}
          onChange={(event) => setValue("name", event.target.value)}
        />
        <Field
          id={RESERVATION_FIELD_IDS.email}
          label="Email address"
          type="email"
          value={values.email}
          required
          error={errors.email}
          onChange={(event) => setValue("email", event.target.value)}
        />
        <fieldset className={styles.dateFields}>
          <legend>Reservation period</legend>
          <p>Reservations can start today and last no more than 14 days.</p>
          <Field
            id={RESERVATION_FIELD_IDS.from}
            label="From"
            type="date"
            value={values.from}
            required
            min={todayIso()}
            error={errors.from}
            onChange={(event) => setValue("from", event.target.value)}
          />
          <Field
            id={RESERVATION_FIELD_IDS.to}
            label="To"
            type="date"
            value={values.to}
            required
            min={values.from || todayIso()}
            max={maxReservationDate(values.from)}
            error={errors.to}
            onChange={(event) => setValue("to", event.target.value)}
          />
        </fieldset>
        <Field
          id={RESERVATION_FIELD_IDS.purpose}
          label="What do you need it for?"
          multiline
          value={values.purpose}
          required
          minLength={5}
          error={errors.purpose}
          onChange={(event) => setValue("purpose", event.target.value)}
        />
        <div className={styles.formActions}>
          <Button type="submit" loading={saving} disabled={saving}>
            {saving ? "Reserving item" : "Reserve item"}
          </Button>
          {saving && <Status>Reserving item...</Status>}
        </div>
      </form>
    </Card>
  );
}

function prefillReservationUser(
  user: CurrentUser | null,
  didPrefill: MutableRefObject<boolean>,
  setValues: Dispatch<SetStateAction<ReservationValues>>,
) {
  if (!user || didPrefill.current) return;
  didPrefill.current = true;
  setValues((current) => ({ ...current, name: user.name, email: user.email }));
}
