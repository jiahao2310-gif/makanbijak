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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white px-6 pb-safe pt-2">
      <div className="mx-auto flex max-w-md justify-between">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 text-xs min-w-[56px]",
                active ? "text-green-600" : "text-gray-500"
              )}
            >
              <Icon className="h-6 w-6" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
