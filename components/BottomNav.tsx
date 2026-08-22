"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, CalendarDays, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/scan", label: "Scan", icon: Camera },
  { href: "/diet", label: "My Diet", icon: CalendarDays },
  { href: "/health", label: "Health", icon: Heart },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-white px-6 pb-safe pt-2 shadow-[0_-4px_20px_rgba(26,188,156,0.08)]">
      <div className="mx-auto flex max-w-md justify-between">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl p-2 text-xs min-w-[56px] transition-colors",
                active
                  ? "bg-[#e8f8f5] text-[#e74c3c]"
                  : "text-[#5c7a8c] hover:bg-[#f0fdfa]"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
