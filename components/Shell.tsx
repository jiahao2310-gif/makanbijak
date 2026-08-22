"use client";

import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { signOut, onAuthStateChange } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getSupabase()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (mounted) {
          setSession(session);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setSession(null);
          setLoading(false);
        }
      });

    const unsubscribe = onAuthStateChange((session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#e8f8f5]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1abc9c] border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#e8f8f5] px-4">
        <LoginForm onSuccess={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8f8f5]">
      <Header user={session.user} onLogout={handleLogout} />
      <main className="mx-auto min-h-screen max-w-md px-4 pb-28 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
