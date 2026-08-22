"use client";

import { useState } from "react";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { FoodItem } from "@/lib/types";
import { CameraCapture } from "@/components/CameraCapture";
import { NutritionCard } from "@/components/NutritionCard";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Lightbulb } from "lucide-react";

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

export default function ScanPage() {
  const { profile, loaded } = useHealthProfile();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

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
      setResult(data);
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
    </div>
  );
}
