import { DietHabits } from "./types";

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  "lightly active": 1.375,
  "moderately active": 1.55,
  "very active": 1.725,
};

export function calculateTDEE(
  weight_kg: number,
  height_cm: number,
  age: number,
  gender: "male" | "female",
  activity: string
): number {
  const gm = gender === "male" ? 5 : -161;
  const bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + gm;
  const multiplier = activityMultipliers[activity] || 1.2;
  return Math.round(bmr * multiplier);
}

export function getCalorieTarget(
  tdee: number,
  goals: string[]
): { target: number; label: string } {
  const goalMap: Record<string, number> = {
    "lose weight": -500,
    "control blood sugar": -200,
    "lower cholesterol": -300,
    maintain: 0,
    "gain muscle": 300,
  };
  let adjustment = 0;
  let matched = false;
  for (const goal of goals) {
    if (goalMap[goal] !== undefined) {
      adjustment += goalMap[goal];
      matched = true;
    }
  }
  if (!matched) adjustment = 0;
  return { target: Math.max(1200, Math.round(tdee + adjustment)), label: "" };
}

export function calculateTargetsFromProfile(
  weight_kg: number,
  height_cm: number,
  habits: DietHabits
) {
  const age = habits.age || 35;
  const gender = habits.gender || "male";
  const tdee = calculateTDEE(
    weight_kg,
    height_cm,
    age,
    gender,
    habits.activity
  );
  const { target } = getCalorieTarget(tdee, habits.goals);
  return { tdee, target };
}
