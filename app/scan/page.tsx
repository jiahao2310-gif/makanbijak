"use client";

import { useState } from "react";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { FoodItem } from "@/lib/types";
import { CameraCapture } from "@/components/CameraCapture";
import { NutritionCard } from "@/components/NutritionCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-700">Scan Food</h1>
        <p className="text-sm text-gray-500">Snap or upload a photo</p>
      </div>

      <CameraCapture onCapture={handleCapture}>
        {loading && (
          <p className="text-center text-sm text-gray-500">Analysing your food…</p>
        )}
      </CameraCapture>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {!profile && (
        <Card className="border-0 bg-amber-50 shadow-sm">
          <CardContent className="p-4 text-sm text-amber-700">
            No health profile yet. Upload your report for personalised advice.
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              {result.food.name_en || result.food_items?.[0]?.name}
            </h2>
            <Badge variant="outline">{result.source}</Badge>
          </div>

          <NutritionCard food={result.food} />

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm">
                <strong className="text-gray-900">Assessment:</strong>{" "}
                {result.advice.assessment}
              </p>
              <p className="flex items-start gap-2 text-sm text-red-600">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {result.advice.warnings}
              </p>
              <p className="flex items-start gap-2 text-sm text-green-700">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                Better choice: {result.advice.better_choice}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
