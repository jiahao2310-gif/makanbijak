"use client";

import { useState, useEffect } from "react";
import { DietHabits, WeeklyPlan } from "@/lib/types";

const HABITS_KEY = "makanbijak_diet_habits";
const PLAN_KEY = "makanbijak_diet_plan";

export const emptyHabits: DietHabits = {
  breakfast: "",
  lunch: "",
  dinner: "",
  snacks: "",
  budget: "",
  restrictions: [],
  eating_out_days: 3,
  activity: "sedentary",
  goals: [],
};

export function useDietPlan() {
  const [habits, setHabits] = useState<DietHabits | null>(null);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = localStorage.getItem(HABITS_KEY);
    const p = localStorage.getItem(PLAN_KEY);
    if (h) {
      try {
        setHabits(JSON.parse(h));
      } catch {
        setHabits(null);
      }
    }
    if (p) {
      try {
        setPlan(JSON.parse(p));
      } catch {
        setPlan(null);
      }
    }
    setLoaded(true);
  }, []);

  const saveHabits = (h: DietHabits) => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(h));
    setHabits(h);
  };

  const savePlan = (p: WeeklyPlan) => {
    localStorage.setItem(PLAN_KEY, JSON.stringify(p));
    setPlan(p);
  };

  return { habits, plan, loaded, saveHabits, savePlan };
}
