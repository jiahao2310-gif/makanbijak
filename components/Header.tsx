"use client";

import { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const username =
    (user?.user_metadata?.username as string) ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e74c3c]">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none text-[#e74c3c]">
              MakanBijak
            </h1>
            <p className="text-[10px] font-medium text-[#1abc9c]">
              Smart Eating
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#e8f8f5] px-2 py-1 text-xs font-medium text-[#1abc9c]">
            Hi, {username}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="rounded-full text-[#5c7a8c] hover:bg-[#fdecea] hover:text-[#e74c3c]"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
