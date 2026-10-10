import type { Metadata } from "next";
import Link from "next/link";
import { SiteNavAuth } from "@/components/SiteNavAuth";
import { PRIMARY_NAV } from "@/lib/primary-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kivro Marketplace",
  description: "Discover and run OpenClaw capabilities from trusted sellers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <Link className="logo" href="/">
              Kivro
            </Link>
            <nav className="nav" aria-label="Primary">
              {PRIMARY_NAV.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <Link href="/search">Search</Link>
              <Link href="/settings/api-keys">Developer</Link>
              <SiteNavAuth />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="site-header-inner">
            <nav className="nav" aria-label="Legal">
              <Link href="/legal/terms">Terms</Link>
              <Link href="/legal/privacy">Privacy</Link>
              <Link href="/legal/aup">Acceptable use</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
