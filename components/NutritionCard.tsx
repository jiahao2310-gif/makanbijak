import { FoodItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const rows: { label: string; key: keyof FoodItem }[] = [
  { label: "Calories", key: "calories_kcal" },
  { label: "Protein", key: "protein_g" },
  { label: "Fat", key: "fat_g" },
  { label: "Carbs", key: "carbs_g" },
  { label: "Fiber", key: "fiber_g" },
  { label: "Sugar", key: "sugar_g" },
  { label: "Sodium", key: "sodium_mg" },
  { label: "Cholesterol", key: "cholesterol_mg" },
];

interface NutritionCardProps {
  food: FoodItem;
}

export function NutritionCard({ food }: NutritionCardProps) {
  const units: Record<string, string> = {
    calories_kcal: "kcal",
    protein_g: "g",
    fat_g: "g",
    carbs_g: "g",
    fiber_g: "g",
    sugar_g: "g",
    sodium_mg: "mg",
    cholesterol_mg: "mg",
  };
  return (
    <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-[#1e3a4c]">
              {food.name_en}
            </CardTitle>
            <p className="text-sm font-medium text-[#5c7a8c]">
              {food.serving_size}
            </p>
          </div>
          <Badge
            className={
              food.source === "MyFCD"
                ? "bg-[#1abc9c] text-white hover:bg-[#1abc9c]"
                : "border-2 border-[#1abc9c] bg-white text-[#1abc9c]"
            }
          >
            {food.source}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {rows.map((row) => (
            <div
              key={String(row.key)}
              className="rounded-xl bg-[#e8f8f5] p-3 text-center"
            >
              <p className="text-xs font-medium text-[#5c7a8c]">{row.label}</p>
              <p className="text-lg font-bold text-[#1e3a4c]">
                {food[row.key] as number}{" "}
                <span className="text-sm font-medium text-[#5c7a8c]">
                  {units[row.key]}
                </span>
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
