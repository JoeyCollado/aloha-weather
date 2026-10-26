"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiEdit3, FiTrendingUp } from "react-icons/fi";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: FiHome },
  { href: "/daily-log", label: "Daily Log", icon: FiEdit3 },
  { href: "/weather-sales", label: "Weather vs Sales", icon: FiTrendingUp },
];

export function Nav({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        const Icon = link.icon;
        
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={`rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-3 transition-all ${
              active 
                ? "bg-[var(--brand-50)] text-[var(--brand-700)]" 
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon size={18} className={active ? "text-[var(--brand-600)]" : "text-gray-400"} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}