export type RiskLevel = "normal" | "borderline" | "high";

export function getFastingGlucoseRisk(value: number | null): RiskLevel | null {
  if (value === null) return null;
  if (value < 5.6) return "normal";
  if (value <= 6.9) return "borderline";
  return "high";
}

export function getHbA1cRisk(value: number | null): RiskLevel | null {
  if (value === null) return null;
  if (value < 5.7) return "normal";
  if (value <= 6.4) return "borderline";
  return "high";
}

export function getTotalCholesterolRisk(value: number | null): RiskLevel | null {
  if (value === null) return null;
  if (value < 5.2) return "normal";
  if (value <= 6.2) return "borderline";
  return "high";
}

export function getBloodPressureRisk(
  systolic: number | null,
  diastolic: number | null
): RiskLevel | null {
  if (systolic === null || diastolic === null) return null;
  if (systolic < 120 && diastolic < 80) return "normal";
  if (systolic >= 140 || diastolic >= 90) return "high";
  return "borderline";
}

export function getBmiRisk(value: number | null): RiskLevel | null {
  if (value === null) return null;
  if (value >= 18.5 && value <= 22.9) return "normal";
  if (value <= 27.4) return "borderline";
  return "high";
}

export function riskColor(level: RiskLevel | null): string {
  switch (level) {
    case "normal":
      return "text-green-600 bg-green-50";
    case "borderline":
      return "text-amber-600 bg-amber-50";
    case "high":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-500 bg-gray-50";
  }
}

export function riskLabel(level: RiskLevel | null): string {
  switch (level) {
    case "normal":
      return "Normal";
    case "borderline":
      return "Borderline";
    case "high":
      return "High Risk";
    default:
      return "Unknown";
  }
}
