"use client";

import { useState } from "react";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { useDietPlan } from "@/hooks/useDietPlan";
import { DietOnboarding } from "@/components/DietOnboarding";
import { MealCard } from "@/components/MealCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function DietPage() {
  const { profile, loaded: healthLoaded } = useHealthProfile();
  const { habits, plan, loaded: planLoaded, saveHabits, savePlan } = useDietPlan();
  const [generating, setGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(days[0]);

  const handleGenerate = async (h: typeof habits) => {
    if (!h) return;
    saveHabits(h);
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-diet-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ health_profile: profile || {}, habits: h }),
      });
      const data = await res.json();
      if (data.weeklyPlan) savePlan(data.weeklyPlan);
    } finally {
      setGenerating(false);
    }
  };

  if (!healthLoaded || !planLoaded) return null;

  if (!habits) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-green-700">My Diet</h1>
        <DietOnboarding onSave={handleGenerate} />
      </div>
    );
  }

  const dayPlan = plan?.[selectedDay];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-700">My Diet</h1>
        <Button
          onClick={() => handleGenerate(habits)}
          disabled={generating}
          className="bg-green-600 hover:bg-green-700"
        >
          {generating ? "Generating…" : "Regenerate"}
        </Button>
      </div>

      <Tabs value={selectedDay} onValueChange={setSelectedDay}>
        <TabsList className="w-full overflow-x-auto">
          {days.map((d) => (
            <TabsTrigger key={d} value={d} className="capitalize">
              {d.slice(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {dayPlan ? (
        <div className="space-y-3">
          <MealCard label="Breakfast" meal={dayPlan.breakfast} />
          <MealCard label="Lunch" meal={dayPlan.lunch} />
          <MealCard label="Dinner" meal={dayPlan.dinner} />
          <MealCard label="Snacks" meal={dayPlan.snacks} />
          <Card className="border-0 bg-green-50 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-green-800">
                Daily total: {" "}
                {dayPlan.breakfast.calories +
                  dayPlan.lunch.calories +
                  dayPlan.dinner.calories +
                  dayPlan.snacks.calories}{" "}
                kcal
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center text-sm text-gray-500">
            No plan yet. Tap Regenerate to create your weekly plan.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
