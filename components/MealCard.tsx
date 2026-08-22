import { Card, CardContent } from "@/components/ui/card";

interface MealCardProps {
  label: string;
  meal: { meal: string; calories: number; swap_from: string };
}

export function MealCard({ label, meal }: MealCardProps) {
  if (!meal) return null;
  return (
    <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-[#e8f8f5] px-2.5 py-1 text-xs font-bold uppercase text-[#1abc9c]">
            {label}
          </span>
          <span className="rounded-full bg-[#fdecea] px-2.5 py-1 text-sm font-bold text-[#e74c3c]">
            {meal.calories} kcal
          </span>
        </div>
        <p className="text-base font-semibold text-[#1e3a4c]">{meal.meal}</p>
        {meal.swap_from && (
          <p className="mt-1 text-sm text-[#5c7a8c]">
            Swapped from: {meal.swap_from}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
