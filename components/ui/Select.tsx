import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./FormControls.module.css";

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  label: string;
  error?: string;
  children: ReactNode;
};

export function Select({ label, error, id, children, ...props }: SelectProps) {
  const selectId = id ?? props.name;
  const messageId = selectId ? `${selectId}-message` : undefined;

  return (
    <label className={styles.field} htmlFor={selectId}>
      <span className={styles.label}>{label}</span>
      <select
        aria-describedby={messageId}
        aria-invalid={error ? "true" : "false"}
        className={styles.input}
        id={selectId}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className={styles.error} id={messageId}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
