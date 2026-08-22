import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { searchMyFcd } from "@/lib/food-search";
import { searchUsda } from "@/lib/usda-api";
import { FoodItem } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { image, health_profile } = await request.json();
    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    const base64 = image.split(",")[1] || image;

    const idRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a Malaysian food identification expert. Analyze this image and identify the food item(s) shown. For each food item, provide name (common Malaysian English/Malay name), estimated portion size, and confidence level (high/medium/low). If packaged, read the label and extract product name, serving size, and nutrition info. Respond in JSON format as { "items": [{ "name", "portion", "confidence" }] }.`,
            },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
          ],
        },
      ],
      max_tokens: 800,
    });

    const idText = idRes.choices[0].message.content || "";
    const match = idText.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : { items: [] };
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
      const estRes = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: `You are a nutrition expert. Estimate nutrition per serving for "${foodName}". Respond in JSON with { name, serving_size, calories_kcal, protein_g, fat_g, carbs_g, fiber_g, sugar_g, sodium_mg, cholesterol_mg }.`,
          },
        ],
        response_format: { type: "json_object" },
      });
      const est = JSON.parse(estRes.choices[0].message.content || "{}");
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

    const advice = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `You are a Malaysian health advisor. Food: ${food.name_en} (${food.serving_size}) with nutrition: calories ${food.calories_kcal}, protein ${food.protein_g}g, fat ${food.fat_g}g, carbs ${food.carbs_g}g, sugar ${food.sugar_g}g, sodium ${food.sodium_mg}mg. User health profile: ${JSON.stringify(
            health_profile || {}
          )}. Provide 3-4 sentences: brief assessment, specific warnings if any nutrient is concerning, and one healthier Malaysian alternative. Be practical, not preachy. Respond in JSON with { assessment, warnings, better_choice }.`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const adviceJson = JSON.parse(advice.choices[0].message.content || "{}");

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
