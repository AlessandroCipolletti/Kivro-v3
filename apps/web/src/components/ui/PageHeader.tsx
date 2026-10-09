import type { ReactNode } from "react";

export function PageHeader(props: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-header__text">
        <h1>{props.title}</h1>
        {props.description != null && (
          <div className="meta page-header__desc">{props.description}</div>
        )}
      </div>
      {props.actions && <div className="page-header__actions">{props.actions}</div>}
    </header>
  );
}
