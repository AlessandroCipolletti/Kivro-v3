import type { Metadata } from "next";
import Link from "next/link";
import { SiteNavAuth } from "@/components/SiteNavAuth";
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
              <Link href="/">Discover</Link>
              <Link href="/search">Search</Link>
              <Link href="/favorites">Saved</Link>
              <Link href="/agent">Agent</Link>
              <Link href="/jobs">My jobs</Link>
              <SiteNavAuth />
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
