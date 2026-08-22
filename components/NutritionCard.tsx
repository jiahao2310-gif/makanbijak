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
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{food.name_en}</CardTitle>
            <p className="text-sm text-gray-500">{food.serving_size}</p>
          </div>
          <Badge variant={food.source === "MyFCD" ? "default" : "outline"}>
            {food.source}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {rows.map((row) => (
            <div
              key={String(row.key)}
              className="rounded-lg bg-gray-50 p-3 text-center"
            >
              <p className="text-xs text-gray-500">{row.label}</p>
              <p className="text-lg font-semibold">
                {food[row.key] as number} {units[row.key]}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
