export interface HealthProfile {
  blood_glucose_fasting: number | null;
  hba1c: number | null;
  total_cholesterol: number | null;
  hdl: number | null;
  ldl: number | null;
  triglycerides: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  bmi: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  conditions: string[];
  report_date: string | null;
  last_updated: string;
}

export interface NutritionData {
  calories_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  cholesterol_mg: number;
}

export interface FoodItem extends NutritionData {
  id: string;
  name_en: string;
  name_ms: string;
  food_group: string;
  serving_size: string;
  source: string;
}

export interface DietHabits {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  budget: string;
  restrictions: string[];
  eating_out_days: number;
  activity: string;
  goals: string[];
  age?: number;
  gender?: "male" | "female";
}

export interface WeeklyPlan {
  [day: string]: {
    breakfast: { meal: string; calories: number; swap_from: string };
    lunch: { meal: string; calories: number; swap_from: string };
    dinner: { meal: string; calories: number; swap_from: string };
    snacks: { meal: string; calories: number; swap_from: string };
  };
}
