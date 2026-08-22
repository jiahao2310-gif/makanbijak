import { NextRequest, NextResponse } from "next/server";
import { generateText, generateWithImage } from "@/lib/llm";
import { searchMyFcd } from "@/lib/food-search";
import { searchUsda } from "@/lib/usda-api";
import { FoodItem } from "@/lib/types";

const identifyPrompt = `You are a Malaysian food identification expert. Analyze this image and identify the food item(s) shown. For each food item, provide name (common Malaysian English/Malay name), estimated portion size, and confidence level (high/medium/low). If packaged, read the label and extract product name, serving size, and nutrition info. Respond in JSON format as { "items": [{ "name", "portion", "confidence" }] }.`;

const estimatePrompt = (foodName: string) =>
  `You are a nutrition expert. Estimate nutrition per serving for "${foodName}". Respond in JSON with { name, serving_size, calories_kcal, protein_g, fat_g, carbs_g, fiber_g, sugar_g, sodium_mg, cholesterol_mg }.`;

const advicePrompt = (food: FoodItem, healthProfile: unknown) =>
  `You are a Malaysian health advisor. Food: ${food.name_en} (${food.serving_size}) with nutrition: calories ${food.calories_kcal}, protein ${food.protein_g}g, fat ${food.fat_g}g, carbs ${food.carbs_g}g, sugar ${food.sugar_g}g, sodium ${food.sodium_mg}mg. User health profile: ${JSON.stringify(
    healthProfile || {}
  )}. Provide 3-4 sentences: brief assessment, specific warnings if any nutrient is concerning, and one healthier Malaysian alternative. Be practical, not preachy. Respond in JSON with { assessment, warnings, better_choice }.`;

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : {};
}

export async function POST(request: NextRequest) {
  try {
    const { image, health_profile } = await request.json();
    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    const base64 = image.split(",")[1] || image;

    const idText = await generateWithImage(identifyPrompt, base64);
    const parsed = extractJson(idText);
    const item = parsed.items?.[0] || parsed;
    const foodName: string = item.name || item.product_name || "Unknown";

    let food: FoodItem | null = searchMyFcd(foodName);
    let source = "MyFCD";

    if (!food) {
      const usda = await searchUsda(foodName);
      if (usda) {
        food = usda;
        source = "USDA";
      }
    }

    if (!food) {
      const estText = await generateText(estimatePrompt(foodName));
      const est = extractJson(estText);
      food = {
        id: `EST-${Date.now()}`,
        name_en: est.name || foodName,
        name_ms: est.name || foodName,
        food_group: "Estimated",
        serving_size: est.serving_size || "1 serving",
        source: "Estimated",
        ...est,
      } as FoodItem;
      source = "Estimated";
    }

    const adviceText = await generateText(advicePrompt(food, health_profile));
    const adviceJson = extractJson(adviceText);

    return NextResponse.json({
      food_items: parsed.items || [],
      food,
      source,
      advice: adviceJson,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
