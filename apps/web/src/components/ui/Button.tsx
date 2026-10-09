import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const classes = [
    "button",
    variant === "secondary" ? "secondary" : "",
    variant === "danger" ? "button--danger" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <button className={classes} {...props} />;
}
