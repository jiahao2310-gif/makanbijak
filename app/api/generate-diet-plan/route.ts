import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/llm";
import { calculateTargetsFromProfile } from "@/lib/calorie-calculator";
import { WeeklyPlan } from "@/lib/types";

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : {};
}

export async function POST(request: NextRequest) {
  try {
    const { health_profile, habits } = await request.json();

    const { tdee, target } = calculateTargetsFromProfile(
      health_profile.weight_kg || 70,
      health_profile.height_cm || 170,
      habits
    );

    const prompt = `You are a Malaysian dietitian AI. Generate a realistic weekly meal plan.
Health conditions: ${(health_profile.conditions || []).join(", ")}
Daily calorie target: ${target} kcal
Current habits: breakfast ${habits.breakfast}, lunch ${habits.lunch}, dinner ${habits.dinner}, snacks ${habits.snacks}
Budget: ${habits.budget}
Restrictions: ${habits.restrictions.join(", ")}
Goals: ${habits.goals.join(", ")}
Rules: suggest realistic Malaysian foods, work with current habits, use real names (nasi, mee, roti), include modifications like kurang nasi, tanpa kulit, sup instead of goreng, max 2-3 swaps, calculate daily calories. Respond with JSON: { "weeklyPlan": { "monday": { "breakfast": { "meal", "calories", "swap_from" }, ... } }, "dailyAverage": { "calories", "target" }, "weeklyCalorieSaved": number, "projectedWeightChange": string }.`;

    const res = await generateText(prompt);
    const plan = extractJson(res);
    const weeklyPlan = (plan.weeklyPlan || {}) as WeeklyPlan;
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    let avg = 0;
    let count = 0;
    for (const day of days) {
      const d = weeklyPlan[day];
      if (!d) continue;
      const sum =
        (d.breakfast?.calories || 0) +
        (d.lunch?.calories || 0) +
        (d.dinner?.calories || 0) +
        (d.snacks?.calories || 0);
      avg += sum;
      count++;
    }
    const dailyAverage = count ? Math.round(avg / count) : 0;

    return NextResponse.json({
      ...plan,
      weeklyPlan,
      summary: {
        tdee,
        target,
        dailyAverage,
        weeklyCalorieSaved: plan.weeklyCalorieSaved || 0,
        projectedWeightChange: plan.projectedWeightChange || "-",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
