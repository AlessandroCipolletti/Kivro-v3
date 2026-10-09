import Link from "next/link";
import type { ReactNode } from "react";

export function EmptyState(props: {
  title: string;
  description: string;
  action?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <div className="empty-state" role="status">
      <h2 className="empty-state__title">{props.title}</h2>
      <p className="empty-state__desc">{props.description}</p>
      {props.action && (
        <p className="empty-state__action">
          <Link className="button" href={props.action.href}>
            {props.action.label}
          </Link>
        </p>
      )}
      {props.children}
    </div>
  );
}
