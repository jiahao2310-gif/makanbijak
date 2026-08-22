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
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-2xl font-semibold">
            {display}{" "}
            <span className="text-sm font-normal text-gray-500">{unit}</span>
          </span>
          {risk && (
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${riskColor(
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
