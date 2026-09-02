"use client";

import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import styles from "./Field.module.css";

interface SharedFieldProps {
  label: string;
  error?: string;
  hint?: string;
  id?: string;
}

type InputFieldProps = SharedFieldProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false;
  };

type TextareaFieldProps = SharedFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true;
  };

type FieldProps = InputFieldProps | TextareaFieldProps;

export function Field(props: InputFieldProps): ReactNode;
export function Field(props: TextareaFieldProps): ReactNode;
export function Field(props: FieldProps): ReactNode {
  const generatedId = useId();
  if (props.multiline) {
    const { label, error, hint, id, multiline: _, className = "", ...rest } = props;
    const fieldId = id ?? generatedId;
    return (
      <FieldShell label={label} error={error} hint={hint} id={fieldId}>
        {(describedBy) => (
          <textarea
            id={fieldId}
            className={`${styles.input} ${styles.textarea} ${className}`}
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            {...rest}
          />
        )}
      </FieldShell>
    );
  }

  const { label, error, hint, id, multiline: _, className = "", ...rest } = props;
  const fieldId = id ?? generatedId;
  return (
    <FieldShell label={label} error={error} hint={hint} id={fieldId}>
      {(describedBy) => (
        <input
          id={fieldId}
          className={`${styles.input} ${className}`}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          {...rest}
        />
      )}
    </FieldShell>
  );
}

function FieldShell({
  label,
  error,
  hint,
  id,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  id: string;
  children: (describedBy: string | undefined) => ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children(describedBy)}
      {hint && (
        <small id={hintId} className={styles.hint}>
          {hint}
        </small>
      )}
      {error && (
        <small id={errorId} className={styles.error}>
          {error}
        </small>
      )}
    </div>
  );
}
