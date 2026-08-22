"use client";

import { useEffect, useState } from "react";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { FoodItem } from "@/lib/types";
import { getSupabase } from "@/lib/supabase";
import { CameraCapture } from "@/components/CameraCapture";
import { NutritionCard } from "@/components/NutritionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

interface ScanResult {
  food: FoodItem;
  source: string;
  advice: {
    assessment: string;
    warnings: string;
    better_choice: string;
  };
  food_items: { name: string; confidence: string }[];
}

interface ScanHistoryItem extends ScanResult {
  id: string;
  created_at: string;
}

function formatDate(value: string | number) {
  const d = new Date(value);
  return d.toLocaleString("en-MY", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ScanPage() {
  const { profile, loaded } = useHealthProfile();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const loadHistory = async () => {
    try {
      const {
        data: { session },
      } = await getSupabase().auth.getSession();
      if (!session?.user) return;

      const { data, error } = await getSupabase()
        .from("scan_history")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory((data as ScanHistoryItem[]) || []);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCapture = async (base64: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/scan-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, health_profile: profile || {} }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");

      const {
        data: { session },
      } = await getSupabase().auth.getSession();

      if (session?.user) {
        const { data: rows, error: insertError } = await getSupabase()
          .from("scan_history")
          .insert([
            {
              user_id: session.user.id,
              food: data.food,
              food_items: data.food_items || [],
              advice: data.advice || {},
              source: data.source,
            },
          ])
          .select();

        if (insertError) throw insertError;

        const saved = rows?.[0] as ScanHistoryItem | undefined;
        if (saved) {
          setResult(data);
          setHistory((prev) => [saved, ...prev].slice(0, 20));
          setExpandedIds((prev) => [saved.id, ...prev]);
        }
      } else {
        setResult(data);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) return null;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-[#1abc9c] to-[#1e3a4c] p-5 text-white shadow-md">
        <h1 className="text-2xl font-bold">Scan Your Food</h1>
        <p className="mt-1 text-sm opacity-90">
          Snap a photo or upload to get nutrition facts and personalised advice.
        </p>
      </div>

      <CameraCapture onCapture={handleCapture}>
        {loading && (
          <p className="text-center text-sm font-medium text-[#1abc9c]">
            Analysing your food…
          </p>
        )}
      </CameraCapture>

      {error && (
        <div className="rounded-xl bg-[#fdecea] p-3 text-sm font-medium text-[#e74c3c]">
          {error}
        </div>
      )}

      {!profile && (
        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="p-4 text-sm font-medium text-[#d4a017]">
            No health profile yet. Upload your report for personalised advice.
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#1e3a4c]">
              {result.food.name_en || result.food_items?.[0]?.name}
            </h2>
            <span className="rounded-full bg-[#e8f8f5] px-2.5 py-1 text-xs font-bold text-[#1abc9c]">
              {result.source}
            </span>
          </div>

          <NutritionCard food={result.food} />

          <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm">
            <CardContent className="space-y-3 p-4">
              <p className="text-sm text-[#1e3a4c]">
                <strong className="text-[#1abc9c]">Assessment:</strong>{" "}
                {result.advice.assessment}
              </p>
              <p className="flex items-start gap-2 text-sm font-medium text-[#e74c3c]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {result.advice.warnings}
              </p>
              <p className="flex items-start gap-2 text-sm font-medium text-[#1abc9c]">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <strong>Better choice:</strong> {result.advice.better_choice}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-[#1e3a4c]">Scan History</h3>
        {history.length === 0 ? (
          <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm">
            <CardContent className="p-5 text-center text-sm text-[#5c7a8c]">
              No scans yet. Snap your first meal to see it here.
            </CardContent>
          </Card>
        ) : (
          history.map((item) => {
            const isOpen = expandedIds.includes(item.id);
            return (
              <Card
                key={item.id}
                className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm"
              >
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-[#1e3a4c]">
                        {item.food.name_en || item.food_items?.[0]?.name}
                      </CardTitle>
                      <p className="text-xs font-medium text-[#5c7a8c]">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExpanded(item.id)}
                      className="rounded-full text-[#1abc9c] hover:bg-[#e8f8f5]"
                    >
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {isOpen && (
                  <CardContent className="space-y-4 border-t border-[#e8f8f5] p-4">
                    <NutritionCard food={item.food} />
                    <div className="space-y-2 text-sm">
                      <p className="text-[#1e3a4c]">
                        <strong className="text-[#1abc9c]">Assessment:</strong>{" "}
                        {item.advice.assessment}
                      </p>
                      <p className="flex items-start gap-2 font-medium text-[#e74c3c]">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        {item.advice.warnings}
                      </p>
                      <p className="flex items-start gap-2 font-medium text-[#1abc9c]">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          <strong>Better choice:</strong>{" "}
                          {item.advice.better_choice}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
