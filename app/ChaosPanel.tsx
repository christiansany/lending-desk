"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./ChaosPanel.module.css";

interface ChaosOption {
  value: string;
  label: string;
}

/**
 * Dev-only control panel for the error injection in the API.
 * The state lives on the server (`/api/dev/chaos`), so the panel and the test
 * suite drive the same switches.
 */
export function ChaosPanel() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ChaosOption[]>([]);
  const [active, setActive] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/dev/chaos", { cache: "no-store" });
    const json = await res.json();
    setOptions(json.available ?? []);
    setActive(json.switches ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (process.env.NODE_ENV === "production") return null;

  async function send(body: unknown) {
    setBusy(true);
    try {
      const res = await fetch("/api/dev/chaos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      setActive(json.switches ?? []);
    } finally {
      setBusy(false);
    }
  }

  const toggle = (value: string) =>
    send({
      switches: active.includes(value) ? active.filter((s) => s !== value) : [...active, value],
    });

  return (
    <>
      {active.length > 0 && <div className={styles.border} aria-hidden="true" />}
      <div className={styles.panel}>
        {open && (
          <div className={styles.sheet}>
            <p className={styles.heading}>Chaos</p>
            <ul className={styles.options}>
              {options.map((option) => (
                <li key={option.value}>
                  <label className={styles.option}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={active.includes(option.value)}
                      disabled={busy}
                      onChange={() => toggle(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.action}
                disabled={busy}
                onClick={() => send({ switches: [] })}
              >
                All off
              </button>
              <button
                type="button"
                className={styles.action}
                disabled={busy}
                onClick={() => send({ reset: true })}
              >
                Reset data
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          className={`${styles.toggle} ${active.length > 0 ? styles.toggleActive : ""}`}
          onClick={() => setOpen((value) => !value)}
        >
          {active.length > 0 ? `Chaos on (${active.length})` : "Chaos"}
        </button>
      </div>
    </>
  );
}
