/** §537 — explicit loading copy instead of generic spinners everywhere. */
export function LoadingState(props: { label?: string }) {
  return (
    <p className="meta loading-state" role="status" aria-live="polite">
      {props.label ?? "Loading…"}
    </p>
  );
}
