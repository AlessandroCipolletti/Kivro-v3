"use client";

import { IconKey, IconWebhook } from "@/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const links = [
  { href: "/settings/api-keys", label: "API keys", Icon: IconKey },
  { href: "/settings/webhooks", label: "Webhooks", Icon: IconWebhook },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="settings-layout">
      <nav className="settings-nav" aria-label="Developer settings">
        {links.map(({ href, label, Icon }) => (
          <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <Icon size={16} />
              {label}
            </span>
          </Link>
        ))}
      </nav>
      <div>{children}</div>
    </div>
  );
}
