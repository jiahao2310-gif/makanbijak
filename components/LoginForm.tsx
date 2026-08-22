"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/lib/auth";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, fullName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        setMessage("Account created. Logging you in…");
        await signIn({ username, password });
      } else {
        await signIn({ username, password });
      }
      onSuccess?.();
    } catch (err) {
      setMessage((err as Error).message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-sm overflow-hidden rounded-2xl border-0 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-br from-[#1abc9c] to-[#1e3a4c] p-6 text-center text-white">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <span className="text-xl font-bold text-[#e74c3c]">M</span>
          </div>
          <CardTitle className="mt-3 text-2xl font-bold">
            MakanBijak
          </CardTitle>
          <p className="text-sm opacity-90">Smart Eating for Malaysians</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-[#1abc9c]">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="mt-1 rounded-xl border-[var(--border)]"
              />
            </div>
            {mode === "register" && (
              <div>
                <Label htmlFor="fullName" className="text-[#1abc9c]">
                  Full name (optional)
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1 rounded-xl border-[var(--border)]"
                />
              </div>
            )}
            <div>
              <Label htmlFor="password" className="text-[#1abc9c]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={6}
                className="mt-1 rounded-xl border-[var(--border)]"
              />
            </div>
            {message && (
              <p
                className={`text-sm font-medium ${
                  message.includes("created") || message.includes("logged")
                    ? "text-[#1abc9c]"
                    : "text-[#e74c3c]"
                }`}
              >
                {message}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#e74c3c] text-white shadow-md hover:bg-[#c0392b]"
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                ? "Login"
                : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-[#5c7a8c]">
            {mode === "login" ? "New here? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMessage("");
              }}
              className="font-semibold text-[#1abc9c] hover:underline"
            >
              {mode === "login" ? "Register" : "Login"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
