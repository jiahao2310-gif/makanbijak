import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { HealthProfile } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { document } = await request.json();
    if (!document || typeof document !== "string") {
      return NextResponse.json({ error: "Document required" }, { status: 400 });
    }

    const base64 = document.split(",")[1] || document;

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract health markers from this Malaysian health report image. Return JSON with: blood_glucose_fasting (mmol/L), hba1c (%), total_cholesterol, hdl, ldl, triglycerides (mmol/L), blood_pressure_systolic, blood_pressure_diastolic (mmHg), bmi, weight_kg, height_cm, conditions (array of strings), report_date (YYYY-MM-DD). Use null for missing values.`,
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64}` },
            },
          ],
        },
      ],
      max_tokens: 1200,
    });

    const text = res.choices[0].message.content || "";
    const match = text.match(/\{[\s\S]*\}/);
    const extracted = match ? JSON.parse(match[0]) : {};

    const profile: HealthProfile = {
      blood_glucose_fasting: extracted.blood_glucose_fasting ?? null,
      hba1c: extracted.hba1c ?? null,
      total_cholesterol: extracted.total_cholesterol ?? null,
      hdl: extracted.hdl ?? null,
      ldl: extracted.ldl ?? null,
      triglycerides: extracted.triglycerides ?? null,
      blood_pressure_systolic: extracted.blood_pressure_systolic ?? null,
      blood_pressure_diastolic: extracted.blood_pressure_diastolic ?? null,
      bmi: extracted.bmi ?? null,
      weight_kg: extracted.weight_kg ?? null,
      height_cm: extracted.height_cm ?? null,
      conditions: Array.isArray(extracted.conditions)
        ? extracted.conditions
        : [],
      report_date: extracted.report_date ?? null,
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json({ extracted_markers: profile, confidence: 0.8 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
