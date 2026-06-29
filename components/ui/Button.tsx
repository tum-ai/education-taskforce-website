import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

type SharedProps = {
  children: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

type ButtonProps = SharedProps & ComponentPropsWithoutRef<"button">;
type LinkButtonProps = SharedProps & ComponentPropsWithoutRef<typeof Link>;

function classNameFor({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  return [styles.button, styles[variant], styles[size], fullWidth ? styles.fullWidth : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  children,
  icon,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button className={classNameFor({ variant, size, fullWidth, className })} type={type} {...props}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}

export function LinkButton({
  children,
  icon,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={classNameFor({ variant, size, fullWidth, className })} {...props}>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span>{children}</span>
    </Link>
  );
}
