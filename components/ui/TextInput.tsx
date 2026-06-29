import type { ComponentPropsWithoutRef } from "react";
import styles from "./FormControls.module.css";

type TextInputProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function TextInput({ label, error, helperText, id, ...props }: TextInputProps) {
  const inputId = id ?? props.name;
  const messageId = inputId ? `${inputId}-message` : undefined;

  return (
    <label className={styles.field} htmlFor={inputId}>
      <span className={styles.label}>{label}</span>
      <input
        aria-describedby={messageId}
        aria-invalid={error ? "true" : "false"}
        className={styles.input}
        id={inputId}
        {...props}
      />
      {error || helperText ? (
        <span className={error ? styles.error : styles.helper} id={messageId}>
          {error ?? helperText}
        </span>
      ) : null}
    </label>
  );
}
