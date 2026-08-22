import { Card, CardContent } from "@/components/ui/card";

interface MealCardProps {
  label: string;
  meal: { meal: string; calories: number; swap_from: string };
}

export function MealCard({ label, meal }: MealCardProps) {
  if (!meal) return null;
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-green-600">
            {label}
          </span>
          <span className="text-sm font-semibold">{meal.calories} kcal</span>
        </div>
        <p className="text-base font-medium">{meal.meal}</p>
        {meal.swap_from && (
          <p className="mt-1 text-sm text-gray-500">
            Swapped from: {meal.swap_from}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
