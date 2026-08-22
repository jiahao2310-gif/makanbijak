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
        <DietOnboarding onSave={handleGenerate} />
      </div>
    );
  }

  const dayPlan = plan?.[selectedDay];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-[#1abc9c] to-[#00bfa5] p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Diet</h1>
            <p className="mt-1 text-sm opacity-90">Your weekly meal plan</p>
          </div>
          <Button
            onClick={() => handleGenerate(habits)}
            disabled={generating}
            className="rounded-full bg-white text-[#1abc9c] shadow-md hover:bg-[#f0fdfa]"
          >
            {generating ? "Generating…" : "Regenerate"}
          </Button>
        </div>
      </div>

      <Tabs value={selectedDay} onValueChange={setSelectedDay}>
        <TabsList className="w-full overflow-x-auto rounded-2xl bg-white p-1 shadow-sm">
          {days.map((d) => (
            <TabsTrigger
              key={d}
              value={d}
              className="rounded-xl px-3 py-2 text-sm capitalize data-[state=active]:bg-[#e74c3c] data-[state=active]:text-white"
            >
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
          <Card className="overflow-hidden rounded-2xl border-0 bg-[#e8f8f5] shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm font-bold text-[#1e3a4c]">
                Daily total: {" "}
                <span className="text-[#e74c3c]">
                  {dayPlan.breakfast.calories +
                    dayPlan.lunch.calories +
                    dayPlan.dinner.calories +
                    dayPlan.snacks.calories}
                </span>{" "}
                kcal
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="p-6 text-center text-sm text-[#5c7a8c]">
            No plan yet. Tap Regenerate to create your weekly plan.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
