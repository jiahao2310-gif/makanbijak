"use client";

import { useState } from "react";
import { useHealthProfile, emptyProfile } from "@/hooks/useHealthProfile";
import { HealthProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthMarkerCard } from "@/components/HealthMarkerCard";
import {
  getFastingGlucoseRisk,
  getHbA1cRisk,
  getTotalCholesterolRisk,
  getBloodPressureRisk,
  getBmiRisk,
} from "@/lib/health-thresholds";

const fields = [
  { key: "blood_glucose_fasting" as const, label: "Fasting Glucose", unit: "mmol/L" },
  { key: "hba1c" as const, label: "HbA1c", unit: "%" },
  { key: "total_cholesterol" as const, label: "Total Cholesterol", unit: "mmol/L" },
  { key: "hdl" as const, label: "HDL", unit: "mmol/L" },
  { key: "ldl" as const, label: "LDL", unit: "mmol/L" },
  { key: "triglycerides" as const, label: "Triglycerides", unit: "mmol/L" },
  { key: "blood_pressure_systolic" as const, label: "BP Systolic", unit: "mmHg" },
  { key: "blood_pressure_diastolic" as const, label: "BP Diastolic", unit: "mmHg" },
  { key: "bmi" as const, label: "BMI", unit: "kg/m²" },
  { key: "weight_kg" as const, label: "Weight", unit: "kg" },
  { key: "height_cm" as const, label: "Height", unit: "cm" },
];

export default function HealthPage() {
  const { profile, loaded, saveProfile } = useHealthProfile();
  const [draft, setDraft] = useState<HealthProfile | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [extracting, setExtracting] = useState(false);

  const active = draft || profile || emptyProfile;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const res = await fetch("/api/parse-health-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: base64 }),
      });
      const data = await res.json();
      setDraft(data.extracted_markers || { ...emptyProfile });
      setShowEditor(true);
      setExtracting(false);
    };
    reader.readAsDataURL(file);
  };

  const updateField = (key: keyof HealthProfile, value: string) => {
    setDraft((prev) => {
      const base = prev || { ...emptyProfile };
      if (key === "conditions") {
        return { ...base, [key]: value.split(",").map((s) => s.trim()) };
      }
      const num = parseFloat(value);
      return { ...base, [key]: value === "" ? null : (isNaN(num) ? value : num) };
    });
  };

  const onSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const target = draft || profile || emptyProfile;
      await saveProfile(target);
      setDraft(null);
      setShowEditor(false);
      setMessage("Health profile saved.");
    } catch (err) {
      setMessage((err as Error).message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-[#e74c3c] to-[#1e3a4c] p-5 text-white shadow-md">
        <h1 className="text-2xl font-bold">My Health</h1>
        <p className="mt-1 text-sm opacity-90">
          Upload your report and review your markers.
        </p>
      </div>

      <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-[#1e3a4c]">
            Upload Health Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFile}
            className="block w-full rounded-xl border border-[var(--border)] p-3 text-sm file:rounded-full file:border-0 file:bg-[#e74c3c] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          {extracting && (
            <p className="mt-2 text-sm font-medium text-[#1abc9c]">Extracting…</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <HealthMarkerCard
          label="Fasting Glucose"
          value={active.blood_glucose_fasting}
          unit="mmol/L"
          risk={getFastingGlucoseRisk(active.blood_glucose_fasting)}
        />
        <HealthMarkerCard
          label="HbA1c"
          value={active.hba1c}
          unit="%"
          risk={getHbA1cRisk(active.hba1c)}
        />
        <HealthMarkerCard
          label="Total Cholesterol"
          value={active.total_cholesterol}
          unit="mmol/L"
          risk={getTotalCholesterolRisk(active.total_cholesterol)}
        />
        <HealthMarkerCard
          label="Blood Pressure"
          value={
            active.blood_pressure_systolic && active.blood_pressure_diastolic
              ? `${active.blood_pressure_systolic}/${active.blood_pressure_diastolic}`
              : null
          }
          unit="mmHg"
          risk={getBloodPressureRisk(
            active.blood_pressure_systolic,
            active.blood_pressure_diastolic
          )}
        />
        <HealthMarkerCard
          label="BMI"
          value={active.bmi}
          unit="kg/m²"
          risk={getBmiRisk(active.bmi)}
        />
      </div>

      {!showEditor ? (
        <Button
          onClick={() => setShowEditor(true)}
          variant="outline"
          className="w-full rounded-full border-[#1abc9c] text-[#1abc9c] hover:bg-[#e8f8f5]"
        >
          Manually edit information
        </Button>
      ) : (
        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-[#1e3a4c]">
              Edit Markers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                <Label htmlFor={f.key} className="text-[#1abc9c]">
                  {f.label}
                </Label>
                <Input
                  id={f.key}
                  type="number"
                  value={
                    active[f.key] === null || active[f.key] === undefined
                      ? ""
                      : String(active[f.key])
                  }
                  onChange={(e) => updateField(f.key, e.target.value)}
                  placeholder={f.unit}
                  className="mt-1 rounded-xl border-[var(--border)] bg-white"
                />
              </div>
            ))}
            <div>
              <Label htmlFor="conditions" className="text-[#1abc9c]">
                Conditions (comma-separated)
              </Label>
              <Input
                id="conditions"
                value={active.conditions.join(", ")}
                onChange={(e) => updateField("conditions", e.target.value)}
                placeholder="e.g. pre-diabetic, high cholesterol"
                className="mt-1 rounded-xl border-[var(--border)] bg-white"
              />
            </div>

            {message && (
              <p
                className={`text-sm font-medium ${
                  message.includes("saved")
                    ? "text-[#1abc9c]"
                    : "text-[#e74c3c]"
                }`}
              >
                {message}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                onClick={onSave}
                disabled={saving}
                className="w-full rounded-full bg-[#e74c3c] text-white shadow-md hover:bg-[#c0392b]"
              >
                {saving ? "Saving…" : "Save Health Profile"}
              </Button>
              <Button
                onClick={() => {
                  setShowEditor(false);
                  setDraft(null);
                  setMessage("");
                }}
                variant="outline"
                className="rounded-full border-[#5c7a8c] text-[#5c7a8c] hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
