"use client";

import { IconCheck, IconCopy } from "@/components/icons";
import { useCallback, useState, type ReactNode } from "react";

type Props = {
  secret: string;
  children: ReactNode;
};

export function CopySecretOnce({ secret, children }: Props) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(secret);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = secret;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [secret]);

  return (
    <>
      <p className="secret-once-banner__message">{children}</p>
      <div className="secret-once-row">
        <div className="secret-once-field" aria-readonly="true">
          {secret}
        </div>
        <button
          type="button"
          className={`secret-once-copy${copied ? " secret-once-copy--copied" : ""}`}
          onClick={() => void onCopy()}
          aria-label={copied ? "Copied to clipboard" : "Copy secret to clipboard"}
          title={copied ? "Copied!" : "Copy"}
        >
          {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
        </button>
      </div>
    </>
  );
}
