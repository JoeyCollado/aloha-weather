"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/daily-log", label: "Daily Log" },
  { href: "/weather-sales", label: "Weather vs Sales" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 md:flex-col">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            style={{
              background: active ? "var(--brand)" : "transparent",
              color: active ? "var(--brand-fg)" : "var(--fg)",
            }}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}