import { RiskLevel, riskColor, riskLabel } from "@/lib/health-thresholds";
import { Card, CardContent } from "@/components/ui/card";

interface HealthMarkerCardProps {
  label: string;
  value: number | string | null;
  unit: string;
  risk: RiskLevel | null;
}

export function HealthMarkerCard({
  label,
  value,
  unit,
  risk,
}: HealthMarkerCardProps) {
  const display = value === null || value === undefined ? "-" : `${value}`;
  return (
    <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-[#5c7a8c]">{label}</p>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-[#1e3a4c]">
            {display}{" "}
            <span className="text-sm font-medium text-[#5c7a8c]">{unit}</span>
          </span>
          {risk && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskColor(
                risk
              )}`}
            >
              {riskLabel(risk)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
