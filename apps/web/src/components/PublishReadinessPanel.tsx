"use client";

type ReadinessItem = {
  id: string;
  severity: "blocking" | "recommended";
  title: string;
  detail: string;
};

export function PublishReadinessPanel(props: {
  ready: boolean;
  items: ReadinessItem[];
}) {
  return (
    <div className="detail-panel form-stack">
      <strong>Publish readiness</strong>
      <p>
        {props.ready ? "Ready to publish (no blocking items)." : "Fix blocking items before publishing."}
      </p>
      <ul style={{ paddingLeft: "1.1rem" }}>
        {props.items.map((item) => (
          <li key={item.id}>
            <span className={item.severity === "blocking" ? "text-danger" : "muted"}>
              [{item.severity}] {item.title}
            </span>
            <div className="meta">{item.detail}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
