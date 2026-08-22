import { FoodItem } from "./types";

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1/foods/search";

export async function searchUsda(query: string): Promise<FoodItem | null> {
  const key = process.env.USDA_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `${USDA_BASE}?query=${encodeURIComponent(query)}&pageSize=1&api_key=${key}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.foods?.[0];
    if (!item) return null;

    const nut: Record<string, number> = {};
    for (const n of item.foodNutrients || []) {
      const name = (n.nutrientName || "").toLowerCase();
      if (name.includes("energy") && name.includes("kcal")) nut.calories = n.value;
      if (name.includes("protein")) nut.protein = n.value;
      if (name.includes("total lipid")) nut.fat = n.value;
      if (name.includes("carbohydrate, by difference")) nut.carbs = n.value;
      if (name.includes("fiber")) nut.fiber = n.value;
      if (name.includes("sugars")) nut.sugar = n.value;
      if (name.includes("sodium")) nut.sodium = n.value;
      if (name.includes("cholesterol")) nut.cholesterol = n.value;
    }

    return {
      id: `USDA-${item.fdcId}`,
      name_en: item.description,
      name_ms: item.description,
      food_group: item.foodCategory || "Unknown",
      serving_size: `${item.servingSize || 100}g`,
      calories_kcal: Math.round(nut.calories || 0),
      protein_g: Math.round((nut.protein || 0) * 10) / 10,
      fat_g: Math.round((nut.fat || 0) * 10) / 10,
      carbs_g: Math.round((nut.carbs || 0) * 10) / 10,
      fiber_g: Math.round((nut.fiber || 0) * 10) / 10,
      sugar_g: Math.round((nut.sugar || 0) * 10) / 10,
      sodium_mg: Math.round(nut.sodium || 0),
      cholesterol_mg: Math.round(nut.cholesterol || 0),
      source: "USDA",
    };
  } catch {
    return null;
  }
}
