import { IconAlert } from "@/components/icons";

export function Alert(props: { tone?: "info" | "warning" | "danger"; children: React.ReactNode }) {
  const tone = props.tone ?? "info";
  return (
    <div className={`alert alert--${tone}`} role="alert">
      <IconAlert className="alert__icon" size={18} />
      <div>{props.children}</div>
    </div>
  );
}
